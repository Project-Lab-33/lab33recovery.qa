import { SupabaseClient } from '@supabase/supabase-js';

export type ActivityAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'status_change'
    | 'export'
    | 'login'
    | 'logout'
    | 'toggle'
    | 'send'
    | 'publish'
    | 'schedule';

export type ActivityResourceType =
    | 'waitlist'
    | 'applicant'
    | 'position'
    | 'post'
    | 'email_template'
    | 'email_automation'
    | 'email'
    | 'settings'
    | 'user'
    | 'ai'

export interface LogActivityParams {
    supabase: SupabaseClient;
    actor: { id: string; name: string };
    action: ActivityAction;
    resourceType: ActivityResourceType;
    resourceId?: string;
    resourceLabel?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
}

/**
 * Logs an admin activity. Fire-and-forget — errors are swallowed
 * so they never block the main API response.
 */
export async function logAdminAction({
    supabase,
    actor,
    action,
    resourceType,
    resourceId,
    resourceLabel,
    details,
    ipAddress,
}: LogActivityParams): Promise<void> {
    try {
        const { error } = await supabase.from('admin_activity_logs').insert({
            actor_id: actor.id,
            actor_name: actor.name,
            action,
            resource_type: resourceType,
            resource_id: resourceId || null,
            resource_label: resourceLabel || null,
            details: details || {},
            ip_address: ipAddress || null,
        });
        if (error) {
            console.error('[ActivityLog] Supabase insert error:', error.message, error.details, error.hint);
        }
    } catch (err) {
        // Silently swallow — never block the caller
        console.error('[ActivityLog] Failed to write log:', err);
    }
}

/**
 * Extracts the client IP from a NextRequest.
 * Falls back through common proxy headers.
 */
export function getClientIP(request: Request): string | undefined {
    const headers = request.headers;
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        undefined
    );
}
