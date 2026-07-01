"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Send, Shield, Key, CheckCircle, XCircle, AlertTriangle,
    RefreshCcw, ExternalLink, Zap,
    Activity, Globe, Hash, TrendingUp, Layers, Clock,
    FileText, Target, Percent, CalendarDays, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useChartTheme } from "@/components/admin/shared/AnalyticsComponents";
import {
    IntegrationPageShell, SectionLabel, SectionDivider,
    GlassSection, KpiGrid, ConnectionStatusHeader,
    CredentialCard, CredentialInput,
} from "../shared";

interface DomainRecord { type: string; name: string; value: string; status: string; priority?: number }
interface DomainInfo { id: string; name: string; status: string; region: string; created_at: string; records: DomainRecord[] }
interface DailyVolume { date: string; total: number; waitlist: number; application: number; welcome: number; test: number; other: number }
interface TemplateBreakdown { name: string; count: number }
interface AutomationItem { id: string; name: string; isActive: boolean; triggerEvent: string; triggerCount: number; lastTriggeredAt: string | null; templateName: string | null }

interface EmailSettingsData {
    settings: Record<string, { value: string; label: string | null; description: string | null; updated_at: string }>;
    resend: {
        status: 'connected' | 'error' | 'not_configured';
        apiKeyConfigured: boolean;
        apiKeyPreview: string;
        quotaUsed: number;
        quotaLimit: number;
        dailyUsed: number;
        dailyLimit: number;
        cycleStartDay: number;
    };
    usage: {
        thisMonth: number;
        lastMonth: number;
        total: number;
        totalFailed: number;
        monthLabel: string;
        successRate: number;
        avgDaily: number;
        peakDay: { date: string; count: number } | null;
    };
    domain: DomainInfo | null;
    dailyVolume: DailyVolume[];
    templateBreakdown: TemplateBreakdown[];
    automations: {
        total: number;
        active: number;
        templates: number;
        items: AutomationItem[];
    };
}

const RS = "#b48c50";
const PIE_COLORS = ["#b48c50", "#d4a86a", "#8b6f3a", "#c9a55a", "#a07842"];
const TEMPLATE_LABELS: Record<string, string> = {
    waitlist_signup: "Waitlist",
    application_received: "Application",
    welcome: "Welcome",
    test: "Test",
};

function DnsStatusDot({ status }: { status: string }) {
    const verified = status === 'verified';
    return <div className={`w-2 h-2 rounded-full ${verified ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]'}`} />;
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--surface-mid)]/90 backdrop-blur-xl border border-[var(--border-medium)] rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">{label}</p>
            <div className="space-y-1">
                {payload.filter(e => e.value > 0).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[11px] text-[var(--text-secondary)]">{entry.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ResendEmailSettings() {
    const supabase = useMemo(() => createClient(), []);
    const chartTheme = useChartTheme();

    const [emailSettings, setEmailSettings] = useState<EmailSettingsData | null>(null);
    const [emailLoading, setEmailLoading] = useState(true);
    const [senderName, setSenderName] = useState('');
    const [senderAddress, setSenderAddress] = useState('');
    const [isEditingSender, setIsEditingSender] = useState(false);
    const [isSavingSender, setIsSavingSender] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchEmailSettings = useCallback(async () => {
        setEmailLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            const res = await fetch('/api/admin/settings/email', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data: EmailSettingsData = await res.json();
            setEmailSettings(data);
            setSenderName(data.settings?.email_from_name?.value || 'Lab 33 Recovery');
            setSenderAddress(data.settings?.email_from_address?.value || 'marketing@lab33recovery.qa');
        } catch (err) {
            console.error('Failed to fetch email settings:', err);
            toast.error('Failed to load email settings');
        } finally {
            setEmailLoading(false);
        }
    }, [supabase]);

    useEffect(() => { fetchEmailSettings(); }, [fetchEmailSettings]);

    const handleSaveSender = async () => {
        setIsSavingSender(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) { toast.error('Not authenticated'); return; }
            const res = await fetch('/api/admin/settings/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ email_from_name: senderName, email_from_address: senderAddress }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');
            toast.success('Sender settings updated');
            setIsEditingSender(false);
            fetchEmailSettings();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save sender settings');
        } finally {
            setIsSavingSender(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
            setTestStatus({ type: 'error', message: 'Enter a valid email address' });
            setTimeout(() => setTestStatus(null), 3000);
            return;
        }
        setIsSendingTest(true);
        setTestStatus(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) { setTestStatus({ type: 'error', message: 'Not authenticated' }); return; }
            const res = await fetch('/api/send-test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({
                    to: testEmail.trim(),
                    subject: 'Settings Test — Lab 33 Recovery',
                    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#1a1816;}</style></head><body><table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1816;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#232320;border-radius:16px;overflow:hidden;border:1px solid rgba(200,165,92,0.15);"><tr><td style="padding:40px 40px 24px;text-align:center;"><div style="display:inline-block;padding:6px 18px;border:1px solid rgba(200,165,92,0.3);border-radius:100px;color:#C8A55C;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">System Test</div></td></tr><tr><td style="padding:0 40px 16px;text-align:center;"><h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#F5F3ED;">Email Delivery<br/><span style="color:#C8A55C;">Verified ✓</span></h1></td></tr><tr><td style="padding:0 40px 32px;"><p style="margin:0;font-size:14px;line-height:1.7;color:#a8a5a0;text-align:center;">This test confirms your Resend integration is working. Emails from <strong style="color:#F5F3ED;">${senderName}</strong> via <strong style="color:#C8A55C;">${senderAddress}</strong> are being delivered.</p></td></tr><tr><td style="padding:24px 40px;border-top:1px solid rgba(200,165,92,0.1);text-align:center;"><p style="margin:0;font-size:11px;color:#666;letter-spacing:1px;text-transform:uppercase;">Lab 33 Recovery • Settings Test</p></td></tr></table></td></tr></table></body></html>`,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');
            setTestStatus({ type: 'success', message: `Sent to ${testEmail}` });
            setTestEmail('');
            setTimeout(() => setTestStatus(null), 4000);
        } catch (err: unknown) {
            setTestStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send' });
            setTimeout(() => setTestStatus(null), 4000);
        } finally {
            setIsSendingTest(false);
        }
    };

    const resendStatus = emailLoading ? 'loading' : (emailSettings?.resend.status || 'not_configured');
    const usage = emailSettings?.usage;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const trendPct = usage && usage.lastMonth > 0 ? Math.round(((usage.thisMonth - usage.lastMonth) / usage.lastMonth) * 100) : null;
    const quotaLimit = emailSettings?.resend.quotaLimit || 3000;
    const quotaUsed = emailSettings?.resend.quotaUsed ?? 0;
    const dailyUsed = emailSettings?.resend.dailyUsed ?? 0;
    const dailyLimit = emailSettings?.resend.dailyLimit || 100;
    const remaining = Math.max(quotaLimit - quotaUsed, 0);
    const usagePct = Math.round((quotaUsed / quotaLimit) * 100);
    const quotaColor = usagePct >= 90 ? '#fb7185' : usagePct >= 70 ? '#fbbf24' : '#34d399';
    const quotaColorClass = usagePct >= 90 ? 'bg-rose-400' : usagePct >= 70 ? 'bg-amber-400' : 'bg-emerald-400';

    // Chart data
    const chartData = useMemo(() => {
        return (emailSettings?.dailyVolume || []).map(d => ({
            ...d,
            label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
    }, [emailSettings?.dailyVolume]);

    const pieData = useMemo(() => {
        return (emailSettings?.templateBreakdown || []).map(t => ({
            name: TEMPLATE_LABELS[t.name] || t.name,
            value: t.count,
        }));
    }, [emailSettings?.templateBreakdown]);

    const domain = emailSettings?.domain;
    const automations = emailSettings?.automations;
    const dnsRecords = domain?.records || [];
    const spf = dnsRecords.find(r => r.type === 'TXT' && (r.name.includes('spf') || r.value?.includes('spf')));
    const dkim = dnsRecords.find(r => r.type === 'CNAME' || (r.type === 'TXT' && r.name.includes('dkim')));
    const dmarc = dnsRecords.find(r => r.name.includes('dmarc'));

    const kpis = [
        { label: "This Cycle", value: usage?.thisMonth ?? 0, sub: usage?.monthLabel || "current cycle", icon: Send, accent: RS },
        { label: "Last Cycle", value: usage?.lastMonth ?? 0, sub: "previous billing cycle", icon: BarChart3, accent: "#f59e0b" },
        { label: "Total Sent", value: usage?.total ?? 0, sub: "all time deliveries", icon: Hash, accent: "#10b981" },
        { label: "Success Rate", value: `${usage?.successRate ?? 100}%`, sub: (usage?.totalFailed ?? 0) > 0 ? `${usage?.totalFailed} failed` : "no failures", icon: Percent, accent: (usage?.totalFailed ?? 0) > 0 ? "#fb7185" : "#34d399" },
        { label: "Avg / Day", value: usage?.avgDaily ?? 0, sub: "active days average", icon: Activity, accent: "#8b5cf6" },
        { label: "Peak Day", value: usage?.peakDay?.count ?? 0, sub: usage?.peakDay?.date ? new Date(usage.peakDay.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—", icon: TrendingUp, accent: "#f97316" },
    ];

    return (
        <IntegrationPageShell
            headerLabel="Email Infrastructure"
            title="Resend"
            description="Manage email delivery, sender identity, and monitor usage quotas"
            status={emailLoading ? 'loading' : emailSettings?.resend.status === 'connected' ? 'connected' : 'not_configured'}
            isLoading={emailLoading}
            hasData={!!emailSettings}
            onRefresh={fetchEmailSettings}
        >
            {/* API Status Header */}
            <ConnectionStatusHeader
                configured={!!emailSettings?.resend.apiKeyConfigured}
                title="API Key Active"
                subtitle={emailSettings?.resend.apiKeyConfigured ? 'Resend API key configured via environment variables' : 'Set RESEND_API_KEY in your .env.local file'}
                tokenPreview={emailSettings?.resend.apiKeyConfigured ? emailSettings.resend.apiKeyPreview : undefined}
                portalUrl="https://resend.com/api-keys"
                portalLabel="Manage Keys"
            />

            <div className="px-8 py-8 space-y-10">

                {/* Usage Overview */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <Activity size={14} style={{ color: RS }} strokeWidth={1.5} />
                            <label className="text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: RS }}>Usage Overview</label>
                            {usage?.monthLabel && <span className="text-[10px] text-[var(--text-muted)] font-mono ml-1">{usage.monthLabel}</span>}
                        </div>
                    </div>

                    {/* Quota Progress */}
                    <GlassSection delay={0.1} className="mb-4">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">Monthly Quota</p>
                                    <span className="px-2 py-0.5 rounded-md bg-[var(--surface-high)] border border-[var(--border-subtle)] text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Free Plan</span>
                                </div>
                                <p className="text-[12px] font-bold tabular-nums" style={{ color: quotaColor }}>
                                    {quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()} <span className="text-[var(--text-muted)] text-[10px] font-normal">({usagePct}%)</span>
                                </p>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden bg-[var(--surface-high)]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(usagePct, 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full rounded-full ${quotaColorClass}`} />
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-[10px] text-[var(--text-muted)]"><span className="font-bold" style={{ color: quotaColor }}>{remaining.toLocaleString()}</span> remaining</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Today: <span className="font-bold text-[var(--text-secondary)]">{dailyUsed}</span> / {dailyLimit}</p>
                            </div>
                        </div>
                    </GlassSection>

                    {/* KPI Cards — 6 cards, 3 cols */}
                    <KpiGrid kpis={kpis} columns={3} className="mb-6" />

                    {/* Charts Row: Area + Pie side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Daily Volume Area Chart */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                            className="lg:col-span-2 rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 p-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Daily Send Volume</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Last 30 days</p>
                                </div>
                                <CalendarDays size={14} style={{ color: RS }} />
                            </div>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="rsArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={RS} stopOpacity={0.3} />
                                                <stop offset="100%" stopColor={RS} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="rsAppArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTheme.tickFaint }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 10, fill: chartTheme.tickFaint }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="waitlist" name="Waitlist" stroke={RS} fill="url(#rsArea)" strokeWidth={2} dot={false} />
                                        <Area type="monotone" dataKey="application" name="Application" stroke="#f59e0b" fill="url(#rsAppArea)" strokeWidth={2} dot={false} />
                                        <Area type="monotone" dataKey="welcome" name="Welcome" stroke="#10b981" fill="transparent" strokeWidth={1.5} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Template Distribution Pie */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 p-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">By Template</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">30-day distribution</p>
                                </div>
                                <Layers size={14} style={{ color: RS }} />
                            </div>
                            <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-3">
                                {pieData.map((t, i) => (
                                    <div key={t.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-[11px] text-[var(--text-secondary)]">{t.name}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-[var(--text-primary)] tabular-nums">{t.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                <SectionDivider />

                {/* Domain & DNS Health */}
                <div>
                    <SectionLabel icon={Globe} label="Domain & DNS Health" delay={0.15} />
                    <GlassSection delay={0.2}>
                        <div className="px-6 py-5 border-b border-[var(--border-strong)]/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${RS}15`, borderColor: `${RS}30`, color: RS }}>
                                        <Globe size={14} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{domain?.name || 'lab33recovery.qa'}</h3>
                                        <p className="text-[10px] text-[var(--text-secondary)]/40">{domain ? `Region: ${domain.region} • Added ${new Date(domain.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Domain verification'}</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${domain?.status === 'verified' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                                    {domain?.status === 'verified' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                    {domain?.status || 'checking...'}
                                </span>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'SPF', desc: 'Sender Policy Framework', record: spf },
                                    { label: 'DKIM', desc: 'DomainKeys Identified Mail', record: dkim },
                                    { label: 'DMARC', desc: 'Domain Authentication', record: dmarc },
                                ].map(dns => (
                                    <div key={dns.label} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-high)]/30 border border-[var(--border-subtle)]">
                                        <DnsStatusDot status={dns.record?.status || (domain ? 'pending' : 'unknown')} />
                                        <div>
                                            <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">{dns.label}</p>
                                            <p className="text-[10px] text-[var(--text-muted)]">
                                                {dns.record ? (dns.record.status === 'verified' ? 'Verified' : 'Pending') : (domain ? 'Not found' : dns.desc)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassSection>
                </div>

                <SectionDivider />

                {/* Automation Health */}
                <div>
                    <SectionLabel icon={Zap} label="Automation Health" count={`${automations?.active ?? 0} active`} delay={0.2} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {[
                            { label: 'Automations', value: automations?.total ?? 0, icon: Zap, accent: RS },
                            { label: 'Active', value: automations?.active ?? 0, icon: Target, accent: '#10b981' },
                            { label: 'Templates', value: automations?.templates ?? 0, icon: FileText, accent: '#f59e0b' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50">
                                <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ backgroundColor: `${s.accent}15`, borderColor: `${s.accent}30`, color: s.accent }}>
                                    <s.icon size={16} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{s.value}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {automations && automations.items.length > 0 && (
                        <GlassSection delay={0.25}>
                            <div className="divide-y divide-[var(--border-strong)]/20">
                                {automations.items.map(a => (
                                    <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${a.isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-zinc-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text-primary)]">{a.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">
                                                    {a.templateName && <span className="font-mono">{a.templateName}</span>}
                                                    {a.templateName && ' • '}{a.triggerEvent.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-bold tabular-nums" style={{ color: RS }}>{a.triggerCount.toLocaleString()}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">sent</p>
                                            </div>
                                            {a.lastTriggeredAt && (
                                                <div className="text-right">
                                                    <p className="text-[11px] text-[var(--text-secondary)]">{new Date(a.lastTriggeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">last fired</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassSection>
                    )}
                </div>

                <SectionDivider />

                {/* Connection & Configuration */}
                <div>
                    <SectionLabel icon={Shield} label="Connection & Configuration" delay={0.25} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* API Key Card */}
                        <GlassSection delay={0.3}>
                            <div className="px-6 py-5 border-b border-[var(--border-strong)]/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${RS}15`, borderColor: `${RS}30`, color: RS }}><Key size={14} strokeWidth={1.5} /></div>
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">API Key</h3>
                                        <p className="text-[10px] text-[var(--text-secondary)]/40">Resend authentication credentials</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><Key size={14} className="text-[var(--text-muted)]" /><span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold">API Key</span></div>
                                    {emailSettings?.resend.apiKeyConfigured ? (
                                        <code className="text-[12px] text-[var(--text-secondary)] font-mono bg-[var(--surface-high)] px-3 py-1 rounded-lg border border-[var(--border-subtle)]">{emailSettings.resend.apiKeyPreview}</code>
                                    ) : <span className="text-[11px] text-rose-400 font-bold">Not configured</span>}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><Shield size={14} className="text-[var(--text-muted)]" /><span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Key Type</span></div>
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-wider">Sending Only</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><Globe size={14} className="text-[var(--text-muted)]" /><span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Domain</span></div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={12} className="text-emerald-400" />
                                        <code className="text-[12px] text-emerald-400 font-mono">lab33recovery.qa</code>
                                    </div>
                                </div>
                                <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-secondary)] transition-colors text-[10px] font-bold uppercase tracking-wider">
                                    <ExternalLink size={10} />Open Resend Dashboard
                                </a>
                            </div>
                        </GlassSection>

                        {/* Sender Identity Card */}
                        <CredentialCard
                            icon={Send} title="Sender Identity" subtitle="From field configuration"
                            isEditing={isEditingSender} onEdit={() => setIsEditingSender(true)}
                            onCancel={() => { setIsEditingSender(false); setSenderName(emailSettings?.settings?.email_from_name?.value || 'Lab 33 Recovery'); setSenderAddress(emailSettings?.settings?.email_from_address?.value || 'marketing@lab33recovery.qa'); }}
                            onSave={handleSaveSender} isSaving={isSavingSender}
                            configured={true} editLabel="Edit" delay={0.34}
                        >
                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-2 block">Sender Name</label>
                                {isEditingSender ? (
                                    <CredentialInput label="" value={senderName} onChange={setSenderName} placeholder="Lab 33 Recovery" />
                                ) : (
                                    <div className="px-4 py-2.5 bg-[var(--surface-high)]/40 border border-[var(--border-subtle)] rounded-xl">
                                        <span className="text-sm text-[var(--text-primary)] font-medium">{senderName}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-2 block">Sender Email</label>
                                {isEditingSender ? (
                                    <>
                                        <CredentialInput label="" value={senderAddress} onChange={setSenderAddress} placeholder="marketing@lab33recovery.qa" hint="Must use verified domain: @lab33recovery.qa" />
                                    </>
                                ) : (
                                    <div className="px-4 py-2.5 bg-[var(--surface-high)]/40 border border-[var(--border-subtle)] rounded-xl">
                                        <span className="text-sm text-[var(--text-primary)] font-mono">{senderAddress}</span>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-[var(--surface-high)]/30 border border-[var(--border-subtle)]">
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-1">Preview</p>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    <span className="text-[var(--text-primary)] font-medium">{senderName}</span>
                                    <span className="text-[var(--text-muted)]"> &lt;</span>
                                    <span className="font-mono text-[13px]" style={{ color: RS }}>{senderAddress}</span>
                                    <span className="text-[var(--text-muted)]">&gt;</span>
                                </p>
                            </div>
                        </CredentialCard>
                    </div>
                </div>

                <SectionDivider />

                {/* Quick Test */}
                <div>
                    <SectionLabel icon={Mail} label="Quick Test" count="delivery verification" delay={0.35} />
                    <GlassSection delay={0.4}>
                        <div className="px-6 py-5 border-b border-[var(--border-strong)]/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${RS}15`, borderColor: `${RS}30`, color: RS }}>
                                    <Mail size={14} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Send Test Email</h3>
                                    <p className="text-[10px] text-[var(--text-secondary)]/40">Verify your email delivery is working</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <div className="flex items-center gap-3">
                                <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="recipient@example.com"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendTest()} disabled={resendStatus !== 'connected'}
                                    className="flex-1 px-4 py-2.5 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors disabled:opacity-40"
                                    onFocus={(e) => e.target.style.borderColor = RS} onBlur={(e) => e.target.style.borderColor = ''} />
                                <button onClick={handleSendTest} disabled={isSendingTest || resendStatus !== 'connected'}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-[11px] uppercase tracking-wider hover:brightness-110 transition-colors disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${RS}, #0891b2)`, boxShadow: `0 4px 16px ${RS}40` }}>
                                    {isSendingTest ? <RefreshCcw size={14} className="animate-spin" /> : <Send size={14} />}Send
                                </button>
                            </div>
                            <AnimatePresence>
                                {testStatus && (
                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                        className={`mt-3 flex items-center gap-2 text-[11px] font-bold ${testStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {testStatus.type === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {testStatus.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {resendStatus !== 'connected' && resendStatus !== 'loading' && (
                                <p className="mt-3 text-[10px] text-[var(--text-muted)]/60 flex items-center gap-1.5">
                                    <AlertTriangle size={10} />Resend must be connected to send test emails
                                </p>
                            )}
                        </div>
                    </GlassSection>
                </div>

            </div>
        </IntegrationPageShell>
    );
}
