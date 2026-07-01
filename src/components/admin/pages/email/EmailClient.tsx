"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mail, Plus, Search, Zap, Clock, Edit, Trash2, Eye, CheckCircle, XCircle, X,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Power, PowerOff, SlidersHorizontal, Share2, RefreshCcw, Send, AlertTriangle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FileText, Users, Megaphone, Bell, UserPlus, Activity, Star, CalendarDays, Copy, ChevronDown,
    Sun, Moon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAdminUser } from "@/hooks/useAdminUser";
import { hasPermission } from "@/lib/permissions";
import { AdminListView, AdminDrawer, DeleteModal, PermissionGate, AdminLoader, HeaderIconBtn, Badge, AdminPageHeader } from "@/components/admin/shared";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import { ViewToggle } from "@/components/admin/shared/ViewToggle";
import type { Column } from "@/components/admin/shared/AdminListView";
import { List, LayoutGrid } from "lucide-react";
import type {
    EmailTemplate, EmailAutomation, EmailLog, EmailSections,
    EmailTab, EmailCategory, EmailTheme, TriggerEvent,
    TemplateSortField, AutomationSortField, LogSortField, SortDirection
} from "./types";
import {
    TEMPLATE_CATEGORIES, TRIGGER_EVENTS, AUDIENCE_TYPES,
    AVAILABLE_VARIABLES, LOG_STATUS_CONFIG,
    TEMPLATE_SORT_OPTIONS, AUTOMATION_SORT_OPTIONS, LOG_SORT_OPTIONS
} from "./constants";
import { renderEmailHtml, getDefaultSections } from "./emailRenderer";
import SectionEditor from "./SectionEditor";
import { TemplateCardView, AutomationCardView } from "./views";



const TAB_CONFIG: Record<EmailTab, { label: string; headerLabel: string; title: string }> = {
    templates: { label: 'Templates', headerLabel: 'Email Design', title: 'Templates' },
    automations: { label: 'Automations', headerLabel: 'Workflow Engine', title: 'Automations' },
    logs: { label: 'Logs', headerLabel: 'Delivery Records', title: 'Email Logs' },
};

type ViewMode = 'list' | 'cards';
const VIEW_OPTIONS: { view: ViewMode; icon: typeof List; label: string }[] = [
    { view: 'list', icon: List, label: 'List' },
    { view: 'cards', icon: LayoutGrid, label: 'Cards' },
];

export default function EmailClient({ initialTab = 'templates' }: { initialTab?: EmailTab }) {
    const supabase = useMemo(() => createClient(), []);
    const { user: adminUser } = useAdminUser();
    const overrides = adminUser?.permissions_override;
    const canCreate = hasPermission(adminUser?.role, 'email', 'create', overrides);
    const canDelete = hasPermission(adminUser?.role, 'email', 'delete', overrides);

    const activeTab = initialTab;

    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templateSearch, setTemplateSearch] = useState("");
    const [templateSort, setTemplateSort] = useState<TemplateSortField>('created_at');
    const [templateSortDir, setTemplateSortDir] = useState<SortDirection>('desc');
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

    const [automations, setAutomations] = useState<EmailAutomation[]>([]);
    const [automationsLoading, setAutomationsLoading] = useState(true);
    const [automationSearch, setAutomationSearch] = useState("");
    const [automationSort, setAutomationSort] = useState<AutomationSortField>('created_at');
    const [automationSortDir, setAutomationSortDir] = useState<SortDirection>('desc');
    const [triggerFilter, setTriggerFilter] = useState<string[]>([]);

    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [logSearch, setLogSearch] = useState("");
    const [logSort, setLogSort] = useState<LogSortField>('created_at');
    const [logSortDir, setLogSortDir] = useState<SortDirection>('desc');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | 'view'>('add');
    const [drawerType, setDrawerType] = useState<'template' | 'automation'>('template');
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetType, setDeleteTargetType] = useState<'template' | 'automation'>('template');
    const [isDeleting, setIsDeleting] = useState(false);

    const [formName, setFormName] = useState("");
    const [formSubject, setFormSubject] = useState("");
    const [formBodyHtml, setFormBodyHtml] = useState("");
    const [formCategory, setFormCategory] = useState<EmailCategory>('general');
    const [formVariables, setFormVariables] = useState<string[]>([]);
    const [formSections, setFormSections] = useState<EmailSections | null>(null);

    const [autoName, setAutoName] = useState("");
    const [autoDescription, setAutoDescription] = useState("");
    const [autoTrigger, setAutoTrigger] = useState<TriggerEvent>('waitlist_signup');
    const [autoTemplateId, setAutoTemplateId] = useState<string>("");
    const [autoAudience, setAutoAudience] = useState("all");
    const [autoDelay, setAutoDelay] = useState(0);

    const [filtersVisible, setFiltersVisible] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const [showPreview, setShowPreview] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [triggerDropdownOpen, setTriggerDropdownOpen] = useState(false);
    const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

    const [showTestPopover, setShowTestPopover] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const testPopoverRef = useRef<HTMLDivElement>(null);

    // Close test popover when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (testPopoverRef.current && !testPopoverRef.current.contains(e.target as Node)) {
                setShowTestPopover(false);
            }
        }
        if (showTestPopover) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTestPopover]);

    const handleSendTest = async () => {
        if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
            setTestStatus({ type: 'error', message: 'Please enter a valid email address' });
            setTimeout(() => setTestStatus(null), 3000);
            return;
        }
        setIsSendingTest(true);
        setTestStatus(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setTestStatus({ type: 'error', message: 'Not authenticated' });
                setTimeout(() => setTestStatus(null), 3000);
                return;
            }

            // Generate HTML from sections or use raw
            let html = formSections ? renderEmailHtml(formSections) : formBodyHtml;
            // Replace variables with sample data
            html = html.replace(/\{\{first_name\}\}/g, 'John');
            html = html.replace(/\{\{last_name\}\}/g, 'Doe');
            html = html.replace(/\{\{email\}\}/g, testEmail);
            html = html.replace(/\{\{full_name\}\}/g, 'John Doe');
            html = html.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
            html = html.replace(/\{\{company\}\}/g, 'The Lab 33');

            const subject = formSubject
                .replace(/\{\{first_name\}\}/g, 'John')
                .replace(/\{\{last_name\}\}/g, 'Doe')
                .replace(/\{\{email\}\}/g, testEmail)
                .replace(/\{\{full_name\}\}/g, 'John Doe')
                .replace(/\{\{company\}\}/g, 'The Lab 33');

            const res = await fetch('/api/send-test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ to: testEmail.trim(), subject, html }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');

            setTestStatus({ type: 'success', message: `Sent to ${testEmail}` });
            setTimeout(() => { setTestStatus(null); setShowTestPopover(false); }, 2500);
        } catch (err: unknown) {
            setTestStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send test email' });
            setTimeout(() => setTestStatus(null), 3000);
        } finally {
            setIsSendingTest(false);
        }
    };

    const fetchTemplates = useCallback(async () => {
        setTemplatesLoading(true);
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error('Fetch templates error:', err);
            toast.error('Failed to fetch email templates');
        } finally {
            setTemplatesLoading(false);
        }
    }, [supabase]);

    const fetchAutomations = useCallback(async () => {
        setAutomationsLoading(true);
        try {
            const { data, error } = await supabase
                .from('email_automations')
                .select('*, template:email_templates(*)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAutomations(data || []);
        } catch (err) {
            console.error('Fetch automations error:', err);
            toast.error('Failed to fetch automations');
        } finally {
            setAutomationsLoading(false);
        }
    }, [supabase]);

    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);
            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Fetch logs error:', err);
            toast.error('Failed to fetch email logs');
        } finally {
            setLogsLoading(false);
        }
    }, [supabase]);

    useEffect(() => { fetchTemplates(); fetchAutomations(); fetchLogs(); }, [fetchTemplates, fetchAutomations, fetchLogs]);

    useEffect(() => {
        const channel = supabase
            .channel('email_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'email_templates' }, () => fetchTemplates())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'email_automations' }, () => fetchAutomations())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, () => fetchLogs())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchTemplates, fetchAutomations, fetchLogs]);

    const resetTemplateForm = () => {
        setFormName(""); setFormSubject(""); setFormBodyHtml(""); setFormCategory('general'); setFormVariables([]);
        setFormSections(getDefaultSections()); setCategoryDropdownOpen(false);
    };

    const loadTemplateForm = (t: EmailTemplate) => {
        setFormName(t.name); setFormSubject(t.subject); setFormBodyHtml(t.body_html);
        setFormCategory(t.category); setFormVariables(t.variables || []);
        setFormSections(t.sections_json || null);
    };

    const handleSaveTemplate = async () => {
        if (!formName.trim() || !formSubject.trim()) { toast.error('Name and subject are required'); return; }
        setIsSaving(true);
        try {
            const generatedHtml = formSections ? renderEmailHtml(formSections) : formBodyHtml;
            const payload = {
                name: formName.trim(), subject: formSubject.trim(), body_html: generatedHtml,
                category: formCategory, variables: formVariables, updated_at: new Date().toISOString(),
                sections_json: formSections || null,
            };
            if (drawerMode === 'edit' && selectedTemplate) {
                const { error } = await supabase.from('email_templates').update(payload).eq('id', selectedTemplate.id);
                if (error) throw error;
                toast.success('Template updated');
            } else {
                const { error } = await supabase.from('email_templates').insert(payload);
                if (error) throw error;
                toast.success('Template created');
            }
            setDrawerOpen(false); resetTemplateForm(); fetchTemplates();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    const resetAutomationForm = () => {
        setAutoName(""); setAutoDescription(""); setAutoTrigger('waitlist_signup');
        setAutoTemplateId(""); setAutoAudience("all"); setAutoDelay(0);
    };

    const loadAutomationForm = (a: EmailAutomation) => {
        setAutoName(a.name); setAutoDescription(a.description); setAutoTrigger(a.trigger_event);
        setAutoTemplateId(a.template_id || ""); setAutoAudience(a.audience); setAutoDelay(a.delay_minutes);
    };

    const handleSaveAutomation = async () => {
        if (!autoName.trim()) { toast.error('Name is required'); return; }
        setIsSaving(true);
        try {
            const payload = {
                name: autoName.trim(), description: autoDescription.trim(), trigger_event: autoTrigger,
                template_id: autoTemplateId || null, audience: autoAudience, delay_minutes: autoDelay,
                updated_at: new Date().toISOString(),
            };
            if (drawerMode === 'edit' && selectedAutomation) {
                const { error } = await supabase.from('email_automations').update(payload).eq('id', selectedAutomation.id);
                if (error) throw error;
                toast.success('Automation updated');
            } else {
                const { error } = await supabase.from('email_automations').insert(payload);
                if (error) throw error;
                toast.success('Automation created');
            }
            setDrawerOpen(false); resetAutomationForm(); fetchAutomations();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error('Failed to save automation');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAutomation = async (id: string, currentState: boolean) => {
        try {
            const { error } = await supabase.from('email_automations')
                .update({ is_active: !currentState, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            toast.success(currentState ? 'Automation paused' : 'Automation activated');
            fetchAutomations();
        } catch {
            toast.error('Failed to toggle automation');
        }
    };

    const handleDelete = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            const table = deleteTargetType === 'template' ? 'email_templates' : 'email_automations';
            const { error } = await supabase.from(table).delete().eq('id', deleteTargetId);
            if (error) throw error;
            toast.success(`${deleteTargetType === 'template' ? 'Template' : 'Automation'} deleted`);
            setDeleteModalOpen(false); setDeleteTargetId(null);
            if (deleteTargetType === 'template') fetchTemplates(); else fetchAutomations();
        } catch {
            toast.error('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const openTemplateDrawer = (mode: 'add' | 'edit' | 'view', template?: EmailTemplate) => {
        setDrawerType('template'); setDrawerMode(mode);
        if (template) { setSelectedTemplate(template); loadTemplateForm(template); } else { resetTemplateForm(); setSelectedTemplate(null); }
        setShowPreview(mode === 'view');
        setDrawerOpen(true);
    };

    const openAutomationDrawer = (mode: 'add' | 'edit' | 'view', automation?: EmailAutomation) => {
        setDrawerType('automation'); setDrawerMode(mode);
        if (automation) { setSelectedAutomation(automation); loadAutomationForm(automation); } else { resetAutomationForm(); setSelectedAutomation(null); }
        setDrawerOpen(true);
    };

    const filteredTemplates = useMemo(() => {
        let result = [...templates];
        if (templateSearch) {
            const q = templateSearch.toLowerCase();
            result = result.filter(t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
        }
        if (categoryFilter.length > 0) result = result.filter(t => categoryFilter.includes(t.category));
        result.sort((a, b) => {
            const aVal = a[templateSort] || ''; const bVal = b[templateSort] || '';
            return templateSortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });
        return result;
    }, [templates, templateSearch, categoryFilter, templateSort, templateSortDir]);

    const filteredAutomations = useMemo(() => {
        let result = [...automations];
        if (automationSearch) {
            const q = automationSearch.toLowerCase();
            result = result.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
        }
        if (triggerFilter.length > 0) result = result.filter(a => triggerFilter.includes(a.trigger_event));
        result.sort((a, b) => {
            const aVal = a[automationSort] || ''; const bVal = b[automationSort] || '';
            return automationSortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });
        return result;
    }, [automations, automationSearch, triggerFilter, automationSort, automationSortDir]);

    const filteredLogs = useMemo(() => {
        let result = [...logs];
        if (logSearch) {
            const q = logSearch.toLowerCase();
            result = result.filter(l => l.recipient_email.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q));
        }
        if (statusFilter.length > 0) result = result.filter(l => statusFilter.includes(l.status));
        result.sort((a, b) => {
            const aVal = a[logSort] || ''; const bVal = b[logSort] || '';
            return logSortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });
        return result;
    }, [logs, logSearch, statusFilter, logSort, logSortDir]);

    const activeFilterCount = useMemo(() => {
        if (activeTab === 'templates') return categoryFilter.length;
        if (activeTab === 'automations') return triggerFilter.length;
        return statusFilter.length;
    }, [activeTab, categoryFilter, triggerFilter, statusFilter]);

    const clearAllFilters = () => {
        setCategoryFilter([]); setTriggerFilter([]); setStatusFilter([]);
    };

    const templateColumns: Column<EmailTemplate>[] = [
        {
            key: 'name', label: 'Template', initialWidth: 280, primary: true,
            render: (t) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{t.name}</span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate">{t.subject}</span>
                </div>
            ),
        },
        {
            key: 'category', label: 'Category', initialWidth: 140,
            render: (t) => {
                const cat = TEMPLATE_CATEGORIES.find(c => c.value === t.category);
                const CatIcon = cat?.icon || Mail;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <CatIcon size={12} className="text-[var(--accent-gold)]" />
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{cat?.label || t.category}</span>
                    </div>
                );
            },
        },
        {
            key: 'variables', label: 'Variables', initialWidth: 120,
            render: (t) => (
                <span className="text-[12px] text-[var(--text-muted)] font-mono">{t.variables?.length || 0} vars</span>
            ),
        },
        {
            key: 'is_active', label: 'Status', initialWidth: 100,
            render: (t) => (
                <div className="inline-flex items-center gap-1.5">
                    {t.is_active ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-zinc-400" />}
                    <span className={`text-[12px] font-bold uppercase tracking-wider ${t.is_active ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
        {
            key: 'updated_at', label: 'Updated', initialWidth: 140,
            render: (t) => (
                <span className="text-[12px] text-[var(--text-muted)]">
                    {format(new Date(t.updated_at), 'MMM d, yyyy')}
                </span>
            ),
        },
    ];

    const automationColumns: Column<EmailAutomation>[] = [
        {
            key: 'name', label: 'Automation', initialWidth: 260, primary: true,
            render: (a) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{a.name}</span>
                        {a.is_active ? (
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                        )}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] truncate">{a.description}</span>
                </div>
            ),
        },
        {
            key: 'trigger_event', label: 'Trigger', initialWidth: 180,
            render: (a) => {
                const trigger = TRIGGER_EVENTS.find(t => t.value === a.trigger_event);
                const TrigIcon = trigger?.icon || Zap;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <TrigIcon size={12} className="text-[var(--accent-gold)]" />
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{trigger?.label || a.trigger_event}</span>
                    </div>
                );
            },
        },
        {
            key: 'template', label: 'Template', initialWidth: 180,
            render: (a) => (
                <span className="text-[12px] text-[var(--text-muted)] truncate">
                    {a.template?.name || '—'}
                </span>
            ),
        },
        {
            key: 'trigger_count', label: 'Sent', initialWidth: 100,
            render: (a) => (
                <span className="text-[12px] font-mono text-[var(--accent-gold)]">{a.trigger_count}</span>
            ),
        },
        {
            key: 'updated_at', label: 'Updated', initialWidth: 140,
            render: (a) => (
                <span className="text-[12px] text-[var(--text-muted)]">
                    {format(new Date(a.updated_at), 'MMM d, yyyy')}
                </span>
            ),
        },
    ];

    const logColumns: Column<EmailLog>[] = [
        {
            key: 'recipient_email', label: 'Recipient', initialWidth: 260, primary: true,
            render: (l) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{l.recipient_email}</span>
                    {l.recipient_name && <span className="text-[11px] text-[var(--text-muted)] truncate">{l.recipient_name}</span>}
                </div>
            ),
        },
        {
            key: 'subject', label: 'Subject', initialWidth: 240,
            render: (l) => <span className="text-[12px] text-[var(--text-secondary)] truncate">{l.subject}</span>,
        },
        {
            key: 'status', label: 'Status', initialWidth: 120,
            render: (l) => {
                const cfg = LOG_STATUS_CONFIG[l.status as keyof typeof LOG_STATUS_CONFIG] || LOG_STATUS_CONFIG.sent;
                const StatusIcon = cfg.icon;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <StatusIcon size={12} className={cfg.color} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                    </div>
                );
            },
        },
        {
            key: 'created_at', label: 'Sent At', initialWidth: 160,
            render: (l) => (
                <span className="text-[12px] text-[var(--text-muted)]">
                    {format(new Date(l.created_at), 'MMM d, yyyy HH:mm')}
                </span>
            ),
        },
    ];

    const filterDrawerContent = (
        <div className="flex flex-col gap-8 w-full">
            {activeTab === 'templates' && (
                <FilterSection title="Category" columns={2}>
                    {TEMPLATE_CATEGORIES.map((cat) => {
                        const isSelected = categoryFilter.includes(cat.value);
                        return (
                            <FilterPill key={cat.value} isSelected={isSelected} label={cat.label}
                                icon={cat.icon}
                                onClick={() => setCategoryFilter(prev => isSelected ? prev.filter(c => c !== cat.value) : [...prev, cat.value])} />
                        );
                    })}
                </FilterSection>
            )}
            {activeTab === 'automations' && (
                <FilterSection title="Trigger Event" columns={2}>
                    {TRIGGER_EVENTS.map((trigger) => {
                        const isSelected = triggerFilter.includes(trigger.value);
                        return (
                            <FilterPill key={trigger.value} isSelected={isSelected} label={trigger.label}
                                icon={trigger.icon}
                                onClick={() => setTriggerFilter(prev => isSelected ? prev.filter(t => t !== trigger.value) : [...prev, trigger.value])} />
                        );
                    })}
                </FilterSection>
            )}
            {activeTab === 'logs' && (
                <FilterSection title="Delivery Status" columns={2}>
                    {(['sent', 'delivered', 'bounced', 'failed'] as const).map((s) => {
                        const cfg = LOG_STATUS_CONFIG[s];
                        const isSelected = statusFilter.includes(s);
                        return (
                            <FilterPill key={s} isSelected={isSelected} label={cfg.label}
                                icon={cfg.icon}
                                onClick={() => setStatusFilter(prev => isSelected ? prev.filter(x => x !== s) : [...prev, s])} />
                        );
                    })}
                </FilterSection>
            )}
        </div>
    );

    const previewSrcDoc = useMemo(() => {
        // If sections exist, render from sections (live)
        if (formSections) {
            let html = renderEmailHtml(formSections);
            html = html.replace(/\{\{first_name\}\}/g, 'John');
            html = html.replace(/\{\{last_name\}\}/g, 'Doe');
            html = html.replace(/\{\{email\}\}/g, 'john@example.com');
            html = html.replace(/\{\{full_name\}\}/g, 'John Doe');
            html = html.replace(/\{\{date\}\}/g, format(new Date(), 'MMMM d, yyyy'));
            html = html.replace(/\{\{company\}\}/g, 'The Lab 33');
            return html;
        }
        // Fallback: raw HTML
        let html = formBodyHtml;
        html = html.replace(/\{\{first_name\}\}/g, 'John');
        html = html.replace(/\{\{last_name\}\}/g, 'Doe');
        html = html.replace(/\{\{email\}\}/g, 'john@example.com');
        html = html.replace(/\{\{full_name\}\}/g, 'John Doe');
        html = html.replace(/\{\{date\}\}/g, format(new Date(), 'MMMM d, yyyy'));
        html = html.replace(/\{\{company\}\}/g, 'The Lab 33');
        const trimmed = html.trim().toLowerCase();
        const isFullDoc = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
        if (isFullDoc) return html;
        return `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { margin: 0; padding: 32px; font-family: -apple-system, sans-serif; background: #f8f7f2; color: #1a1a1a; }</style></head><body>${html}</body></html>`;
    }, [formSections, formBodyHtml]);

    const templateDrawerBody = (
        <div className="space-y-4">
            {/* Email Theme Toggle */}
            {formSections && (
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Email Theme</label>
                    <div className="relative flex bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl p-1 gap-0.5">
                        {/* Sliding Indicator */}
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-[var(--accent-gold)]/15 to-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 shadow-[0_0_12px_rgba(212,175,119,0.12)]"
                            animate={{
                                left: formSections.theme === 'dark' ? '4px' : '50%',
                                width: 'calc(50% - 6px)',
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                        {/* Dark Button */}
                        <button
                            type="button"
                            disabled={drawerMode === 'view'}
                            onClick={() => setFormSections({ ...formSections, theme: 'dark' as EmailTheme })}
                            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${formSections.theme === 'dark'
                                ? 'text-[var(--accent-gold)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                } ${drawerMode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <Moon size={13} />
                            Dark
                        </button>
                        {/* Light Button */}
                        <button
                            type="button"
                            disabled={drawerMode === 'view'}
                            onClick={() => setFormSections({ ...formSections, theme: 'light' as EmailTheme })}
                            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${formSections.theme === 'light'
                                ? 'text-[var(--accent-gold)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                } ${drawerMode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <Sun size={13} />
                            Light
                        </button>
                    </div>
                </div>
            )}
            {/* Name */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Template Name</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} readOnly={drawerMode === 'view'}
                    placeholder="e.g. Welcome to Waitlist"
                    className="w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors" />
            </div>
            {/* Subject */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Email Subject</label>
                <input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} readOnly={drawerMode === 'view'}
                    placeholder="e.g. Welcome to The Lab 33, {{first_name}}!"
                    className="w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors" />
            </div>
            {/* Category */}
            <div className="space-y-2 relative">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Category</label>
                {(() => {
                    const selectedCat = TEMPLATE_CATEGORIES.find(c => c.value === formCategory);
                    const SelectedIcon = selectedCat?.icon;
                    return (
                        <>
                            <button
                                type="button"
                                onClick={() => drawerMode !== 'view' && setCategoryDropdownOpen(!categoryDropdownOpen)}
                                className={`w-full flex items-center justify-between px-4 py-3 bg-[var(--surface-mid)] border rounded-xl text-sm transition-colors ${categoryDropdownOpen
                                    ? 'border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]'
                                    : 'border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    } ${drawerMode === 'view' ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {SelectedIcon && <SelectedIcon size={15} className="text-[var(--accent-gold)]" />}
                                    <span className="text-[var(--text-primary)]">{selectedCat?.label || formCategory}</span>
                                </div>
                                <motion.div animate={{ rotate: categoryDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown size={16} className="text-[var(--text-muted)]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {categoryDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute z-50 left-0 right-0 mt-1.5 bg-[var(--surface-high)] border border-[var(--border-strong)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden"
                                    >
                                        <div className="py-1.5">
                                            {TEMPLATE_CATEGORIES.map((cat) => {
                                                const CatIcon = cat.icon;
                                                const isActive = formCategory === cat.value;
                                                return (
                                                    <button
                                                        key={cat.value}
                                                        type="button"
                                                        onClick={() => { setFormCategory(cat.value); setCategoryDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${isActive
                                                            ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)]'
                                                            }`}
                                                    >
                                                        <CatIcon size={15} className={isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'} />
                                                        <span className={isActive ? 'font-semibold' : ''}>{cat.label}</span>
                                                        {isActive && (
                                                            <CheckCircle size={14} className="ml-auto text-[var(--accent-gold)]" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    );
                })()}
            </div>

            {/* Section Editor (Structured) */}
            {formSections ? (
                <SectionEditor
                    sections={formSections}
                    onChange={setFormSections}
                    readOnly={drawerMode === 'view'}
                />
            ) : (
                /* Raw HTML Fallback */
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Email Body (HTML)</label>
                        <textarea value={formBodyHtml} onChange={(e) => setFormBodyHtml(e.target.value)} readOnly={drawerMode === 'view'}
                            rows={12}
                            placeholder="<h1>Welcome, {{first_name}}!</h1>\n<p>Thank you for joining The Lab 33...</p>"
                            className="w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors font-mono resize-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Available Variables</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_VARIABLES.map((v) => (
                                <button key={v.key} type="button"
                                    onClick={() => { if (drawerMode !== 'view') { setFormBodyHtml(prev => prev + v.key); if (!formVariables.includes(v.key)) setFormVariables(prev => [...prev, v.key]); } }}
                                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] hover:border-[var(--accent-gold)]/30 hover:text-[var(--accent-gold)] transition-colors">
                                    <Copy size={10} />
                                    <span className="font-mono">{v.key}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const automationDrawerBody = (
        <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Automation Name</label>
                <input value={autoName} onChange={(e) => setAutoName(e.target.value)} readOnly={drawerMode === 'view'}
                    placeholder="e.g. Welcome Email Flow"
                    className="w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors" />
            </div>
            {/* Description */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Description</label>
                <textarea value={autoDescription} onChange={(e) => setAutoDescription(e.target.value)} readOnly={drawerMode === 'view'}
                    rows={3} placeholder="Brief description of what this automation does..."
                    className="w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors resize-none" />
            </div>
            {/* Trigger Event */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Trigger Event</label>
                {(() => {
                    const selectedTrigger = TRIGGER_EVENTS.find(t => t.value === autoTrigger);
                    const SelectedIcon = selectedTrigger?.icon;
                    return (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { if (drawerMode !== 'view') { setTriggerDropdownOpen(!triggerDropdownOpen); setTemplateDropdownOpen(false); } }}
                                className={`w-full flex items-center justify-between px-4 py-3 bg-[var(--surface-mid)] border rounded-xl text-sm transition-colors ${triggerDropdownOpen
                                    ? 'border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]'
                                    : 'border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    } ${drawerMode === 'view' ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {SelectedIcon && <SelectedIcon size={15} className="text-[var(--accent-gold)]" />}
                                    <span className="text-[var(--text-primary)]">{selectedTrigger?.label || autoTrigger}</span>
                                </div>
                                <motion.div animate={{ rotate: triggerDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown size={16} className="text-[var(--text-muted)]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {triggerDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute z-[999] left-0 right-0 top-full mt-1.5 max-h-[280px] overflow-y-auto no-scrollbar bg-[var(--surface-high)] border border-[var(--border-strong)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                                    >
                                        <div className="py-1.5">
                                            {TRIGGER_EVENTS.map((trigger) => {
                                                const TriggerIcon = trigger.icon;
                                                const isActive = autoTrigger === trigger.value;
                                                return (
                                                    <button
                                                        key={trigger.value}
                                                        type="button"
                                                        onClick={() => { setAutoTrigger(trigger.value); setTriggerDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${isActive
                                                            ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)]'
                                                            }`}
                                                    >
                                                        <TriggerIcon size={15} className={isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'} />
                                                        <div className="flex flex-col">
                                                            <span className={isActive ? 'font-semibold' : ''}>{trigger.label}</span>
                                                            <span className="text-[10px] text-[var(--text-muted)]">{trigger.description}</span>
                                                        </div>
                                                        {isActive && (
                                                            <CheckCircle size={14} className="ml-auto text-[var(--accent-gold)] shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })()}
            </div>
            {/* Template Selection */}
            <div className="space-y-2 relative">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Email Template</label>
                {(() => {
                    const selectedTpl = templates.find(t => t.id === autoTemplateId);
                    return (
                        <>
                            <button
                                type="button"
                                onClick={() => drawerMode !== 'view' && setTemplateDropdownOpen(!templateDropdownOpen)}
                                className={`w-full flex items-center justify-between px-4 py-3 bg-[var(--surface-mid)] border rounded-xl text-sm transition-colors ${templateDropdownOpen
                                    ? 'border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]'
                                    : 'border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    } ${drawerMode === 'view' ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Mail size={15} className={selectedTpl ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'} />
                                    <span className={selectedTpl ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>{selectedTpl?.name || '— Select Template —'}</span>
                                </div>
                                <motion.div animate={{ rotate: templateDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown size={16} className="text-[var(--text-muted)]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {templateDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute z-50 left-0 right-0 mt-1.5 max-h-[280px] overflow-y-auto no-scrollbar bg-[var(--surface-high)] border border-[var(--border-strong)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                                    >
                                        <div className="py-1.5">
                                            {templates.filter(t => t.is_active).length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-[var(--text-muted)] italic">No active templates</div>
                                            ) : (
                                                templates.filter(t => t.is_active).map((t) => {
                                                    const isActive = autoTemplateId === t.id;
                                                    return (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() => { setAutoTemplateId(t.id); setTemplateDropdownOpen(false); }}
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${isActive
                                                                ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                                                                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)]'
                                                                }`}
                                                        >
                                                            <Mail size={15} className={isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'} />
                                                            <span className={isActive ? 'font-semibold' : ''}>{t.name}</span>
                                                            {isActive && (
                                                                <CheckCircle size={14} className="ml-auto text-[var(--accent-gold)] shrink-0" />
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    );
                })()}
            </div>
            {/* Audience */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Audience</label>
                <div className="grid grid-cols-3 gap-2">
                    {AUDIENCE_TYPES.map((aud) => (
                        <FilterPill key={aud.value} isSelected={autoAudience === aud.value} label={aud.label}
                            onClick={() => drawerMode !== 'view' && setAutoAudience(aud.value)} />
                    ))}
                </div>
            </div>
            {/* Delay */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Delay (minutes)</label>
                <input type="number" min={0} value={autoDelay} onChange={(e) => setAutoDelay(Number(e.target.value))} readOnly={drawerMode === 'view'}
                    className="w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors" />
                <p className="text-[10px] text-[var(--text-muted)] italic">
                    {autoDelay === 0 ? 'Email will be sent immediately' : `Email will be sent ${autoDelay} minute${autoDelay !== 1 ? 's' : ''} after the trigger event`}
                </p>
            </div>
        </div>
    );

    const renderTemplateActions = (t: EmailTemplate) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); openTemplateDrawer('view', t); }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 transition-colors"><Eye size={15} /></button>
            {canCreate && <button onClick={(e) => { e.stopPropagation(); openTemplateDrawer('edit', t); }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 transition-colors"><Edit size={15} /></button>}
            {canDelete && <button onClick={(e) => { e.stopPropagation(); setDeleteTargetId(t.id); setDeleteTargetType('template'); setDeleteModalOpen(true); }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/5 transition-colors"><Trash2 size={15} /></button>}
        </div>
    );

    const renderAutomationActions = (a: EmailAutomation) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); toggleAutomation(a.id, a.is_active); }}
                className={`p-2 rounded-lg transition-colors ${a.is_active ? 'text-emerald-400 hover:text-rose-400 hover:bg-rose-500/5' : 'text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/5'}`}>
                {a.is_active ? <PowerOff size={15} /> : <Power size={15} />}
            </button>
            {canCreate && <button onClick={(e) => { e.stopPropagation(); openAutomationDrawer('edit', a); }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 transition-colors"><Edit size={15} /></button>}
            {canDelete && <button onClick={(e) => { e.stopPropagation(); setDeleteTargetId(a.id); setDeleteTargetType('automation'); setDeleteModalOpen(true); }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/5 transition-colors"><Trash2 size={15} /></button>}
        </div>
    );

    const config = TAB_CONFIG[activeTab];
    const currentCount = activeTab === 'templates' ? templates.length : activeTab === 'automations' ? automations.length : logs.length;

    const activeTabLoading = activeTab === 'templates'
        ? templatesLoading && templates.length === 0
        : activeTab === 'automations'
            ? automationsLoading && automations.length === 0
            : logsLoading && logs.length === 0;

    if (activeTabLoading) {
        return (
            <PermissionGate resource="email" action="read">
                <AdminLoader page title={config.headerLabel} subtitle={`Loading ${config.title.toLowerCase()}...`} />
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="email" action="read">
            <div className="w-full flex flex-col pt-0 flex-1 min-h-0">
                <AdminPageHeader
                    eyebrow={config.headerLabel}
                    title={config.title}
                    badge={currentCount}
                    centreContent={
                        activeTab !== 'logs' ? (
                            <ViewToggle<ViewMode>
                                options={VIEW_OPTIONS}
                                activeView={viewMode}
                                onViewChange={setViewMode}
                            />
                        ) : undefined
                    }
                    actions={
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <HeaderIconBtn icon={SlidersHorizontal} active={filtersVisible || activeFilterCount > 0}
                                    onClick={() => setFiltersVisible(!filtersVisible)} title="Filters" />
                                {activeFilterCount > 0 && <Badge count={activeFilterCount} />}
                            </div>
                            <HeaderIconBtn icon={RefreshCcw} onClick={() => { fetchTemplates(); fetchAutomations(); fetchLogs(); }} title="Refresh" />
                        </div>
                    }
                />

                {/* Content */}
                <div className="flex-1 min-h-0 mt-6 flex flex-col overflow-hidden">
                    {activeTab === 'templates' && viewMode === 'list' && (
                        <AdminListView<EmailTemplate>
                            headerLabel="Email Design"
                            title="Templates"
                            hideHeader
                            data={filteredTemplates}
                            isLoading={templatesLoading}
                            columns={templateColumns}
                            getRowId={(t) => t.id}
                            searchQuery={templateSearch}
                            onSearchChange={setTemplateSearch}
                            searchPlaceholder="Search templates..."
                            sortOptions={TEMPLATE_SORT_OPTIONS}
                            sortField={templateSort}
                            sortDirection={templateSortDir}
                            onSortFieldChange={(f) => setTemplateSort(f as TemplateSortField)}
                            onSortDirectionChange={setTemplateSortDir}
                            filterDrawerContent={filterDrawerContent}
                            activeFilterCount={activeFilterCount}
                            onClearFilters={clearAllFilters}
                            onAdd={canCreate ? () => openTemplateDrawer('add') : undefined}
                            addTooltip="Create Template"
                            onRowClick={(t) => openTemplateDrawer('view', t)}
                            renderRowActions={renderTemplateActions}
                            emptyIcon={<Mail size={48} className="text-[var(--accent-gold)]/20" />}
                            emptyTitle="No Templates Yet"
                            emptyDescription="Create your first email template to get started"
                            itemsPerPage={10}
                        />
                    )}

                    {activeTab === 'templates' && viewMode === 'cards' && (
                        <TemplateCardView
                            templates={filteredTemplates}
                            onView={(t) => openTemplateDrawer('view', t)}
                            onEdit={(t) => openTemplateDrawer('edit', t)}
                            onDelete={(id) => { setDeleteTargetId(id); setDeleteTargetType('template'); setDeleteModalOpen(true); }}
                            isLoading={templatesLoading}
                            canCreate={canCreate}
                            canDelete={canDelete}
                        />
                    )}

                    {activeTab === 'automations' && viewMode === 'list' && (
                        <AdminListView<EmailAutomation>
                            headerLabel="Workflow Engine"
                            title="Automations"
                            hideHeader
                            data={filteredAutomations}
                            isLoading={automationsLoading}
                            columns={automationColumns}
                            getRowId={(a) => a.id}
                            searchQuery={automationSearch}
                            onSearchChange={setAutomationSearch}
                            searchPlaceholder="Search automations..."
                            sortOptions={AUTOMATION_SORT_OPTIONS}
                            sortField={automationSort}
                            sortDirection={automationSortDir}
                            onSortFieldChange={(f) => setAutomationSort(f as AutomationSortField)}
                            onSortDirectionChange={setAutomationSortDir}
                            filterDrawerContent={filterDrawerContent}
                            activeFilterCount={activeFilterCount}
                            onClearFilters={clearAllFilters}
                            onAdd={canCreate ? () => openAutomationDrawer('add') : undefined}
                            addTooltip="Create Automation"
                            onRowClick={(a) => openAutomationDrawer('view', a)}
                            renderRowActions={renderAutomationActions}
                            emptyIcon={<Zap size={48} className="text-[var(--accent-gold)]/20" />}
                            emptyTitle="No Automations Yet"
                            emptyDescription="Create your first automation to start sending emails automatically"
                            itemsPerPage={10}
                        />
                    )}

                    {activeTab === 'automations' && viewMode === 'cards' && (
                        <AutomationCardView
                            automations={filteredAutomations}
                            onView={(a) => openAutomationDrawer('view', a)}
                            onEdit={(a) => openAutomationDrawer('edit', a)}
                            onDelete={(id) => { setDeleteTargetId(id); setDeleteTargetType('automation'); setDeleteModalOpen(true); }}
                            onToggle={toggleAutomation}
                            isLoading={automationsLoading}
                            canCreate={canCreate}
                            canDelete={canDelete}
                        />
                    )}

                    {activeTab === 'logs' && (
                        <AdminListView<EmailLog>
                            headerLabel="Delivery Records"
                            title="Email Logs"
                            hideHeader
                            data={filteredLogs}
                            isLoading={logsLoading}
                            columns={logColumns}
                            getRowId={(l) => l.id}
                            searchQuery={logSearch}
                            onSearchChange={setLogSearch}
                            searchPlaceholder="Search by recipient or subject..."
                            sortOptions={LOG_SORT_OPTIONS}
                            sortField={logSort}
                            sortDirection={logSortDir}
                            onSortFieldChange={(f) => setLogSort(f as LogSortField)}
                            onSortDirectionChange={setLogSortDir}
                            filterDrawerContent={filterDrawerContent}
                            activeFilterCount={activeFilterCount}
                            onClearFilters={clearAllFilters}
                            emptyIcon={<Activity size={48} className="text-[var(--accent-gold)]/20" />}
                            emptyTitle="No Email Logs"
                            emptyDescription="Email delivery logs will appear here"
                            itemsPerPage={10}
                        />
                    )}
                </div>

                {/* Template / Automation Drawer */}
                <AdminDrawer
                    isOpen={drawerOpen}
                    onClose={() => { setDrawerOpen(false); resetTemplateForm(); resetAutomationForm(); setShowPreview(false); }}
                    subtitle={drawerMode === 'add' ? 'New Entry' : drawerMode === 'edit' ? 'Modify Record' : 'Record Details'}
                    title={drawerType === 'template'
                        ? (drawerMode === 'add' ? 'Create Template' : drawerMode === 'edit' ? 'Edit Template' : (selectedTemplate?.name || 'Template'))
                        : (drawerMode === 'add' ? 'Create Automation' : drawerMode === 'edit' ? 'Edit Automation' : (selectedAutomation?.name || 'Automation'))
                    }
                    width="620px"
                    viewMode={drawerMode === 'view'}
                    headerFullWidth={showTestPopover}
                    headerActions={drawerType === 'template' ? (
                        <AnimatePresence mode="wait">
                            {showTestPopover ? (
                                <motion.div
                                    key="test-bar"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center gap-2.5 w-full"
                                >
                                    {testStatus ? (
                                        <div className={`flex items-center gap-2 flex-1 ${testStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {testStatus.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            <span className="text-xs font-medium">{testStatus.message}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1.5 text-[var(--accent-gold)] shrink-0">
                                                <Send size={13} />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Test</span>
                                            </div>
                                            <input
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendTest(); }}
                                                placeholder="recipient@example.com"
                                                className="flex-1 min-w-0 px-3 py-2 bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)]/50 focus:ring-1 focus:ring-[var(--accent-gold)]/20 outline-none transition-colors"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSendTest}
                                                disabled={isSendingTest}
                                                className="px-3.5 py-2 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-[11px] font-bold uppercase tracking-wider hover:bg-[var(--accent-gold)]/25 hover:border-[var(--accent-gold)]/50 transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                                                {isSendingTest ? (
                                                    <div className="w-3 h-3 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
                                                ) : (
                                                    <Send size={12} />
                                                )}
                                                {isSendingTest ? '...' : 'Send'}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => { setShowTestPopover(false); setTestStatus(null); }}
                                        className="px-3 py-2 rounded-xl bg-[var(--surface-high)] border border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                                        Cancel
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="normal-actions"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center gap-2"
                                >
                                    <button type="button" onClick={() => setShowPreview(!showPreview)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors ${showPreview
                                            ? 'bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)]'
                                            : 'bg-[var(--surface-high)] border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30'
                                            }`}>
                                        <Eye size={14} />
                                        Preview
                                    </button>
                                    <button type="button" onClick={() => { setShowTestPopover(true); if (!testEmail) { supabase.auth.getUser().then(({ data }) => { if (data.user?.email) setTestEmail(data.user.email); }); } }}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors bg-[var(--surface-high)] border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30">
                                        <Send size={13} />
                                        Test
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : undefined}
                    onEditClick={drawerMode === 'view' ? () => {
                        setDrawerMode('edit');
                        if (drawerType === 'template' && selectedTemplate) loadTemplateForm(selectedTemplate);
                        if (drawerType === 'automation' && selectedAutomation) loadAutomationForm(selectedAutomation);
                    } : undefined}
                    onDeleteClick={drawerMode === 'view' && canDelete ? () => {
                        const id = drawerType === 'template' ? selectedTemplate?.id : selectedAutomation?.id;
                        if (id) { setDeleteTargetId(id); setDeleteTargetType(drawerType); setDeleteModalOpen(true); setDrawerOpen(false); }
                    } : undefined}
                    onSave={drawerMode !== 'view' ? (drawerType === 'template' ? handleSaveTemplate : handleSaveAutomation) : undefined}
                    saveLabel={drawerMode === 'add' ? 'Create' : 'Update'}
                    isSaving={isSaving}
                >
                    {drawerType === 'template' ? templateDrawerBody : automationDrawerBody}
                </AdminDrawer >

                {/* Email Preview Panel (Left of Drawer) */}
                <AnimatePresence>
                    {
                        drawerOpen && drawerType === 'template' && showPreview && (
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                                className="fixed top-0 bottom-0 z-[202] flex flex-col"
                                style={{ right: '620px', width: '520px' }}
                            >
                                {/* Panel background */}
                                <div className="absolute inset-0 bg-gradient-to-bl from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] border-l border-r border-[var(--accent-gold)]/15 shadow-[-20px_0_60px_rgba(0,0,0,0.3)]" />

                                {/* Content */}
                                <div className="relative flex flex-col h-full">

                                    {/* Email Client Chrome */}
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        {/* Subject bar */}
                                        <div className="flex items-center gap-3 px-5 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700">
                                                <Mail size={11} className="text-zinc-400 shrink-0" />
                                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                    {formSubject.replace(/\{\{first_name\}\}/g, 'John') || 'Email Subject'}
                                                </span>
                                            </div>
                                            <button onClick={() => setShowPreview(false)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/15 text-zinc-400 hover:text-red-400 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>

                                        {/* Rendered email */}
                                        <div className="flex-1 relative">
                                            <iframe
                                                srcDoc={previewSrcDoc}
                                                sandbox="allow-same-origin"
                                                className="w-full h-full border-0"
                                                title="Email Preview"
                                            />
                                            {/* Sample data badge */}
                                            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">Sample Data</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

                {/* Delete Modal */}
                < DeleteModal
                    isOpen={deleteModalOpen}
                    isDeleting={isDeleting}
                    title={`Delete ${deleteTargetType === 'template' ? 'Template' : 'Automation'}`}
                    description={`Are you sure you want to delete this ${deleteTargetType}? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onClose={() => { setDeleteModalOpen(false); setDeleteTargetId(null); }}
                />
            </div >
        </PermissionGate>
    );
}
