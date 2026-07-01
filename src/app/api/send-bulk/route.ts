import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase/route';
import { getSecret } from '@/lib/secrets';
import { renderEmailHtml } from '@/components/admin/pages/email/emailRenderer';
import { EmailSections } from '@/components/admin/pages/email/types';

let _resend: Resend | null = null;
async function getResend() {
    if (!_resend) {
        const apiKey = await getSecret('resend_api_key');
        _resend = new Resend(apiKey);
    }
    return _resend;
}

// Replace {{variables}} in text
function replaceVariables(text: string, vars: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}

// Replace variables in sections_json body blocks
function replaceInSections(sections: EmailSections, vars: Record<string, string>): EmailSections {
    return {
        ...sections,
        heading: {
            line1: replaceVariables(sections.heading.line1, vars),
            accent: replaceVariables(sections.heading.accent, vars),
        },
        body: sections.body.map(block => {
            if (block.type === 'divider' || block.type === 'image' || block.type === 'image-grid') return block;
            return { ...block, text: replaceVariables(block.text, vars) };
        }),
    };
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAuthenticatedClient(request);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        if (!body || !body.template_id) {
            return NextResponse.json({ error: 'template_id is required' }, { status: 400 });
        }

        const { template_id, audience = 'waitlist' } = body;

        const { data: template, error: tplError } = await supabase
            .from('email_templates')
            .select('*')
            .eq('id', template_id)
            .single();

        if (tplError || !template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        let recipients: { first_name: string; last_name: string; email: string }[] = [];

        if (audience === 'waitlist') {
            const { data, error } = await supabase
                .from('waitlist')
                .select('first_name, last_name, email');
            if (error) {
                return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
            }
            recipients = data || [];
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
        }

        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['email_from_name', 'email_from_address']);

        const settingsMap = new Map((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
        const fromName = settingsMap.get('email_from_name') || 'The Lab 33';
        const rawFromAddress = settingsMap.get('email_from_address') || 'marketing@lab33recovery.qa';
        const fromAddress = rawFromAddress.endsWith('@lab33recovery.qa') ? rawFromAddress : 'marketing@lab33recovery.qa';

        const resend = await getResend();

        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const recipient of recipients) {
            const vars: Record<string, string> = {
                first_name: recipient.first_name || 'there',
                last_name: recipient.last_name || '',
                full_name: `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'there',
                email: recipient.email,
                company_name: 'The Lab 33',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            };

            // Build HTML
            let html: string;
            if (template.sections_json) {
                const personalizedSections = replaceInSections(template.sections_json as EmailSections, vars);
                html = renderEmailHtml(personalizedSections);
            } else {
                html = replaceVariables(template.body_html || '', vars);
            }

            const subject = replaceVariables(template.subject, vars);

            try {
                const { data: resendData, error: resendError } = await resend.emails.send({
                    from: `${fromName} <${fromAddress}>`,
                    to: [recipient.email.trim().toLowerCase()],
                    subject,
                    html,
                });

                if (resendError) {
                    failed++;
                    errors.push(`${recipient.email}: ${resendError.message}`);
                    // Log failure
                    await supabase.from('email_logs').insert({
                        recipient_email: recipient.email,
                        recipient_name: `${recipient.first_name} ${recipient.last_name}`.trim(),
                        template: 'bulk_campaign',
                        template_id: template.id,
                        subject,
                        status: 'failed',
                        error_message: resendError.message || 'Unknown error',
                    });
                } else {
                    sent++;
                    // Log success
                    await supabase.from('email_logs').insert({
                        recipient_email: recipient.email,
                        recipient_name: `${recipient.first_name} ${recipient.last_name}`.trim(),
                        template: 'bulk_campaign',
                        template_id: template.id,
                        subject,
                        status: 'sent',
                        resend_id: resendData?.id || null,
                    });
                }

                // Small delay between sends (100ms) to avoid hammering Resend
                await new Promise(r => setTimeout(r, 100));
            } catch (err) {
                failed++;
                const msg = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`${recipient.email}: ${msg}`);
            }
        }

        return NextResponse.json({
            success: true,
            total: recipients.length,
            sent,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('[send-bulk] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
