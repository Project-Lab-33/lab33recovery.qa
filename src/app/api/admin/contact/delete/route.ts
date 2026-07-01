import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Unauthenticated client — only used to verify the token
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function DELETE(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        if (!body?.message_id) {
            return NextResponse.json({ error: "message_id is required" }, { status: 400 });
        }

        // Delete using authed client (respects RLS)
        const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { error } = await authedClient
            .from("contact_messages")
            .delete()
            .eq("id", body.message_id);

        if (error) {
            console.error("[Contact Delete] Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Contact Delete] Internal error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
