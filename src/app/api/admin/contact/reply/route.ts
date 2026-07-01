import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { renderEmailHtml } from '@/components/admin/pages/email/emailRenderer';
import { replaceVariables } from '@/lib/email';
import { getSecret } from '@/lib/secrets';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _resend: Resend | null = null;
async function getResend() {
  if (!_resend) {
    const apiKey = await getSecret('resend_api_key');
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    const { message_id, reply_text, to_name, to_email } = body;

    if (!message_id || !reply_text?.trim() || !to_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: automation } = await supabase
      .from('email_automations')
      .select('*, template:email_templates(*)')
      .eq('trigger_event', 'contact_message_reply')
      .eq('is_active', true)
      .single();

    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['email_from_name', 'email_from_address']);

    const settingsMap = new Map((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]));
    const fromName = settingsMap.get('email_from_name') || 'Lab 33 Recovery';
    const fromAddress = settingsMap.get('email_from_address') || 'noreply@lab33recovery.qa';

    const firstName = to_name.split(' ')[0] || to_name;
    const variables: Record<string, string> = {
      first_name: firstName,
      full_name: to_name,
      email: to_email,
      reply_message: reply_text.trim().replace(/\n/g, '<br>'),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      company: 'Lab 33 Recovery',
    };

    let html: string;
    let emailSubject = 'Re: Your message to Lab 33';

    if (automation?.template) {
      const template = automation.template;
      emailSubject = replaceVariables(template.subject || emailSubject, variables);

      if (template.body_html && template.body_html.trim().length > 0) {
        html = replaceVariables(template.body_html, variables);
      } else if (template.sections_json) {
        html = replaceVariables(renderEmailHtml(template.sections_json), variables);
      } else {
        html = buildFallbackHtml(to_name, reply_text, fromName);
      }
    } else {
      // No active automation — fall back to inline template
      html = buildFallbackHtml(to_name, reply_text, fromName);
    }

    const resend = await getResend();
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: [to_email],
      subject: emailSubject,
      html,
    });

    await supabase.from('email_logs').insert({
      recipient_email: to_email,
      recipient_name: to_name,
      template: 'contact_message_reply',
      template_id: automation?.template?.id || null,
      automation_id: automation?.id || null,
      subject: emailSubject,
      status: resendError ? 'failed' : 'sent',
      resend_id: resendData?.id || null,
      error_message: resendError ? JSON.stringify(resendError) : null,
    });

    if (resendError) {
      console.error('[Contact Reply] Resend error:', resendError);
      return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
    }

    if (automation?.id) {
      await supabase.from('email_automations')
        .update({
          trigger_count: (automation.trigger_count || 0) + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', automation.id);
    }

    const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { error: dbError } = await authedClient
      .from('contact_messages')
      .update({
        status: 'replied',
        reply_text: reply_text.trim(),
        replied_at: new Date().toISOString(),
        replied_by: user.email,
      })
      .eq('id', message_id);

    if (dbError) {
      console.error('[Contact Reply] DB update error:', dbError);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Contact Reply] Internal error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fallback HTML (if no Email Hub automation configured)
function buildFallbackHtml(toName: string, replyText: string, fromName: string): string {
  const firstName = toName.split(' ')[0] || toName;
  const now = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Qatar',
  });
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reply from Lab 33</title></head>
<body style="margin:0;padding:0;background:#0a0908;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111009;border:1px solid rgba(212,175,119,0.15);max-width:600px;width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(212,175,119,0.1);">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.45em;text-transform:uppercase;color:#8B7355;">Lab 33 Recovery</p>
          <h1 style="margin:0;font-size:20px;font-weight:400;color:#F5F5F0;letter-spacing:0.05em;">Message from the Team</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:15px;color:#F5F5F0;">Hello ${firstName},</p>
          <div style="border-left:2px solid rgba(212,175,119,0.3);padding-left:16px;margin:16px 0 28px;">
            <p style="margin:0;font-size:14px;color:#e8e0d4;line-height:1.8;">${replyText.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="border-top:1px solid rgba(212,175,119,0.08);padding-top:20px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:500;color:#D4AF77;">${fromName}</p>
            <p style="margin:0;font-size:11px;color:#4a4540;">Porto Arabia, The Pearl · Doha, Qatar</p>
          </div>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid rgba(212,175,119,0.08);">
          <p style="margin:0;font-size:10px;color:#4a4540;letter-spacing:0.2em;">Sent ${now}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
