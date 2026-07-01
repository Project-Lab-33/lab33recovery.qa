import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';

// GET — Fetch system logs with search, filters, and pagination
export async function GET(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search')?.trim() || '';
        const level = searchParams.get('level') || '';
        const source = searchParams.get('source') || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('system_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filters
        if (level) query = query.eq('level', level);
        if (source) query = query.eq('source', source);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        // Text search (message or path)
        if (search) {
            query = query.or(`message.ilike.%${search}%,path.ilike.%${search}%`);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            logs: data || [],
            total: count || 0,
            page,
            limit,
        });
    } catch (error) {
        console.error('[SystemLogs GET]', error);
        return NextResponse.json({ error: 'Failed to fetch system logs' }, { status: 500 });
    }
}
