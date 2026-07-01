import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';
import { hasPermission, type Resource, type Action } from '@/lib/permissions';

export async function createAdminClient(request?: NextRequest) {
    const authHeader = request?.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
        const { createClient } = await import('@supabase/supabase-js');
        const token = authHeader.split(' ')[1];
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
    }

    // Default to cookie-based auth (Server Actions / standard SSR)
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignore header-already-sent errors
                    }
                },
            },
        }
    );
}

export async function getAdminSession(request?: NextRequest) {
    const supabase = await createAdminClient(request);

    // getUser() validates the JWT with Supabase (getSession() does not)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
        return { user: null, supabase, error: 'Unauthorized' };
    }

    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (adminError || !adminUser) {
        return { user: null, supabase, error: 'Admin profile not found' };
    }

    if (!adminUser.is_active) {
        return { user: null, supabase, error: 'Account deactivated' };
    }

    return { user: adminUser, supabase, error: null };
}

export async function verifyPermission(
    resource: Resource,
    action: Action,
    request?: NextRequest
) {
    const { user, supabase, error } = await getAdminSession(request);

    if (error || !user) return { authorized: false, error, supabase, user: null };

    const authorized = hasPermission(
        user.role,
        resource,
        action,
        user.permissions_override
    );

    return {
        authorized,
        user,
        supabase,
        error: authorized ? null : `Forbidden: Missing ${action} permission for ${resource}`
    };
}
