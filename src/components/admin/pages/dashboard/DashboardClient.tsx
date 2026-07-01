"use client";

import { motion } from "framer-motion";
import { useDashboard } from "./hooks/useDashboard";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ActivityItem, RecentEntry, ServiceHealthItem } from "./hooks/useDashboard";
import {
    containerVariants,
    itemVariants,
    CustomTooltip,
    GOLD,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    GOLD_DIM,
    useChartTheme,
} from "@/components/admin/shared/AnalyticsComponents";
import { PermissionGate } from "@/components/admin/shared";
import {
    Users,
    FileText,
    Mail,
    Briefcase,
    ChevronRight,
    RefreshCcw,
    Inbox,
    Zap,
    Bell,
    UserPlus,
    ArrowRight,
    Server,
    Wifi,
    Shield,
    LayoutDashboard,
} from "lucide-react";
import { AdminLoader } from "@/components/admin/shared/AdminLoader";
import type { LucideIcon } from "lucide-react";
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { format, parseISO, formatDistanceToNow } from "date-fns";

const BLUE = '#3B82F6';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BLUE_DIM = 'rgba(59,130,246,0.3)';

function SectionLabel({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-4 mb-4 mt-6 first:mt-0">
            <div className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-[var(--accent-gold)] shadow-[0_0_6px_var(--accent-gold)]" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">{label}</h2>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-medium)] via-[var(--border-subtle)] to-transparent" />
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function KPITile({ title, value, subtitle, icon: Icon, data, color, delay = 0 }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    data: { date: string; count: number }[];
    color: string;
    delay?: number;
}) {
    const safeData = data.length > 0 ? data : Array.from({ length: 14 }).map((_, i) => ({ date: `2024-01-${i + 1}`, count: 0 }));

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.3 } }}
            className="relative group overflow-hidden rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/20 transition-all duration-400 shadow-sm hover:shadow-lg hover:shadow-black/5 h-full"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/[0.015] to-transparent pointer-events-none" />

            <div className="relative px-4 py-3.5">
                {/* Top Row: Icon + Sparkline */}
                <div className="flex items-center justify-between mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-mid)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-gold)]/30 transition-all duration-400 shadow-inner">
                        <Icon size={13} strokeWidth={2.5} style={{ color }} className="group-hover:brightness-125 transition-all" />
                    </div>

                    <div className="w-20 h-8 -mr-1 overflow-hidden opacity-50 group-hover:opacity-90 transition-all duration-600 origin-right">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={safeData}>
                                <defs>
                                    <linearGradient id={`g-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke={color}
                                    strokeWidth={1.2}
                                    fill={`url(#g-${title.replace(/\s/g, '')})`}
                                    dot={false}
                                    animationDuration={1200}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Value */}
                <p className="text-2xl font-serif text-[var(--text-primary)] tracking-tight leading-none tabular-nums">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>

                {/* Label + Subtitle */}
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-[1px] w-3 bg-[var(--accent-gold)]/40 group-hover:w-5 transition-all duration-500" />
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color }}>{title}</p>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium leading-tight truncate">{subtitle}</p>
            </div>
        </motion.div>
    );
}

function PipelineItem({ label, count, total, color, isLast }: { label: string; count: number; total: number; color: string; isLast: boolean }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="relative flex items-center gap-4 py-2 group cursor-default">
            {!isLast && (
                <div className="absolute left-[5.5px] top-5 bottom-[-10px] w-[1px] bg-[var(--border-subtle)] z-0 group-hover:bg-[var(--accent-gold)]/20 transition-colors duration-400" />
            )}

            <div className="relative z-10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-high)]/50 flex items-center justify-center group-hover:border-[var(--accent-gold)]/50 transition-all duration-400 group-hover:scale-110">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold group-hover:text-[var(--text-primary)] transition-colors">{label}</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-serif font-bold text-[var(--text-primary)] tabular-nums">{count}</span>
                        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">/ {total}</span>
                    </div>
                </div>

                <div className="relative w-full h-[2px] rounded-full bg-[var(--surface-high)]/30 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                    />
                </div>
            </div>

            <span className="text-[10px] font-bold text-[var(--text-secondary)] tabular-nums min-w-[28px] text-right">{pct}%</span>
        </div>
    );
}

function TimelineItem({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
    const cfg = {
        new_applicant: { icon: FileText, color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/5' },
        new_waitlist: { icon: UserPlus, color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5' },
        status_change: { icon: RefreshCcw, color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5' },
        email_sent: { icon: Mail, color: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/5' },
        system: { icon: Zap, color: 'text-[var(--accent-gold)]', border: 'border-[var(--accent-gold)]/20', bg: 'bg-[var(--accent-gold)]/5' },
    }[item.type] || { icon: Bell, color: 'text-[var(--text-muted)]', border: 'border-[var(--border-subtle)]', bg: 'bg-[var(--surface-mid)]' };

    const TimeIcon = cfg.icon;

    return (
        <div className="flex gap-3 group">
            <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-lg border ${cfg.border} ${cfg.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-400 group-hover:scale-105 mt-0.5`}>
                    <TimeIcon size={12} className={`${cfg.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                </div>
                {!isLast && <div className="w-[1px] flex-1 bg-gradient-to-b from-[var(--border-subtle)] to-transparent mt-1.5 mb-1.5" />}
            </div>
            <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-0.5">
                    <p className="text-[11px] font-bold text-[var(--text-primary)] leading-none uppercase tracking-wider group-hover:text-[var(--accent-gold)] transition-colors truncate">{item.title}</p>
                    <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold whitespace-nowrap">
                        {formatDistanceToNow(parseISO(item.created_at), { addSuffix: false })}
                    </span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed truncate">{item.message}</p>
            </div>
        </div>
    );
}

// Local override of ChartCard for tighter alignment
function DashboardChartCard({ title, subtitle, children, className = '' }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.3 } }}
            className={`relative group ${className}`}
        >
            {/* Subtle Surface Glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-[var(--border-medium)] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]" />

            <div className="relative h-full bg-[linear-gradient(135deg,var(--surface-mid)_0%,var(--surface-low)_100%)] border border-[var(--border-subtle)] group-hover:border-[var(--accent-gold)]/10 rounded-2xl p-4 transition-all duration-500 overflow-hidden shadow-sm group-hover:shadow-xl group-hover:shadow-black/5">
                {/* HUD Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-[0.3]" />

                <div className="mb-3 relative flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase">{title}</h3>
                        {subtitle && <p className="text-[10px] text-[var(--text-secondary)]/80 uppercase tracking-wider mt-1 font-bold">{subtitle}</p>}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]/20 group-hover:bg-[var(--accent-gold)] group-hover:animate-pulse transition-all duration-500" />
                </div>
                <div className="relative">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

function QuickAction({ icon: Icon, label, href, badge }: { icon: LucideIcon; label: string; href: string; badge?: number }) {
    return (
        <motion.a
            href={href}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)]/[0.02] transition-all duration-400 group relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/5 h-full"
        >
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-mid)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-gold)]/30 transition-all duration-400 shadow-inner">
                <Icon size={13} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors duration-400" />
            </div>

            <p className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] uppercase tracking-wider transition-all truncate">
                {label}
            </p>

            {badge !== undefined && badge > 0 && (
                <span className="text-[10px] font-bold text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded-full border border-[var(--accent-gold)]/20">
                    {badge}
                </span>
            )}
            <ArrowRight size={11} className="text-[var(--text-muted)]/40 group-hover:text-[var(--accent-gold)] group-hover:translate-x-0.5 transition-all duration-400 flex-shrink-0" />
        </motion.a>
    );
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
    supabase: Server,
    resend: Mail,
    vercel: Shield,
};

const STATUS_COLORS: Record<string, { dot: string; text: string; glow: string }> = {
    healthy: { dot: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_6px_rgba(16,185,129,0.5)]' },
    degraded: { dot: 'bg-amber-500', text: 'text-amber-500', glow: 'shadow-[0_0_6px_rgba(245,158,11,0.5)]' },
    down: { dot: 'bg-red-500', text: 'text-red-500', glow: 'shadow-[0_0_6px_rgba(239,68,68,0.5)]' },
    unknown: { dot: 'bg-[var(--text-muted)]', text: 'text-[var(--text-muted)]', glow: '' },
};

function HealthStrip({ items }: { items: ServiceHealthItem[] }) {
    if (items.length === 0) return null;

    const allHealthy = items.every(s => s.status === 'healthy');
    const downCount = items.filter(s => s.status === 'down').length;
    const degradedCount = items.filter(s => s.status === 'degraded').length;

    const summaryColor = allHealthy ? 'text-emerald-500' : downCount > 0 ? 'text-red-500' : 'text-amber-500';
    const summaryLabel = allHealthy ? 'All Operational' : downCount > 0 ? `${downCount} Down` : `${degradedCount} Degraded`;

    return (
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)] h-full">
            <div className="flex items-center gap-2 flex-shrink-0">
                <Wifi size={11} className={summaryColor} />
                <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${summaryColor}`}>{summaryLabel}</span>
            </div>

            <div className="h-3 w-[1px] bg-[var(--border-subtle)]" />

            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {items.map(item => {
                    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.unknown;
                    const ServiceIcon = SERVICE_ICONS[item.service_key] || Server;
                    return (
                        <div key={item.service_key} className="flex items-center gap-1.5 flex-shrink-0 group" title={`${item.service_name}: ${item.status}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${colors.glow}`} />
                            <ServiceIcon size={10} className={`${colors.text} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors hidden sm:inline">
                                {item.service_name}
                            </span>
                        </div>
                    );
                })}
            </div>

            <a href="/admin/settings" className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex-shrink-0">
                Details <ChevronRight size={9} />
            </a>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DashboardSkeleton() {
    return (
        <div className="w-full py-6 space-y-4 animate-pulse">
            <div className="h-16 rounded-xl bg-[var(--surface-high)]/20 border border-[var(--border-subtle)]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[130px] rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 h-[350px] rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]" />
                <div className="lg:col-span-5 h-[350px] rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-[310px] rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]" />
                <div className="h-[310px] rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]" />
            </div>
        </div>
    );
}

export default function DashboardClient() {
    const {
        greeting,
        firstName,
        formattedTime,
        formattedDate,
        stats,
        activity,
        recentEntries,
        serviceHealth,
        isLoading,
        isRefreshing,
        refreshAll,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        refreshData,
    } = useDashboard();

    const ct = useChartTheme();

    const pipelineTotal = stats
        ? (stats.pendingApplications ?? 0) + (stats.shortlistedApplications ?? 0) + (stats.hiredApplications ?? 0) + (stats.archivedApplications ?? 0)
        : 0;

    const actionItems = stats
        ? stats.pendingApplications + stats.unreadNotifications
        : 0;

    if (isLoading) return (
        <AdminLoader
            page
            title="Dashboard"
            subtitle="Loading your command center..."
        />
    );

    return (
        <PermissionGate resource="analytics" action="read">
            <div className="w-full space-y-4">

                {/* Header — greeting + status + actions */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-2xl bg-[var(--surface-high)]/25 border border-[var(--border-subtle)] backdrop-blur-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-gold)]/[0.02] via-transparent to-blue-500/[0.01] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-[var(--accent-gold)]/[0.02] rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-5">
                        {/* Left: Greeting */}
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/10 to-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 flex items-center justify-center">
                                <LayoutDashboard size={16} className="text-[var(--accent-gold)]" />
                            </div>
                            <div>
                                <h1 className="text-xl font-serif text-[var(--text-primary)] leading-none tracking-tight">
                                    {greeting},{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)]">
                                        {firstName}
                                    </span>
                                </h1>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold tracking-wider uppercase">{formattedDate}</span>
                                    <div className="w-[1px] h-3 bg-[var(--border-subtle)]" />
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold tracking-wider">{formattedTime}</span>
                                    <div className="w-[1px] h-3 bg-[var(--border-subtle)]" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500">
                                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                                        </div>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats nuggets + refresh */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Action items */}
                            {actionItems > 0 && (
                                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[var(--accent-gold)]/[0.04] border border-[var(--accent-gold)]/15">
                                    <Bell size={13} className="text-[var(--accent-gold)]" />
                                    <div>
                                        <p className="text-sm font-serif text-[var(--accent-gold)] leading-none tabular-nums">{actionItems}</p>
                                        <p className="text-[8px] uppercase tracking-wider text-[var(--accent-gold)]/60 font-bold mt-0.5">Actions</p>
                                    </div>
                                </div>
                            )}

                            {/* Refresh */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={refreshAll}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[var(--surface-high)]/40 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/20 transition-all disabled:opacity-50"
                                title="Refresh all data"
                            >
                                <RefreshCcw size={13} className={`text-[var(--text-secondary)] ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                    {isRefreshing ? 'Syncing' : 'Refresh'}
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions + Health — Grid aligned */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction icon={FileText} label="Applications" href="/admin/applications/applicants" badge={stats?.pendingApplications} />
                    <QuickAction icon={Users} label="Waitlist" href="/admin/waitlist/subscribers" badge={stats?.unreadWaitlist} />
                    {serviceHealth.length > 0 && (
                        <div className="col-span-2">
                            <HealthStrip items={serviceHealth} />
                        </div>
                    )}
                </div>

                {/* KPI tiles */}
                <section>
                    <SectionLabel label="General Overview" />
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPITile
                            icon={Users}
                            title="Waitlist"
                            value={stats?.totalWaitlist || 0}
                            subtitle={`+${stats?.todayWaitlist || 0} today · +${stats?.weekWaitlist || 0} weekly`}
                            data={stats?.dailyWaitlist || []}
                            color={GOLD}
                        />
                        <KPITile
                            icon={FileText}
                            title="Applications"
                            value={stats?.totalApplications || 0}
                            subtitle={`+${stats?.todayApplications || 0} today · +${stats?.weekApplications || 0} weekly`}
                            data={stats?.dailyApplications || []}
                            color={BLUE}
                        />
                        <KPITile
                            icon={Mail}
                            title="Email Volume"
                            value={stats?.totalEmails || 0}
                            subtitle={`+${stats?.todayEmails || 0} processed today`}
                            data={[]}
                            color="#A855F7"
                        />
                        <KPITile
                            icon={Briefcase}
                            title="Positions"
                            value={stats?.totalPositions || 0}
                            subtitle={`${stats?.pendingApplications ?? 0} requiring action`}
                            data={[]}
                            color="#F59E0B"
                        />
                    </motion.div>
                </section>

                {/* Growth + pipeline */}
                <section>
                    <SectionLabel label="Growth & Funnel" />
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                        {/* Growth Velocity */}
                        <div className="lg:col-span-7 h-full">
                            <DashboardChartCard title="Movement Velocity" subtitle="30-day aggregate · waitlist & applications" className="h-full">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={stats?.dailyCombined || []}>
                                            <defs>
                                                <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={BLUE} stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke={ct.grid} vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(d: string) => { try { return format(parseISO(d), 'MMM d'); } catch { return d; } }}
                                                tick={{ fill: ct.tickDim, fontSize: 9, fontWeight: 600 }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={8}
                                            />
                                            <YAxis
                                                tick={{ fill: ct.tickDim, fontSize: 9, fontWeight: 600 }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                                dx={-8}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="waitlist" name="Waitlist" stroke={GOLD} fill="url(#gradGold)" strokeWidth={1.5} dot={false} animationDuration={1500} />
                                            <Area type="monotone" dataKey="applications" name="Applications" stroke={BLUE} fill="url(#gradBlue)" strokeWidth={1.5} dot={false} animationDuration={1500} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </DashboardChartCard>
                        </div>

                        {/* Pipeline */}
                        <div className="lg:col-span-5 h-full">
                            <DashboardChartCard title="Application Funnel" subtitle="Pipeline conversion" className="h-full">
                                {stats ? (
                                    <div className="flex flex-col h-[300px] justify-between">
                                        {/* Donut */}
                                        <div className="flex justify-center flex-shrink-0">
                                            <div className="w-[110px] h-[110px] relative">
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Total</span>
                                                    <span className="text-lg font-serif text-[var(--text-primary)]">{pipelineTotal}</span>
                                                </div>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'Pending', value: stats.pendingApplications || 0 },
                                                                { name: 'Shortlisted', value: stats.shortlistedApplications || 0 },
                                                                { name: 'Hired', value: stats.hiredApplications || 0 },
                                                                { name: 'Archived', value: stats.archivedApplications || 0 },
                                                            ]}
                                                            dataKey="value"
                                                            innerRadius={38}
                                                            outerRadius={50}
                                                            paddingAngle={3}
                                                            stroke="none"
                                                        >
                                                            {[
                                                                { color: '#F59E0B' },
                                                                { color: '#3B82F6' },
                                                                { color: GOLD },
                                                                { color: '#71717A' },
                                                            ].map((entry, i: number) => (
                                                                <Cell key={i} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        {/* Progress bars */}
                                        <div className="flex-1 space-y-0 mt-2">
                                            <PipelineItem label="Pending" count={stats.pendingApplications || 0} total={pipelineTotal} color="#F59E0B" isLast={false} />
                                            <PipelineItem label="Shortlisted" count={stats.shortlistedApplications || 0} total={pipelineTotal} color="#3B82F6" isLast={false} />
                                            <PipelineItem label="Hired" count={stats.hiredApplications || 0} total={pipelineTotal} color={GOLD} isLast={false} />
                                            <PipelineItem label="Archived" count={stats.archivedApplications || 0} total={pipelineTotal} color="#71717A" isLast={true} />
                                        </div>
                                    </div>
                                ) : null}
                            </DashboardChartCard>
                        </div>
                    </motion.div>
                </section>

                {/* Activity + entries */}
                <section>
                    <SectionLabel label="Recent Activity" />
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-6 items-stretch">
                        {/* Recent Activity */}
                        <div className="lg:col-span-4 h-full">
                            <DashboardChartCard title="System Events" subtitle="Chronological history" className="h-full">
                                <div className="h-[280px] overflow-y-auto custom-scrollbar pr-2">
                                    {activity.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {activity.slice(0, 10).map((item, i) => (
                                                <TimelineItem key={item.id} item={item} isLast={i === Math.min(activity.length, 10) - 1} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Inbox size={20} strokeWidth={1.5} className="text-[var(--text-secondary)] opacity-50 mb-3" />
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">No activity found</p>
                                        </div>
                                    )}
                                </div>
                            </DashboardChartCard>
                        </div>

                        {/* Recent Entries */}
                        <div className="lg:col-span-8 h-full">
                            <DashboardChartCard title="New Signups" subtitle="Latest waitlist and applications" className="h-full">
                                <div className="h-[280px] overflow-y-auto custom-scrollbar pr-2">
                                    {recentEntries.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {recentEntries.map((entry) => (
                                                <motion.a
                                                    key={entry.id}
                                                    href={entry.type === 'application' ? '/admin/applications/applicants' : '/admin/waitlist/subscribers'}
                                                    whileHover={{ x: 3 }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-mid)]/30 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)]/[0.01] transition-all duration-400 group h-[68px] w-full"
                                                >
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.type === 'application' ? 'bg-blue-500/5' : 'bg-emerald-500/5'}`}>
                                                        {entry.type === 'application' ? (
                                                            <FileText size={12} className="text-blue-400 opacity-60" />
                                                        ) : (
                                                            <UserPlus size={12} className="text-emerald-400 opacity-60" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate uppercase tracking-wider">{entry.name}</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)]/80 truncate font-medium mt-0.5">{entry.detail}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                                        {entry.status && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{entry.status}</span>
                                                        )}
                                                        <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold whitespace-nowrap">
                                                            {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: false })}
                                                        </span>
                                                    </div>
                                                </motion.a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Inbox size={20} strokeWidth={1.5} className="text-[var(--text-secondary)] opacity-50 mb-3" />
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">No recent entries</p>
                                        </div>
                                    )}
                                </div>
                            </DashboardChartCard>
                        </div>
                    </motion.div>
                </section>

            </div>
        </PermissionGate>
    );
}
