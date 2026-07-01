import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { logAdminAction, getClientIP } from '@/lib/activityLog';

// GET — Fetch notifications (latest 50, unread first)
export async function GET(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Also get unread count
        const { count } = await supabase
            .from('admin_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        return NextResponse.json({ notifications: data || [], unreadCount: count || 0 });
    } catch (error) {
        console.error('[Notifications GET]', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// POST — Create a notification
export async function POST(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { type, title, message, metadata } = body;

        if (!type || !title || !message) {
            return NextResponse.json({ error: 'type, title, and message are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('admin_notifications')
            .insert({ type, title, message, metadata: metadata || {} })
            .select()
            .single();

        if (error) throw error;

        await logAdminAction({ supabase, actor: { id: user.id, name: user.name || user.email }, action: 'create', resourceType: 'settings', resourceId: data?.id, resourceLabel: title, details: { type }, ipAddress: getClientIP(req) });

        return NextResponse.json({ notification: data });
    } catch (error) {
        console.error('[Notifications POST]', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

// PATCH — Mark as read (single or all)
export async function PATCH(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, markAllRead } = body;

        if (markAllRead) {
            const { error } = await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('is_read', false);

            if (error) throw error;
            await logAdminAction({ supabase, actor: { id: user.id, name: user.name || user.email }, action: 'update', resourceType: 'settings', resourceLabel: 'Mark all notifications read', ipAddress: getClientIP(req) });
            return NextResponse.json({ success: true, message: 'All notifications marked as read' });
        }

        if (id) {
            const { error } = await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Provide id or markAllRead' }, { status: 400 });
    } catch (error) {
        console.error('[Notifications PATCH]', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

// DELETE — Delete a notification or clear all read
export async function DELETE(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const clearRead = searchParams.get('clearRead') === 'true';

        if (clearRead) {
            const { error } = await supabase
                .from('admin_notifications')
                .delete()
                .eq('is_read', true);

            if (error) throw error;
            await logAdminAction({ supabase, actor: { id: user.id, name: user.name || user.email }, action: 'delete', resourceType: 'settings', resourceLabel: 'Clear read notifications', ipAddress: getClientIP(req) });
            return NextResponse.json({ success: true, message: 'Read notifications cleared' });
        }

        if (id) {
            const { error } = await supabase
                .from('admin_notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await logAdminAction({ supabase, actor: { id: user.id, name: user.name || user.email }, action: 'delete', resourceType: 'settings', resourceId: id, resourceLabel: 'Notification', ipAddress: getClientIP(req) });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Provide id or clearRead=true' }, { status: 400 });
    } catch (error) {
        console.error('[Notifications DELETE]', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}

