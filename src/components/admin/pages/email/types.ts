// Email Module Type Definitions

export type { SortDirection } from '@/types';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    body_text: string;
    category: EmailCategory;
    variables: string[];
    is_active: boolean;
    sections_json: EmailSections | null;
    created_at: string;
    updated_at: string;
}

export interface EmailAutomation {
    id: string;
    name: string;
    description: string;
    trigger_event: TriggerEvent;
    template_id: string | null;
    audience: AudienceType;
    delay_minutes: number;
    is_active: boolean;
    last_triggered_at: string | null;
    trigger_count: number;
    created_at: string;
    updated_at: string;
    // Joined
    template?: EmailTemplate;
}

export interface EmailLog {
    id: string;
    recipient_email: string;
    recipient_name: string | null;
    template: string;
    subject: string;
    status: EmailLogStatus;
    error_message: string | null;
    resend_id: string | null;
    template_id: string | null;
    automation_id: string | null;
    created_at: string;
}

export type EmailCategory = 'general' | 'waitlist' | 'application' | 'marketing' | 'onboarding' | 'notification';

export type TriggerEvent =
    | 'waitlist_signup'
    | 'application_received'
    | 'application_status_change'
    | 'application_shortlisted'
    | 'application_rejected'
    | 'application_hired'
    | 'waitlist_promotion'
    | 'admin_invite'
    | 'contact_message_reply'
    | 'manual';

export type AudienceType = 'all' | 'waitlist' | 'applicants' | 'shortlisted' | 'hired' | 'custom';

export type EmailLogStatus = 'sent' | 'delivered' | 'bounced' | 'failed';

export type EmailTab = 'templates' | 'automations' | 'logs';

export type TemplateSortField = 'created_at' | 'name' | 'category' | 'updated_at';
export type AutomationSortField = 'created_at' | 'name' | 'trigger_event' | 'trigger_count';
export type LogSortField = 'created_at' | 'recipient_email' | 'status';

export type EmailLayout = 'gilded-horizon';
export type EmailTheme = 'dark' | 'light';

export interface EmailSections {
    layout: EmailLayout;
    theme: EmailTheme;
    badge: { text: string; visible: boolean };
    heading: { line1: string; accent: string };
    body: EmailBodyBlock[];
    cta: { text: string; url: string; visible: boolean };
    socials: {
        visible: boolean;
        instagram: string;
        tiktok: string;
        facebook: string;
    };
    footer: { text: string };
}

export type EmailBodyBlock =
    | { type: 'greeting'; text: string }
    | { type: 'paragraph'; text: string }
    | { type: 'image'; src: string; alt?: string; caption?: string }
    | { type: 'image-grid'; images: { src: string; alt?: string }[]; caption?: string }
    | { type: 'divider' };
