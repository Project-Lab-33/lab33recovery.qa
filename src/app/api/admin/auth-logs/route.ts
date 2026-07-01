import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';

// GET — Fetch auth (login/logout) logs with search, filters, and pagination
export async function GET(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search')?.trim() || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        const offset = (page - 1) * limit;

        // Auth logs are activity logs filtered to login/logout actions
        let query = supabase
            .from('admin_activity_logs')
            .select('*', { count: 'exact' })
            .in('action', ['login', 'logout'])
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filters
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        // Text search (actor_name)
        if (search) {
            query = query.ilike('actor_name', `%${search}%`);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        // Fetch user list for filter dropdown
        const { data: users } = await supabase
            .from('admin_users')
            .select('id, name, email, avatar_url, last_sign_in_at, is_active')
            .order('name');

        return NextResponse.json({
            logs: data || [],
            total: count || 0,
            page,
            limit,
            users: users || [],
        });
    } catch (error) {
        console.error('[AuthLogs GET]', error);
        return NextResponse.json({ error: 'Failed to fetch auth logs' }, { status: 500 });
    }
}
