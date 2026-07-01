import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase/route';
import { renderEmailHtml } from '@/components/admin/pages/email/emailRenderer';
import { getSecret } from '@/lib/secrets';
import { createRateLimiter, getRequestIP } from '@/lib/rateLimit';
import { isValidEmail, replaceVariables, isOriginAllowed } from '@/lib/email';

let _resend: Resend | null = null;
async function getResend() {
    if (!_resend) {
        const apiKey = await getSecret('resend_api_key');
        _resend = new Resend(apiKey);
    }
    return _resend;
}

// Supabase admin client for reading settings (server-side only)
const supabase = createRouteClient();

// Per-route rate limiter (3 requests/min)
const isRateLimited = createRateLimiter(3);

export async function POST(request: NextRequest) {
    try {
        const ip = getRequestIP(request);
        if (await isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        if (!isOriginAllowed(request)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json().catch(() => null);

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { email, firstName } = body;

        if (!email || typeof email !== 'string' || !isValidEmail(email)) {
            return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
        }

        if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0 || firstName.length > 100) {
            return NextResponse.json({ error: 'A valid first name is required' }, { status: 400 });
        }

        // Sanitize inputs
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedName = firstName.trim().slice(0, 100);

        const { data: automation } = await supabase
            .from('email_automations')
            .select('*, template:email_templates(*)')
            .eq('trigger_event', 'waitlist_signup')
            .eq('is_active', true)
            .single();

        if (!automation || !automation.template) {
            // No active automation or no linked template — skip silently
            await supabase.from('email_logs').insert({
                recipient_email: sanitizedEmail,
                recipient_name: sanitizedName,
                template: 'waitlist_signup',
                subject: 'Waitlist Confirmation - The Lab 33',
                status: 'skipped',
                automation_id: automation?.id || null,
            });
            return NextResponse.json({ success: true, skipped: true });
        }

        const template = automation.template;

        const resend = await getResend();

        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['email_from_name', 'email_from_address']);

        const settingsMap = new Map((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
        const fromName = settingsMap.get('email_from_name') || 'The Lab 33';
        const rawFromAddress = settingsMap.get('email_from_address') || 'marketing@lab33recovery.qa';
        const fromAddress = rawFromAddress.endsWith('@lab33recovery.qa') ? rawFromAddress : 'marketing@lab33recovery.qa';

        const variables: Record<string, string> = {
            first_name: sanitizedName,
            email: sanitizedEmail,
            full_name: sanitizedName,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            company: 'The Lab 33',
        };

        // Use body_html if available, otherwise render from sections_json
        let html: string;
        if (template.body_html && template.body_html.trim().length > 0) {
            html = template.body_html;
        } else if (template.sections_json) {
            html = renderEmailHtml(template.sections_json);
        } else {
            console.error('Template has no body_html or sections_json');
            return NextResponse.json({ error: 'Template has no content' }, { status: 500 });
        }

        html = replaceVariables(html, variables);
        const emailSubject = replaceVariables(template.subject || 'Waitlist Confirmation - The Lab 33', variables);

        if (automation.delay_minutes > 0) {
            // delay not yet implemented — currently sends immediately
        }

        const { data: resendData, error: resendError } = await resend.emails.send({
            from: `${fromName} <${fromAddress}>`,
            to: [sanitizedEmail],
            subject: emailSubject,
            html,
        });

        if (resendError) {
            console.error("Resend Error:", resendError);
            await supabase.from('email_logs').insert({
                recipient_email: sanitizedEmail,
                recipient_name: sanitizedName,
                template: 'waitlist_signup',
                template_id: template.id,
                automation_id: automation.id,
                subject: emailSubject,
                status: 'failed',
                error_message: typeof resendError === 'object' ? JSON.stringify(resendError) : String(resendError),
            });
            return NextResponse.json({ error: "Failed to send email" }, { status: 400 });
        }

        await supabase.from('email_logs').insert({
            recipient_email: sanitizedEmail,
            recipient_name: sanitizedName,
            template: 'waitlist_signup',
            template_id: template.id,
            automation_id: automation.id,
            subject: emailSubject,
            status: 'sent',
            resend_id: resendData?.id || null,
        });

        await supabase.from('email_automations')
            .update({
                trigger_count: (automation.trigger_count || 0) + 1,
                last_triggered_at: new Date().toISOString(),
            })
            .eq('id', automation.id);

        // Admin notification is auto-created by database trigger (trg_notify_new_waitlist)

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Internal Email Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
