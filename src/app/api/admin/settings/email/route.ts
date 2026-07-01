import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { getSecret } from '@/lib/secrets';
import { logAdminAction, getClientIP } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
    try {
        const { supabase, user, error: authError } = await getAdminSession(request);
        if (!user) {
            return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
        }

        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value, label, description, updated_at')
            .in('key', ['email_from_name', 'email_from_address']);

        const settingsMap: Record<string, { value: string; label: string | null; description: string | null; updated_at: string }> = {};
        (settings || []).forEach((s: { key: string; value: string; label: string | null; description: string | null; updated_at: string }) => {
            settingsMap[s.key] = { value: s.value, label: s.label, description: s.description, updated_at: s.updated_at };
        });

        const resendKey = await getSecret('resend_api_key').catch(() => null);
        const apiKeyConfigured = !!resendKey;
        let resendStatus: 'connected' | 'error' | 'not_configured' = 'not_configured';
        let apiKeyPreview = '';

        if (apiKeyConfigured && resendKey) {
            apiKeyPreview = resendKey.length > 12
                ? `${resendKey.slice(0, 8)}${'•'.repeat(Math.min(resendKey.length - 12, 20))}${resendKey.slice(-4)}`
                : '•'.repeat(resendKey.length);

            try {
                // Health check — POST /emails with empty body
                // 422 = valid key (request body validation failed), 401/403 = bad key
                const ping = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });

                if (ping.status === 401 || ping.status === 403) {
                    resendStatus = 'error';
                } else {
                    resendStatus = 'connected';
                }
            } catch {
                resendStatus = 'error';
            }
        }

        let domainInfo: {
            id: string;
            name: string;
            status: string;
            region: string;
            created_at: string;
            records: Array<{ type: string; name: string; value: string; status: string; priority?: number }>;
        } | null = null;

        if (apiKeyConfigured && resendStatus === 'connected') {
            try {
                const domainRes = await fetch('https://api.resend.com/domains', {
                    headers: { 'Authorization': `Bearer ${resendKey}` },
                });
                if (domainRes.ok) {
                    const domainData = await domainRes.json();
                    const domains = domainData?.data || [];
                    // Find our primary domain
                    const primary = domains.find((d: { name: string }) => d.name === 'lab33recovery.qa') || domains[0];
                    if (primary) {
                        // Fetch detailed domain info with DNS records
                        const detailRes = await fetch(`https://api.resend.com/domains/${primary.id}`, {
                            headers: { 'Authorization': `Bearer ${resendKey}` },
                        });
                        if (detailRes.ok) {
                            const detail = await detailRes.json();
                            domainInfo = {
                                id: detail.id,
                                name: detail.name,
                                status: detail.status,
                                region: detail.region,
                                created_at: detail.created_at,
                                records: detail.records || [],
                            };
                        }
                    }
                }
            } catch (err) {
                console.warn('[settings/email] Failed to fetch domain info:', err);
            }
        }

        // Resend billing cycle resets on the 25th of each month (signup anniversary).
        // We align our counting window to match: 25th → 25th.
        const now = new Date();
        const BILLING_CYCLE_DAY = 25;

        // Calculate current billing cycle window (25th to 25th)
        let cycleStart: Date;
        let prevCycleStart: Date;
        let prevCycleEnd: Date;

        if (now.getDate() >= BILLING_CYCLE_DAY) {
            // We're past the 25th — cycle started this month's 25th
            cycleStart = new Date(now.getFullYear(), now.getMonth(), BILLING_CYCLE_DAY);
            prevCycleStart = new Date(now.getFullYear(), now.getMonth() - 1, BILLING_CYCLE_DAY);
            prevCycleEnd = new Date(now.getFullYear(), now.getMonth(), BILLING_CYCLE_DAY - 1, 23, 59, 59);
        } else {
            // Before the 25th — cycle started LAST month's 25th
            cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, BILLING_CYCLE_DAY);
            prevCycleStart = new Date(now.getFullYear(), now.getMonth() - 2, BILLING_CYCLE_DAY);
            prevCycleEnd = new Date(now.getFullYear(), now.getMonth() - 1, BILLING_CYCLE_DAY - 1, 23, 59, 59);
        }

        // Today's count for daily limit tracking
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [
            { count: cycleCount },
            { count: prevCycleCount },
            { count: todayCount },
            { count: totalCount },
            { count: totalFailed },
            { data: dailyLogs },
            { data: automationsData },
            { count: templatesCount },
        ] = await Promise.all([
            // Current billing cycle count
            supabase.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', cycleStart.toISOString()),
            // Previous billing cycle count
            supabase.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', prevCycleStart.toISOString())
                .lte('created_at', prevCycleEnd.toISOString()),
            // Today's count
            supabase.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', todayStart),
            // Total count (all-time)
            supabase.from('email_logs').select('*', { count: 'exact', head: true }),
            // Total failed (all-time)
            supabase.from('email_logs').select('*', { count: 'exact', head: true })
                .eq('status', 'failed'),
            // Daily logs for last 30 days (for chart + breakdown)
            supabase.from('email_logs')
                .select('template, status, created_at')
                .gte('created_at', thirtyDaysAgo)
                .order('created_at', { ascending: true }),
            // Automations with template info
            supabase.from('email_automations')
                .select('id, name, is_active, trigger_event, trigger_count, last_triggered_at, template:email_templates(name)')
                .order('created_at', { ascending: false }),
            // Templates count
            supabase.from('email_templates').select('*', { count: 'exact', head: true }),
        ]);

        const dailyVolume: Record<string, { date: string; total: number; waitlist: number; application: number; welcome: number; test: number; other: number }> = {};
        const templateBreakdown: Record<string, number> = {};

        // Initialize all 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            dailyVolume[key] = { date: key, total: 0, waitlist: 0, application: 0, welcome: 0, test: 0, other: 0 };
        }

        (dailyLogs || []).forEach((log: { template: string; status: string; created_at: string }) => {
            const day = log.created_at.split('T')[0];
            if (dailyVolume[day]) {
                dailyVolume[day].total++;
                if (log.template === 'waitlist_signup') dailyVolume[day].waitlist++;
                else if (log.template === 'application_received') dailyVolume[day].application++;
                else if (log.template === 'welcome') dailyVolume[day].welcome++;
                else if (log.template === 'test') dailyVolume[day].test++;
                else dailyVolume[day].other++;
            }
            // Template breakdown
            const label = log.template || 'unknown';
            templateBreakdown[label] = (templateBreakdown[label] || 0) + 1;
        });

        // Calculate average daily volume (only count days with >0 emails)
        const activeDays = Object.values(dailyVolume).filter(d => d.total > 0);
        const avgDaily = activeDays.length > 0
            ? Math.round(activeDays.reduce((s, d) => s + d.total, 0) / activeDays.length)
            : 0;

        // Find peak day
        const peakDay = Object.values(dailyVolume).reduce((max, d) => d.total > max.total ? d : max, { date: '', total: 0 });

        // Success rate
        const total = totalCount || 0;
        const failed = totalFailed || 0;
        const successRate = total > 0 ? Math.round(((total - failed) / total) * 100 * 10) / 10 : 100;

        const quotaUsed = cycleCount || 0;

        return NextResponse.json({
            settings: settingsMap,
            resend: {
                status: resendStatus,
                apiKeyConfigured,
                apiKeyPreview,
                quotaUsed,
                quotaLimit: 3000,
                dailyUsed: todayCount || 0,
                dailyLimit: 100,
                cycleStartDay: BILLING_CYCLE_DAY,
            },
            usage: {
                thisMonth: cycleCount || 0,
                lastMonth: prevCycleCount || 0,
                total: totalCount || 0,
                totalFailed: totalFailed || 0,
                monthLabel: `${cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                successRate,
                avgDaily,
                peakDay: peakDay.date ? { date: peakDay.date, count: peakDay.total } : null,
            },
            domain: domainInfo,
            dailyVolume: Object.values(dailyVolume),
            templateBreakdown: Object.entries(templateBreakdown).map(([name, count]) => ({ name, count })),
            automations: {
                total: (automationsData || []).length,
                active: (automationsData || []).filter((a: { is_active: boolean }) => a.is_active).length,
                templates: templatesCount || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items: (automationsData || []).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    isActive: a.is_active,
                    triggerEvent: a.trigger_event,
                    triggerCount: a.trigger_count,
                    lastTriggeredAt: a.last_triggered_at,
                    templateName: Array.isArray(a.template) ? a.template[0]?.name || null : a.template?.name || null,
                })),
            },
        });
    } catch (error) {
        console.error('[settings/email] GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { supabase, user, error: authError } = await getAdminSession(request);
        if (!user) {
            return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { email_from_name, email_from_address } = body;

        // Validate sender name
        if (email_from_name !== undefined) {
            if (typeof email_from_name !== 'string' || email_from_name.trim().length === 0 || email_from_name.length > 100) {
                return NextResponse.json({ error: 'Invalid sender name' }, { status: 400 });
            }
        }

        // Validate sender address — must end with @lab33recovery.qa
        if (email_from_address !== undefined) {
            if (typeof email_from_address !== 'string' || !email_from_address.endsWith('@lab33recovery.qa')) {
                return NextResponse.json({ error: 'Sender address must use the verified domain (@lab33recovery.qa)' }, { status: 400 });
            }
            if (!/^[a-zA-Z0-9._%+-]+@lab33recovery\.qa$/.test(email_from_address)) {
                return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
            }
        }

        const now = new Date().toISOString();

        // Upsert each setting
        if (email_from_name !== undefined) {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'email_from_name',
                    value: email_from_name.trim(),
                    label: 'Sender Name',
                    description: 'The name that appears in the From field of outgoing emails',
                    updated_at: now,
                }, { onConflict: 'key' });
            if (error) throw error;
        }

        if (email_from_address !== undefined) {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'email_from_address',
                    value: email_from_address.trim().toLowerCase(),
                    label: 'Sender Address',
                    description: 'The email address used to send automated emails',
                    updated_at: now,
                }, { onConflict: 'key' });
            if (error) throw error;
        }

        await logAdminAction({ supabase, actor: { id: user.id, name: user.email || 'Admin' }, action: 'update', resourceType: 'settings', resourceLabel: 'Email settings', details: { email_from_name, email_from_address }, ipAddress: getClientIP(request) });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[settings/email] PUT error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
