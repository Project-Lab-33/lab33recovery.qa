import {
    Mail, Clock, Users, FileText, Megaphone, Bell, UserPlus, Zap,
    CheckCircle, XCircle, Star, Search, Send, AlertTriangle,
    Calendar, ArrowUpDown, Activity, Hash, MessageSquare
} from 'lucide-react';
import type { TriggerEvent, EmailCategory, AudienceType, EmailLogStatus } from './types';

export const TEMPLATE_CATEGORIES: { value: EmailCategory; label: string; icon: typeof Mail }[] = [
    { value: 'general', label: 'General', icon: Mail },
    { value: 'waitlist', label: 'Waitlist', icon: Users },
    { value: 'application', label: 'Application', icon: FileText },
    { value: 'marketing', label: 'Marketing', icon: Megaphone },
    { value: 'onboarding', label: 'Onboarding', icon: UserPlus },
    { value: 'notification', label: 'Notification', icon: Bell },
];

export const TRIGGER_EVENTS: { value: TriggerEvent; label: string; icon: typeof Zap; description: string }[] = [
    { value: 'waitlist_signup', label: 'Waitlist Signup', icon: UserPlus, description: 'When someone joins the waitlist' },
    { value: 'application_received', label: 'Application Received', icon: FileText, description: 'When a job application is submitted' },
    { value: 'application_status_change', label: 'Status Changed', icon: Activity, description: 'When an application status changes' },
    { value: 'application_shortlisted', label: 'Shortlisted', icon: Star, description: 'When an applicant is shortlisted' },
    { value: 'application_rejected', label: 'Rejected', icon: XCircle, description: 'When an application is rejected' },
    { value: 'application_hired', label: 'Hired', icon: CheckCircle, description: 'When an applicant is hired' },
    { value: 'waitlist_promotion', label: 'Waitlist Promotion', icon: Zap, description: 'When a waitlist subscriber is promoted' },
    { value: 'admin_invite', label: 'Admin Invite', icon: Send, description: 'When a new admin user is invited' },
    { value: 'contact_message_reply', label: 'Contact Reply', icon: MessageSquare, description: 'When an admin replies to a contact message' },
    { value: 'manual', label: 'Manual Only', icon: Clock, description: 'Only triggered manually' },
];

export const AUDIENCE_TYPES: { value: AudienceType; label: string }[] = [
    { value: 'all', label: 'Everyone' },
    { value: 'waitlist', label: 'Waitlist Subscribers' },
    { value: 'applicants', label: 'All Applicants' },
    { value: 'shortlisted', label: 'Shortlisted Only' },
    { value: 'hired', label: 'Hired Only' },
    { value: 'custom', label: 'Custom Segment' },
];

export const AVAILABLE_VARIABLES = [
    { key: '{{first_name}}', label: 'First Name', category: 'person' },
    { key: '{{last_name}}', label: 'Last Name', category: 'person' },
    { key: '{{full_name}}', label: 'Full Name', category: 'person' },
    { key: '{{email}}', label: 'Email', category: 'person' },
    { key: '{{position_title}}', label: 'Position Title', category: 'application' },
    { key: '{{status}}', label: 'Application Status', category: 'application' },
    { key: '{{company_name}}', label: 'Company Name', category: 'brand' },
    { key: '{{date}}', label: 'Current Date', category: 'system' },
];

export const LOG_STATUS_CONFIG: Record<EmailLogStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
    sent: { icon: Send, color: 'text-blue-400', label: 'Sent' },
    delivered: { icon: CheckCircle, color: 'text-emerald-400', label: 'Delivered' },
    bounced: { icon: AlertTriangle, color: 'text-amber-400', label: 'Bounced' },
    failed: { icon: XCircle, color: 'text-rose-400', label: 'Failed' },
};

export const TEMPLATE_SORT_OPTIONS = [
    { field: 'created_at', label: 'Date Created', icon: Calendar, defaultDirection: 'desc' as const },
    { field: 'name', label: 'Name', icon: ArrowUpDown, defaultDirection: 'asc' as const },
    { field: 'category', label: 'Category', icon: Hash, defaultDirection: 'asc' as const },
    { field: 'updated_at', label: 'Last Updated', icon: Clock, defaultDirection: 'desc' as const },
];

export const AUTOMATION_SORT_OPTIONS = [
    { field: 'created_at', label: 'Date Created', icon: Calendar, defaultDirection: 'desc' as const },
    { field: 'name', label: 'Name', icon: ArrowUpDown, defaultDirection: 'asc' as const },
    { field: 'trigger_event', label: 'Trigger', icon: Zap, defaultDirection: 'asc' as const },
    { field: 'trigger_count', label: 'Times Triggered', icon: Activity, defaultDirection: 'desc' as const },
];

export const LOG_SORT_OPTIONS = [
    { field: 'created_at', label: 'Date Sent', icon: Calendar, defaultDirection: 'desc' as const },
    { field: 'recipient_email', label: 'Recipient', icon: Mail, defaultDirection: 'asc' as const },
    { field: 'status', label: 'Status', icon: Search, defaultDirection: 'asc' as const },
];
