import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { logAdminAction, getClientIP } from '@/lib/activityLog';

// POST — Log a login or logout auth event
export async function POST(req: NextRequest) {
    try {
        const { user, supabase, error: authError } = await getAdminSession(req);
        if (!user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });

        const { action } = await req.json();

        if (!['login', 'logout'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await logAdminAction({
            supabase,
            actor: { id: user.id, name: user.name || user.email },
            action,
            resourceType: 'user',
            resourceId: user.id,
            resourceLabel: user.email,
            details: {
                user_agent: req.headers.get('user-agent') || undefined,
            },
            ipAddress: getClientIP(req),
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[AuthLog POST]', error);
        return NextResponse.json({ error: 'Failed to log auth event' }, { status: 500 });
    }
}
