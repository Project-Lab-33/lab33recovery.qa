import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized", message: "Missing Authorization header" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace(/bearer /i, "");
    const { data: { user: callingUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !callingUser) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        message: authError?.message || "Invalid session token",
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Role Check: Only 'admin' role has 'create' permission on users resource by default.
    const { data: adminProfile } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", callingUser.id)
      .single();

    if (!adminProfile || !adminProfile.is_active || adminProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden", message: "Only Admins can invite new users" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, name, role, avatar_url, permissions_override, password } = body;

    if (!email || !name || !role) {
      return new Response(JSON.stringify({ error: "Bad Request", message: "Email, name, and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing in admin_users
    const { data: existingAdmin } = await supabase.from("admin_users").select("id").eq("email", email).maybeSingle();

    // Check if user exists in auth.users by email
    const { data: authSearch } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authSearch.users.find(u => u.email === email);

    if (existingAdmin || existingAuthUser) {
        return new Response(JSON.stringify({ error: "Conflict", message: "A user with this email already exists" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Create User
    const finalPassword = password && password.length >= 8 ? password : (crypto.randomUUID().slice(0, 10) + "!A1a");
    const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { name }
    });

    if (createError) {
        return new Response(JSON.stringify({ error: "Auth Error", message: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Create or Update Profile
    const { error: profileError } = await supabase.from("admin_users").upsert({
      id: newAuthUser.user.id,
      email,
      name,
      role,
      is_active: true,
      avatar_url,
      permissions_override,
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(JSON.stringify({ error: "Database Error", message: "Failed to create profile: " + profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newAuthUser.user.id,
        email,
        name,
        temp_password: password ? null : finalPassword
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Error", message: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
