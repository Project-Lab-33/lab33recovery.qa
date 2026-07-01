// For auth-gated admin operations, use lib/auth/admin.ts instead.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Validated once at module load to fail fast instead of at request time.
function requireEnv(name: string): string {
    const val = process.env[name];
    if (!val) throw new Error(`Missing env: ${name}`);
    return val;
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

/**
 * Creates a Supabase client with the **anon key** for API routes
 * that should still respect RLS (e.g. user-scoped queries).
 */
export function createRouteClient(): SupabaseClient {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Creates a Supabase client with the **service role key** for
 * trusted server-to-server operations that bypass RLS (e.g. cron jobs).
 * Throws at call time if the service role key is missing.
 */
export function createServiceRoleClient(): SupabaseClient {
    const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    return createClient(SUPABASE_URL, serviceKey);
}

/**
 * Creates a Supabase client scoped to a user's JWT from the
 * request's Authorization header. For admin API routes that
 * need to operate as the calling user while respecting RLS.
 */
export function createAuthenticatedClient(req: NextRequest): SupabaseClient {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    return createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
}

/**
 * Returns the validated anon key string for use in custom headers
 * (e.g. Supabase Edge Function `apikey` header).
 */
export function getAnonKey(): string {
    return SUPABASE_ANON_KEY;
}
