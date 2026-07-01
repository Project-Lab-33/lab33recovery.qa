import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase/route';
import { getSecret } from '@/lib/secrets';
import { createRateLimiter, getRequestIP } from '@/lib/rateLimit';
import { isValidEmail, isOriginAllowed } from '@/lib/email';

let _resend: Resend | null = null;
async function getResend() {
  if (!_resend) {
    const apiKey = await getSecret('resend_api_key');
    _resend = new Resend(apiKey);
  }
  return _resend;
}

// 3 submissions per minute per IP
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

    const { name, email, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json({ error: 'A valid name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.length > 2000) {
      return NextResponse.json({ error: 'A message between 5 and 2000 characters is required' }, { status: 400 });
    }

    const safeName = name.trim().slice(0, 100);
    const safeEmail = email.trim().toLowerCase();
    const safeMessage = message.trim().slice(0, 2000);

    const supabase = createRouteClient();

    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['email_from_name', 'email_from_address']);

    const map = new Map((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
    const fromName = map.get('email_from_name') || 'The Lab 33';
    const fromAddress = map.get('email_from_address') || 'noreply@lab33recovery.qa';
    const toAddress = 'marketing@lab33recovery.qa'; // inbox where team reads messages

    const now = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Qatar',
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Contact Message</title></head>
<body style="margin:0;padding:0;background:#0a0908;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111009;border:1px solid rgba(212,175,119,0.15);max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(212,175,119,0.1);">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.45em;text-transform:uppercase;color:#8B7355;">The Lab 33</p>
            <h1 style="margin:0;font-size:22px;font-weight:400;color:#F5F5F0;letter-spacing:0.05em;">New Contact Message</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#8B7355;">From</p>
                  <p style="margin:0;font-size:15px;color:#F5F5F0;">${safeName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#8B7355;">Email</p>
                  <p style="margin:0;font-size:15px;color:#D4AF77;">
                    <a href="mailto:${safeEmail}" style="color:#D4AF77;text-decoration:none;">${safeEmail}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:32px;">
                  <p style="margin:0 0 8px;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#8B7355;">Message</p>
                  <div style="border-left:2px solid rgba(212,175,119,0.3);padding-left:16px;">
                    <p style="margin:0;font-size:14px;color:#e8e0d4;line-height:1.7;">${safeMessage.replace(/\n/g, '<br>')}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding-top:8px;border-top:1px solid rgba(212,175,119,0.08);">
                  <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#8B7355;">Reply directly to</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#D4AF77;">${safeEmail}</p>
                  <p style="margin:0;font-size:11px;color:#4a4540;font-style:italic;">
                    Hit <strong style="color:#8B7355;">Reply</strong> in your email client — it will automatically address your response to ${safeName}.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(212,175,119,0.08);">
            <p style="margin:0;font-size:10px;color:#4a4540;letter-spacing:0.2em;">
              Received ${now} · Porto Arabia, The Pearl, Doha
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resend = await getResend();
    const { error: resendError } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: [toAddress],
      replyTo: safeEmail,
      subject: `📬 New Contact Message from ${safeName}`,
      html,
    });

    await supabase.from('email_logs').insert({
      recipient_email: toAddress,
      recipient_name: 'The Lab 33 Team',
      template: 'contact_message',
      subject: `New Contact Message from ${safeName}`,
      status: resendError ? 'failed' : 'sent',
      error_message: resendError ? JSON.stringify(resendError) : null,
    });

    if (resendError) {
      console.error('[Contact] Resend error:', resendError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Save to contact_messages (admin inbox)
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: safeName,
      email: safeEmail,
      message: safeMessage,
      status: 'unread',
    });
    if (insertError) {
      console.error('[Contact] Failed to save to contact_messages:', insertError);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Contact] Internal error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
