import {
    Plus,
    Pencil,
    Trash2,
    ArrowRightLeft,
    Download,
    LogIn,
    LogOut,
    ToggleRight,
    Send,
    Users,
    FileText,
    Megaphone,
    Mail,
    Settings,
    UserCircle,
    Sparkles,
    BookOpen,
    Briefcase,
    Info,
    AlertTriangle,
    XCircle,
    Flame,
    Globe,
    Zap,
    Clock,
    Bot,
    HardDrive,
    Server,
    type LucideIcon,
} from 'lucide-react';
import type { ActivityAction, ActivityResourceType, SystemLogLevel, SystemLogSource } from './types';

export const ACTION_CONFIG: Record<ActivityAction, {
    icon: LucideIcon;
    color: string;
    label: string;
}> = {
    create: { icon: Plus, color: 'text-emerald-400', label: 'Create' },
    update: { icon: Pencil, color: 'text-blue-400', label: 'Update' },
    delete: { icon: Trash2, color: 'text-rose-400', label: 'Delete' },
    status_change: { icon: ArrowRightLeft, color: 'text-amber-400', label: 'Status Change' },
    export: { icon: Download, color: 'text-purple-400', label: 'Export' },
    login: { icon: LogIn, color: 'text-cyan-400', label: 'Login' },
    logout: { icon: LogOut, color: 'text-zinc-400', label: 'Logout' },
    toggle: { icon: ToggleRight, color: 'text-orange-400', label: 'Toggle' },
    send: { icon: Send, color: 'text-teal-400', label: 'Send' },
};

export const RESOURCE_CONFIG: Record<ActivityResourceType, {
    icon: LucideIcon;
    label: string;
}> = {
    waitlist: { icon: Users, label: 'Waitlist' },
    applicant: { icon: FileText, label: 'Applicant' },
    position: { icon: Briefcase, label: 'Position' },
    post: { icon: Megaphone, label: 'Marketing' },
    email_template: { icon: Mail, label: 'Email Template' },
    email_automation: { icon: Mail, label: 'Automation' },
    email: { icon: Mail, label: 'Email' },
    settings: { icon: Settings, label: 'Settings' },
    user: { icon: UserCircle, label: 'User' },
    ai: { icon: Sparkles, label: 'AI' },
    knowledge_base: { icon: BookOpen, label: 'Knowledge Base' },
};

export const LEVEL_CONFIG: Record<SystemLogLevel, {
    icon: LucideIcon;
    color: string;
    label: string;
    bg: string;
}> = {
    info: { icon: Info, color: 'text-blue-400', label: 'Info', bg: 'bg-blue-500/10' },
    warn: { icon: AlertTriangle, color: 'text-amber-400', label: 'Warning', bg: 'bg-amber-500/10' },
    error: { icon: XCircle, color: 'text-rose-400', label: 'Error', bg: 'bg-rose-500/10' },
    fatal: { icon: Flame, color: 'text-red-500', label: 'Fatal', bg: 'bg-red-500/15' },
};

export const SOURCE_CONFIG: Record<SystemLogSource, {
    icon: LucideIcon;
    label: string;
}> = {
    api: { icon: Globe, label: 'API' },
    webhook: { icon: Zap, label: 'Webhook' },
    cron: { icon: Clock, label: 'Cron' },
    auth: { icon: UserCircle, label: 'Auth' },
    email: { icon: Mail, label: 'Email' },
    ai: { icon: Bot, label: 'AI' },
    storage: { icon: HardDrive, label: 'Storage' },
    system: { icon: Server, label: 'System' },
};

export const ACTION_OPTIONS: { value: ActivityAction; label: string }[] = [
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'status_change', label: 'Status Change' },
    { value: 'export', label: 'Export' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'toggle', label: 'Toggle' },
    { value: 'send', label: 'Send' },
];

export const RESOURCE_OPTIONS: { value: ActivityResourceType; label: string }[] = [
    { value: 'waitlist', label: 'Waitlist' },
    { value: 'applicant', label: 'Applicant' },
    { value: 'position', label: 'Position' },
    { value: 'post', label: 'Marketing' },
    { value: 'email_template', label: 'Email Template' },
    { value: 'email_automation', label: 'Automation' },
    { value: 'email', label: 'Email' },
    { value: 'settings', label: 'Settings' },
    { value: 'user', label: 'User' },
    { value: 'ai', label: 'AI' },
    { value: 'knowledge_base', label: 'Knowledge Base' },
];

export const LEVEL_OPTIONS: { value: SystemLogLevel; label: string }[] = [
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'fatal', label: 'Fatal' },
];

export const SOURCE_OPTIONS: { value: SystemLogSource; label: string }[] = [
    { value: 'api', label: 'API' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'cron', label: 'Cron' },
    { value: 'auth', label: 'Auth' },
    { value: 'email', label: 'Email' },
    { value: 'ai', label: 'AI' },
    { value: 'storage', label: 'Storage' },
    { value: 'system', label: 'System' },
];
