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
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace(/bearer /i, "");
    const { data: { user: callingUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !callingUser) throw new Error("Unauthorized: " + (authError?.message || "Invalid token"));

    const { data: adminProfile } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", callingUser.id)
      .single();

    if (!adminProfile || !adminProfile.is_active || !["admin", "owner"].includes(adminProfile.role)) {
      throw new Error("Forbidden: Only administrators can reset passwords");
    }

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) throw new Error("userId and newPassword are required");
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
