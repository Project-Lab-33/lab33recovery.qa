import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase/route';
import { getSecret } from '@/lib/secrets';
import { createRateLimiter, getRequestIP } from '@/lib/rateLimit';

let _resend: Resend | null = null;
async function getResend() {
    if (!_resend) {
        const apiKey = await getSecret('resend_api_key');
        _resend = new Resend(apiKey);
    }
    return _resend;
}

// Per-route rate limiter (5 requests/min)
const isRateLimited = createRateLimiter(5);

export async function POST(request: NextRequest) {
    try {
        // Rate limit check
        const ip = getRequestIP(request);
        if (await isRateLimited(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

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

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { to, subject, html } = body;

        if (!to || typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            return NextResponse.json({ error: 'A valid recipient email is required' }, { status: 400 });
        }

        if (!subject || typeof subject !== 'string') {
            return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
        }

        if (!html || typeof html !== 'string') {
            return NextResponse.json({ error: 'HTML body is required' }, { status: 400 });
        }

        const resend = await getResend();

        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['email_from_name', 'email_from_address']);

        const settingsMap = new Map((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
        const fromName = settingsMap.get('email_from_name') || 'The Lab 33';
        const rawFromAddress = settingsMap.get('email_from_address') || 'marketing@lab33recovery.qa';
        const fromAddress = rawFromAddress.endsWith('@lab33recovery.qa') ? rawFromAddress : 'marketing@lab33recovery.qa';

        const testSubject = `[TEST] ${subject}`;

        const recipient = to.trim().toLowerCase();

        const { data: resendData, error: resendError } = await resend.emails.send({
            from: `${fromName} <${fromAddress}>`,
            to: [recipient],
            subject: testSubject,
            html,
        });

        if (resendError) {
            console.error('[send-test-email] Resend Error:', JSON.stringify(resendError));
            // Log the failed test email — it still counts against Resend quota
            try {
                await supabase.from('email_logs').insert({
                    recipient_email: recipient,
                    recipient_name: 'Test',
                    template: 'test',
                    subject: testSubject,
                    status: 'failed',
                    resend_id: null,
                    error_message: resendError.message || 'Unknown error',
                });
            } catch (logErr) {
                console.warn('[send-test-email] Failed log insert:', logErr);
            }
            return NextResponse.json({ error: 'Failed to send test email: ' + (resendError.message || 'Unknown error') }, { status: 400 });
        }

        // Verify Resend actually returned an ID (defensive check)
        if (!resendData?.id) {
            console.error('[send-test-email] Resend returned no ID. Response:', JSON.stringify(resendData));
            return NextResponse.json({ error: 'Email service returned an empty response — check Resend dashboard' }, { status: 502 });
        }

        // Log the successful test email
        try {
            await supabase.from('email_logs').insert({
                recipient_email: recipient,
                recipient_name: 'Test',
                template: 'test',
                subject: testSubject,
                status: 'sent',
                resend_id: resendData.id,
            });
        } catch (logErr) {
            console.warn('[send-test-email] Log insert failed:', logErr);
        }

        return NextResponse.json({ success: true, id: resendData.id });
    } catch (error) {
        console.error('[send-test-email] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
