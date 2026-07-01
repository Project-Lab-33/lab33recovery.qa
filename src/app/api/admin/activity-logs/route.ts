import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';

// GET — Fetch activity logs with search, filters, and pagination
export async function GET(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search')?.trim() || '';
        const action = searchParams.get('action') || '';
        const resourceType = searchParams.get('resource_type') || '';
        const actorId = searchParams.get('actor_id') || '';
        const dateFrom = searchParams.get('date_from') || '';
        const dateTo = searchParams.get('date_to') || '';

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('admin_activity_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filters
        if (action) query = query.eq('action', action);
        if (resourceType) query = query.eq('resource_type', resourceType);
        if (actorId) query = query.eq('actor_id', actorId);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        // Text search (actor_name or resource_label)
        if (search) {
            query = query.or(`actor_name.ilike.%${search}%,resource_label.ilike.%${search}%`);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        // Fetch unique actors for filter dropdown
        const { data: actors } = await supabase
            .from('admin_users')
            .select('id, name, avatar_url')
            .eq('is_active', true)
            .order('name');

        return NextResponse.json({
            logs: data || [],
            total: count || 0,
            page,
            limit,
            actors: actors || [],
        });
    } catch (error) {
        console.error('[ActivityLogs GET]', error);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
}
