// Email Renderer — Converts structured sections JSON into styled HTML
import { EmailSections } from './types';

const PALETTES = {
    dark: {
        bg: '#020202',
        surface: '#080808',
        surfaceAlt: '#050505',
        text: '#F5F5F0',
        textMuted: '#A8A29E',
        textFooter: '#78716C',
        gold: '#D4AF77',
        border: 'rgba(212, 175, 119, 0.15)',
        borderSubtle: 'rgba(212, 175, 119, 0.1)',
        borderBadge: 'rgba(212, 175, 119, 0.2)',
        divider: 'rgba(212, 175, 119, 0.2)',
        shadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
        iconOpacity: '1',
    },
    light: {
        bg: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceAlt: '#FAFAF8',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        textFooter: '#999999',
        gold: '#A38540',
        border: 'rgba(163, 133, 64, 0.15)',
        borderSubtle: 'rgba(163, 133, 64, 0.1)',
        borderBadge: 'rgba(163, 133, 64, 0.25)',
        divider: 'rgba(163, 133, 64, 0.15)',
        shadow: '0 40px 100px -20px rgba(0,0,0,0.08)',
        iconOpacity: '0.8',
    },
};

// Supabase storage base for email assets (public bucket "email-assets" on the project)
const ASSET_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/email-assets`;

const SOCIAL_ICONS: Record<string, { label: string; iconDark: string; iconLight: string }> = {
    instagram: {
        label: 'Instagram',
        iconDark: `${ASSET_BASE}/instagram-white.png?v=4`,
        iconLight: `${ASSET_BASE}/instagram-black.png?v=4`,
    },
    tiktok: {
        label: 'TikTok',
        iconDark: `${ASSET_BASE}/tiktok-white.png?v=4`,
        iconLight: `${ASSET_BASE}/tiktok-black.png?v=4`,
    },
    facebook: {
        label: 'Facebook',
        iconDark: `${ASSET_BASE}/facebook-white.png?v=4`,
        iconLight: `${ASSET_BASE}/facebook-black.png?v=4`,
    },
};

// Converts plain text with simple markup into styled HTML:
//   {{variable}}  → gold bold text
//   **bold text** → bold with primary color
//   *italic text* → italic
function styleText(text: string, goldColor: string, textColor: string): string {
    let html = text;
    // Auto-style {{variables}} → gold + bold
    html = html.replace(/\{\{(\w+)\}\}/g, `<strong style="color: ${goldColor}; font-weight: 600;">{{$1}}</strong>`);
    // **bold** → bold with primary text color
    html = html.replace(/\*\*(.+?)\*\*/g, `<strong style="color: ${textColor}; font-weight: 600;">$1</strong>`);
    // *italic* → italic (but not inside ** already handled)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, `<em>$1</em>`);
    return html;
}

export function renderEmailHtml(sections: EmailSections): string {
    const c = PALETTES[sections.theme];
    const isDark = sections.theme === 'dark';

    // Build body blocks with auto-styling
    const bodyHtml = sections.body.map(block => {
        switch (block.type) {
            case 'greeting':
                return `<p style="color: ${c.text}; font-size: 16px; margin: 0 0 24px; line-height: 1.6;">${styleText(block.text, c.gold, c.text).replace(/\n/g, '<br />')}</p>`;
            case 'paragraph':
                return `<p style="color: ${c.textMuted}; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">${styleText(block.text, c.gold, c.text).replace(/\n/g, '<br />')}</p>`;
            case 'image':
                return `<div style="margin: 8px 0 24px; text-align: center;">
<img src="${block.src}" alt="${block.alt || ''}" style="width: 100%; max-width: 100%; border-radius: 12px; display: block;" />
${block.caption ? `<p style="color: ${c.textMuted}; font-size: 11px; margin: 10px 0 0; font-style: italic;">${block.caption}</p>` : ''}
</div>`;
            case 'image-grid':
                const gridCells = block.images.map(img =>
                    `<td style="width: 50%; padding: 4px;">
<img src="${img.src}" alt="${img.alt || ''}" style="width: 100%; border-radius: 10px; display: block;" />
</td>`
                ).join('\n');
                return `<div style="margin: 8px 0 24px;">
<table style="width: 100%; border-collapse: collapse;" cellpadding="0" cellspacing="0"><tr>
${gridCells}
</tr></table>
${block.caption ? `<p style="color: ${c.textMuted}; font-size: 11px; margin: 10px 0 0; text-align: center; font-style: italic;">${block.caption}</p>` : ''}
</div>`;
            case 'divider':
                return `<div style="margin: 12px auto 24px; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${c.divider}, transparent);"></div>`;
            default:
                return '';
        }
    }).join('\n');

    // Build social links
    const activeSocials = (['facebook', 'instagram', 'tiktok'] as const)
        .filter(key => sections.socials[key]);

    const socialCells = activeSocials.map(key => {
        const social = SOCIAL_ICONS[key];
        const icon = isDark ? social.iconDark : social.iconLight;
        // Gmail Android inverts transparent PNGs smaller than 54px in dark mode.
        // Setting width/height attributes ≥54 bypasses the inversion, while
        // inline CSS controls the actual visual size.
        return `<td style="padding: 0 12px;"><a href="${sections.socials[key]}"><img src="${icon}" width="54" height="54" alt="${social.label}" style="width:24px;height:24px;opacity: ${c.iconOpacity};" /></a></td>`;
    }).join('\n');

    // CTA gradient
    const ctaGradient = isDark
        ? 'background-image: linear-gradient(135deg, #FFD700 0%, #D4AF77 50%, #B8860B 100%);'
        : 'background-image: linear-gradient(135deg, #B8860B 0%, #A38540 50%, #8B6914 100%);';

    const ctaTextColor = isDark ? '#000000' : '#FFFFFF';

    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="${isDark ? 'dark' : 'light'} only" />
<meta name="supported-color-schemes" content="${isDark ? 'dark' : 'light'} only" />
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
:root { color-scheme: ${isDark ? 'dark' : 'light'} only; }
@media (prefers-color-scheme: dark) {
  .email-body, .email-body * { background-color: ${c.surface} !important; color: ${c.text} !important; }
}
</style>
</head>
<body style="background-color: ${c.bg}; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 40px 0; margin: 0;">
<div style="background-color: ${c.surface}; margin: 0 auto; max-width: 600px; border-radius: 32px; border: 1px solid ${c.border}; overflow: hidden; box-shadow: ${c.shadow};">

<!-- Top Gold Accent -->
<div style="height: 6px; background: linear-gradient(90deg, transparent, ${c.gold}, transparent);"></div>

<!-- Header with Logo -->
<div style="padding: 64px 40px 48px; text-align: center; background: radial-gradient(circle at top, rgba(212, 175, 119, 0.1) 0%, transparent 70%);">
<img src="${ASSET_BASE}/${isDark ? 'logo' : 'logo-black'}.png?v=4" alt="LAB 33" style="margin: 0 auto; display: block; max-width: 150px; width: 100%;" />
</div>

<!-- Main Content -->
<div style="padding: 0 48px 64px; text-align: center;">

${sections.badge.visible ? `
<!-- Badge -->
<div style="display: inline-block; padding: 6px 16px; border-radius: 100px; border: 1px solid ${c.borderBadge}; margin: 0 auto 32px;">
<p style="color: ${c.gold}; font-size: 9px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; margin: 0;">${sections.badge.text}</p>
</div>
` : ''}

<!-- Heading -->
<h1 style="color: ${c.text}; font-size: 32px; font-weight: 400; letter-spacing: -0.02em; margin: 0 0 40px; line-height: 1.2; font-family: DM Serif Display, serif;">
${sections.heading.line1}<br /><span style="color: ${c.gold};">${sections.heading.accent}</span>
</h1>

<!-- Body Content -->
${bodyHtml}

${sections.cta.visible ? `
<!-- CTA Button -->
<div style="margin: 24px 0 0; text-align: center;">
<a href="${sections.cta.url}" style="background-color: ${c.gold}; ${ctaGradient} color: ${ctaTextColor}; padding: 20px 56px; border-radius: 16px; font-size: 11px; font-weight: 900; text-decoration: none; display: inline-block; letter-spacing: 3px; text-transform: uppercase;">${sections.cta.text}</a>
</div>
` : ''}

</div>

${sections.socials.visible && activeSocials.length > 0 ? `
<!-- Social Links -->
<div style="background-color: ${c.surfaceAlt}; padding: 48px 40px 40px; text-align: center; border-top: 1px solid ${c.borderSubtle};">
<p style="color: ${c.gold}; font-size: 10px; font-weight: 800; letter-spacing: 5px; margin: 0 0 28px; text-transform: uppercase;">CONNECT WITH US</p>
<table style="margin: 0 auto;"><tr>
${socialCells}
</tr></table>
</div>
` : ''}

<!-- Footer -->
<div style="background-color: ${c.bg}; padding: 36px 40px; text-align: center;">
<p style="color: ${c.textFooter}; font-size: 9px; font-weight: 600; letter-spacing: 3px; margin: 0; text-transform: uppercase;">${sections.footer.text}</p>
</div>

</div>
</body>
</html>`;
}

export function getDefaultSections(): EmailSections {
    return {
        layout: 'gilded-horizon',
        theme: 'dark',
        badge: { text: 'STATUS BADGE', visible: true },
        heading: { line1: 'Your Heading', accent: 'Here' },
        body: [
            { type: 'greeting', text: 'Hello {{first_name}},' },
            { type: 'paragraph', text: 'Your email content goes here. Write your message to engage your audience.' },
            { type: 'divider' },
            { type: 'paragraph', text: 'Additional information or call to action details.' },
        ],
        cta: { text: 'Visit Website', url: 'https://lab33recovery.qa', visible: true },
        socials: {
            visible: true,
            instagram: 'https://www.instagram.com/lab33recovery.qa/',
            tiktok: 'https://www.tiktok.com/@thelab33.qa',
            facebook: 'https://www.facebook.com/lab33recovery.qa/',
        },
        footer: { text: '© 2026 LAB 33 — FUTURE OF RECOVERY' },
    };
}
