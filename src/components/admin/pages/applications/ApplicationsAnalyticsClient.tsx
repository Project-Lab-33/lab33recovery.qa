"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TrendingUp,
    CalendarDays,
    Zap,
    RefreshCcw,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Target,
    Activity,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RefreshCw,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Briefcase,
    CheckCircle2,
    FileText,
    Linkedin,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Clock,
    ArrowUpRight,
    SlidersHorizontal,
    Share2,
} from "lucide-react";
import { AdminLoader } from "@/components/admin/shared/AdminLoader";
import { useMemo, useState, useCallback, useRef } from "react";
import { X, Calendar, Globe2 } from "lucide-react";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import { COUNTRIES, Country } from "@/lib/countries";
import type { ApplicantStatus } from "./types";
import {
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart,
    Line,
} from "recharts";
import { useApplicationsAnalytics, type TimeRange } from "./hooks/useApplicationsAnalytics";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CustomTooltip, KPICard, ChartCard, containerVariants, itemVariants, GOLD, GOLD_DIM, GOLD_FAINT, CHART_COLORS, HEATMAP_SCALE, useChartTheme } from "@/components/admin/shared/AnalyticsComponents";
import { ExportOverlay, HeaderIconBtn, Badge, PermissionGate, AdminPageHeader } from "@/components/admin/shared";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import { createClient } from "@/lib/supabase/client";


// Chart Color Palette
const STATUS_COLORS: Record<string, string> = {
    'Pending': '#F59E0B',
    'Shortlisted': '#3B82F6',
    'Archived': '#6B7280'
};

// Status Badge
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        shortlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        archived: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        hired: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.15em] border ${colors[status] || colors.pending}`}>
            {status}
        </span>
    );
}

export default function ApplicationsAnalytics() {
    const {
        isLoading, error, timeRange, setTimeRange, customRange, setCustomRange, fetchData,
        statusFilter, setStatusFilter, positionFilter, setPositionFilter,
        nationalityFilter, setNationalityFilter, ageRangeFilter, setAgeRangeFilter,
        availablePositions,
        kpis, dailyApplications, statusData, positionData,
        nationalityData, ageData, averageAge, dayOfWeekData, hourOfDayData, monthlyData,
        funnelData, statusPositionHeatmap, projectionData,
        recentApplications, documentStats,
    } = useApplicationsAnalytics();

    const [isExporting, setIsExporting] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const chartsRef = useRef<HTMLDivElement>(null);
    const chartTheme = useChartTheme();

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (timeRange !== 'all') count++;
        if (statusFilter.length > 0) count++;
        if (positionFilter.length > 0) count++;
        if (nationalityFilter.length > 0) count++;
        if (ageRangeFilter.length > 0) count++;
        return count;
    }, [timeRange, statusFilter, positionFilter, nationalityFilter, ageRangeFilter]);

    const timeRangeOptions: { value: TimeRange; label: string }[] = useMemo(() => [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' },
        { value: 'all', label: 'All Time' },
    ], []);

    // Share PDF (via Python generator API)
    const handleSharePDF = useCallback(async () => {
        setIsExporting(true);
        try {
            // Build time range label
            let rangeLabel = 'All Time';
            if (timeRange === 'custom' && customRange) {
                rangeLabel = `${customRange.start} – ${customRange.end}`;
            } else if (timeRange !== 'all') {
                const opt = timeRangeOptions.find(o => o.value === timeRange);
                rangeLabel = `Last ${opt?.label || timeRange}`;
            }

            // Build filter labels
            const filterLabels: string[] = [];
            if (timeRange !== 'all') filterLabels.push(`Time: ${rangeLabel}`);
            if (statusFilter.length > 0) filterLabels.push(`Status: ${statusFilter.join(', ')}`);
            if (positionFilter.length > 0) filterLabels.push(`Position: ${positionFilter.join(', ')}`);
            if (nationalityFilter.length > 0) filterLabels.push(`Nationality: ${nationalityFilter.join(', ')}`);
            if (ageRangeFilter.length > 0) filterLabels.push(`Age: ${ageRangeFilter.join(', ')}`);

            // Send native application data — the Python generator handles both types
            const payload = {
                type: 'applications',
                timeRangeLabel: rangeLabel,
                filterLabels,
                kpis,
                funnelData,
                dailyApplications,
                statusData,
                positionData,
                ageData,
                averageAge,
                nationalityData,
                dayOfWeekData,
                hourOfDayData,
                monthlyData,
                statusPositionHeatmap,
                documentStats: [
                    { name: 'CV Uploaded', value: documentStats.withCV },
                    { name: 'Cover Letter', value: documentStats.withCL },
                    { name: 'LinkedIn Profile', value: documentStats.withLinkedIn },
                ],
                projectionData,
                recentApplications: recentApplications.map(a => ({
                    name: a.name,
                    email: a.email,
                    position: a.position,
                    status: a.status,
                    nationality: a.nationality || '—',
                    age: a.age || null,
                    created_at: a.created_at,
                })),
            };

            // Get auth token for the API
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error('Not authenticated');

            const response = await fetch('/api/analytics-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(err.error || `HTTP ${response.status}`);
            }

            // Download the PDF
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lab33-applications-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Analytics PDF exported successfully");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('PDF export error:', err);
            toast.error(err.message || "Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    }, [kpis, funnelData, dailyApplications, statusData, positionData, ageData, averageAge,
        nationalityData, dayOfWeekData, hourOfDayData, monthlyData, statusPositionHeatmap,
        documentStats, projectionData, recentApplications, timeRange, customRange, timeRangeOptions,
        statusFilter, positionFilter, nationalityFilter, ageRangeFilter]);

    // Combine daily + projection for the forecast chart
    const forecastChartData = useMemo(() => {
        const actual = dailyApplications.map(d => ({ ...d, projected: null }));
        return [...actual, ...projectionData];
    }, [dailyApplications, projectionData]);

    // Heatmap max for color scaling
    const heatmapMax = useMemo(() => Math.max(...statusPositionHeatmap.map(c => c.count), 1), [statusPositionHeatmap]);

    const getHeatmapColor = (count: number) => {
        if (count === 0) return HEATMAP_SCALE[0];
        const idx = Math.min(Math.floor((count / heatmapMax) * (HEATMAP_SCALE.length - 1)), HEATMAP_SCALE.length - 1);
        return HEATMAP_SCALE[idx];
    };

    // Day of week peak
    const peakDay = useMemo(() => {
        const max = Math.max(...dayOfWeekData.map(d => d.count));
        return dayOfWeekData.find(d => d.count === max)?.day || '';
    }, [dayOfWeekData]);

    // Hour peak
    const peakHour = useMemo(() => {
        const max = Math.max(...hourOfDayData.map(d => d.count));
        return hourOfDayData.find(d => d.count === max)?.label || '';
    }, [hourOfDayData]);

    // Top positions for heatmap
    const heatmapPositions = useMemo(() => positionData.slice(0, 5).map(p => p.position), [positionData]);

    if (isLoading) {
        return (
            <PermissionGate resource="applications" action="read">
                <AdminLoader page title="Application Analytics" subtitle="Analyzing candidate funnel..." />
            </PermissionGate>
        );
    }

    if (error) {
        return (
            <PermissionGate resource="applications" action="read">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button onClick={fetchData} className="text-[var(--accent-gold)] text-xs uppercase tracking-widest hover:underline">Retry</button>
                    </div>
                </div>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="applications" action="read">
            <div className="w-full space-y-8 pb-12">
                <AdminPageHeader
                    eyebrow="Recruitment Insights"
                    title="Applications Analytics"
                    badge={kpis.totalApplications}
                    actions={
                        <>
                            <div className="relative">
                                <HeaderIconBtn icon={SlidersHorizontal} active={filtersVisible || activeFilterCount > 0}
                                    onClick={() => setFiltersVisible(!filtersVisible)} title="Filters" />
                                {activeFilterCount > 0 && <Badge count={activeFilterCount} />}
                            </div>
                            <HeaderIconBtn icon={Share2} active={isExporting}
                                onClick={handleSharePDF} title="Share PDF" />
                            <HeaderIconBtn icon={RefreshCcw} active={false}
                                onClick={fetchData} title="Refresh" />
                        </>
                    }
                />

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6" ref={chartsRef}>

                    {/* Row 1: KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <KPICard
                            title="Total Applications"
                            value={kpis.totalApplications}
                            subtitle="All time submissions"
                            icon={Users}
                            trend={kpis.growthRate > 0 ? 'up' : kpis.growthRate < 0 ? 'down' : 'flat'}
                            trendValue={`${Math.abs(Math.round(kpis.growthRate))}%`}
                        />
                        <KPICard
                            title="Shortlisted"
                            value={kpis.shortlistedCount}
                            subtitle={`${kpis.conversionRate}% conversion rate`}
                            icon={CheckCircle2}
                            trend={kpis.shortlistedCount > 0 ? 'up' : 'flat'}
                            trendValue={`${kpis.conversionRate}%`}
                        />
                        <KPICard
                            title="This Week"
                            value={kpis.thisWeek}
                            subtitle={kpis.lastWeek > 0 ? `${kpis.thisWeek >= kpis.lastWeek ? '+' : ''}${kpis.thisWeek - kpis.lastWeek} from last week` : 'No previous data'}
                            icon={CalendarDays}
                            trend={kpis.thisWeek > kpis.lastWeek ? 'up' : kpis.thisWeek < kpis.lastWeek ? 'down' : 'flat'}
                            trendValue={kpis.lastWeek > 0 ? `${Math.round(((kpis.thisWeek - kpis.lastWeek) / kpis.lastWeek) * 100)}%` : '—'}
                        />
                        <KPICard
                            title="Today"
                            value={kpis.today}
                            subtitle="Applications today"
                            icon={Zap}
                        />
                        <KPICard
                            title="Daily Average"
                            value={kpis.avgDailyRate.toFixed(1)}
                            subtitle="30-day rolling average"
                            icon={Activity}
                            trend={kpis.avgDailyRate > kpis.avgDailyRatePrev ? 'up' : kpis.avgDailyRate < kpis.avgDailyRatePrev ? 'down' : 'flat'}
                            trendValue={kpis.avgDailyRatePrev > 0 ? `${Math.round(((kpis.avgDailyRate - kpis.avgDailyRatePrev) / kpis.avgDailyRatePrev) * 100)}%` : '—'}
                        />
                    </div>

                    {/* Row 2: Application Funnel (Full Width) */}
                    <ChartCard title="Recruitment Funnel" subtitle="Application pipeline stages">
                        <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-0">
                            {funnelData.map((stage, i) => (
                                <motion.div
                                    key={stage.stage}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="flex-1 relative"
                                >
                                    <div className={`relative p-5 rounded-xl md:rounded-none ${i === 0 ? 'md:rounded-l-xl' : ''} ${i === funnelData.length - 1 ? 'md:rounded-r-xl' : ''} border border-[var(--border-subtle)] md:border-r-0 ${i === funnelData.length - 1 ? 'md:border-r' : ''}`}
                                        style={{ backgroundColor: `rgba(200,165,92,${0.03 + (i * 0.04)})` }}
                                    >
                                        <p className="text-2xl font-serif text-[var(--text-primary)]">{stage.count.toLocaleString()}</p>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)] font-bold mt-1">{stage.stage}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]/30 mt-0.5">{stage.percentage}%</p>
                                        {i < funnelData.length - 1 && (
                                            <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-6 rounded-full bg-[var(--surface-mid)] border border-[var(--border-subtle)] items-center justify-center">
                                                <ArrowUpRight size={10} className="text-[var(--accent-gold)] rotate-90" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </ChartCard>

                    {/* Row 3: Application Velocity (Full Width) */}
                    <ChartCard title="Application Velocity" subtitle="Daily applications with cumulative total">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={dailyApplications}>
                                    <defs>
                                        <linearGradient id="appAreaGold" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(v) => format(parseISO(v), 'MMM d')}
                                        tick={{ fill: chartTheme.tick, fontSize: 10 }}
                                        axisLine={{ stroke: chartTheme.axisLine }}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fill: chartTheme.tick, fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fill: chartTheme.tickDim, fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="count"
                                        stroke={GOLD}
                                        fill="url(#appAreaGold)"
                                        strokeWidth={2}
                                        name="Daily Applications"
                                        dot={false}
                                        activeDot={{ r: 4, fill: GOLD }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="cumulative"
                                        stroke={GOLD_DIM}
                                        strokeWidth={1.5}
                                        strokeDasharray="6 3"
                                        dot={false}
                                        name="Cumulative"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    {/* Row 4: Status + Positions (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Status Distribution — Donut */}
                        <ChartCard title="Status Distribution" subtitle={`${kpis.totalApplications} applications`}>
                            <div className="h-[260px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData as unknown as Array<Record<string, string | number>>}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={index} fill={STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap justify-center gap-4 mt-2">
                                {statusData.map((s, i) => (
                                    <div key={s.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || CHART_COLORS[i] }} />
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]/50">{s.name}</span>
                                        <span className="text-[10px] font-bold text-[var(--text-primary)]">{s.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        {/* Position Popularity — Horizontal Bar */}
                        <ChartCard title="Top Positions" subtitle="Most applied-for roles">
                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {positionData.map((pos, i) => (
                                    <div key={pos.position} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[var(--text-secondary)]/30 w-4 text-right font-mono">{i + 1}</span>
                                                <span className="text-xs text-[var(--text-primary)]">{pos.position}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[var(--accent-gold)]">{pos.count}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)]/30">{pos.percentage}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-[var(--surface-high)] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pos.percentage}%` }}
                                                transition={{ duration: 1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: GOLD, opacity: 1 - (i * 0.07) }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {positionData.length === 0 && (
                                    <p className="text-[var(--text-secondary)]/30 text-xs text-center py-8">No position data yet</p>
                                )}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Row 4b: Nationalities + Age Distribution (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Nationalities — with Flags */}
                        <ChartCard title="Top Nationalities" subtitle="Top 10 by count">
                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {nationalityData.map((nat, i) => (
                                    <div key={nat.nationality} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[var(--text-secondary)]/30 w-4 text-right font-mono">{i + 1}</span>
                                                {nat.flag && (
                                                    <Image src={nat.flag} alt="" width={16} height={10} className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-subtle)]" />
                                                )}
                                                <span className="text-xs text-[var(--text-primary)]">{nat.nationality}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[var(--accent-gold)]">{nat.count}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)]/30">{nat.percentage}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-[var(--surface-high)] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${nat.percentage}%` }}
                                                transition={{ duration: 1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: GOLD, opacity: 1 - (i * 0.07) }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {nationalityData.length === 0 && (
                                    <p className="text-[var(--text-secondary)]/30 text-xs text-center py-8">No nationality data yet</p>
                                )}
                            </div>
                        </ChartCard>

                        {/* Age Distribution — Bar */}
                        <ChartCard title="Age Distribution" subtitle={averageAge ? `Average age: ${averageAge}` : undefined}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ageData} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                        <XAxis
                                            dataKey="range"
                                            tick={{ fill: chartTheme.tick, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: chartTheme.tickDim, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Applicants" radius={[6, 6, 0, 0]}>
                                            {ageData.map((entry, index) => (
                                                <Cell key={index} fill={entry.range === 'N/A' ? chartTheme.naFill : GOLD} fillOpacity={entry.range === 'N/A' ? 0.5 : 0.7 + (index * 0.05)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </div>

                    {/* Row 5: Temporal Patterns (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Day of Week — Radar */}
                        <ChartCard title="Applications by Day of Week" subtitle={peakDay ? `Peak: ${peakDay}` : undefined}>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={dayOfWeekData} cx="50%" cy="50%" outerRadius="70%">
                                        <PolarGrid stroke={chartTheme.axisLine} />
                                        <PolarAngleAxis
                                            dataKey="shortDay"
                                            tick={{ fill: chartTheme.tickBold, fontSize: 11 }}
                                        />
                                        <PolarRadiusAxis
                                            tick={{ fill: chartTheme.tickFaint, fontSize: 9 }}
                                            axisLine={false}
                                        />
                                        <Radar
                                            name="Applications"
                                            dataKey="count"
                                            stroke={GOLD}
                                            fill={GOLD}
                                            fillOpacity={0.15}
                                            strokeWidth={2}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        {/* Hour of Day — Bar */}
                        <ChartCard title="Applications by Hour of Day" subtitle={peakHour ? `Peak hour: ${peakHour}` : undefined}>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourOfDayData} barSize={12}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: chartTheme.tick, fontSize: 8 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={2}
                                        />
                                        <YAxis
                                            tick={{ fill: chartTheme.tickDim, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]}>
                                            {hourOfDayData.map((entry, index) => {
                                                const maxCount = Math.max(...hourOfDayData.map(d => d.count));
                                                const isPeak = entry.count === maxCount && maxCount > 0;
                                                return <Cell key={index} fill={isPeak ? GOLD : GOLD_DIM} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </div>

                    {/* Row 6: Monthly Growth & Status×Position Heatmap */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Growth */}
                        <ChartCard title="Monthly Growth" subtitle="Applications per month">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fill: chartTheme.tick, fontSize: 9 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            angle={-30}
                                            textAnchor="end"
                                            height={50}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            tick={{ fill: chartTheme.tickDim, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar yAxisId="left" dataKey="count" name="Applications" fill={GOLD} fillOpacity={0.6} radius={[6, 6, 0, 0]} barSize={28} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        {/* Status × Position Heatmap */}
                        <ChartCard title="Status × Position Heatmap" subtitle="Pipeline density map">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]/30 text-left px-3 py-2 font-medium"></th>
                                            {heatmapPositions.map(pos => (
                                                <th key={pos} className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)]/40 text-center px-2 py-2 font-medium max-w-[100px] truncate" title={pos}>{pos.length > 12 ? pos.slice(0, 12) + '…' : pos}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['Pending', 'Shortlisted', 'Archived'].map(status => (
                                            <tr key={status}>
                                                <td className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]/50 px-3 py-2 font-medium">{status}</td>
                                                {heatmapPositions.map(position => {
                                                    const cell = statusPositionHeatmap.find(c => c.status === status && c.position === position);
                                                    const count = cell?.count || 0;
                                                    return (
                                                        <td key={position} className="px-1 py-1.5">
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ duration: 0.5 }}
                                                                className="mx-auto w-full h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                                                                style={{ backgroundColor: getHeatmapColor(count), color: count > heatmapMax * 0.4 ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                                            >
                                                                {count > 0 ? count : '—'}
                                                            </motion.div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Heatmap Legend */}
                            <div className="flex items-center justify-center gap-1 mt-4">
                                <span className="text-[9px] text-[var(--text-secondary)]/30 mr-2">Low</span>
                                {HEATMAP_SCALE.map((color, i) => (
                                    <div key={i} className="w-6 h-3 rounded-sm" style={{ backgroundColor: color }} />
                                ))}
                                <span className="text-[9px] text-[var(--text-secondary)]/30 ml-2">High</span>
                            </div>
                        </ChartCard>
                    </div>

                    {/* Row 7: Document Completeness & Growth Forecast */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Document Completeness */}
                        <ChartCard title="Document Completeness" subtitle="Applicant profile quality">
                            <div className="space-y-5 min-h-[200px] flex flex-col justify-center">
                                {[
                                    { label: 'CV Uploaded', count: documentStats.withCV, rate: documentStats.cvRate, icon: FileText, color: '#C8A55C' },
                                    { label: 'Cover Letter', count: documentStats.withCL, rate: documentStats.clRate, icon: FileText, color: '#8B6E3B' },
                                    { label: 'LinkedIn Profile', count: documentStats.withLinkedIn, rate: documentStats.linkedInRate, icon: Linkedin, color: '#0077B5' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--border-subtle)]"
                                            style={{ backgroundColor: `${item.color}15` }}>
                                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-[var(--text-primary)]">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-[var(--accent-gold)]">{item.count}</span>
                                                    <span className="text-[10px] text-[var(--text-secondary)]/30">{item.rate}%</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-[var(--surface-high)] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.rate}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ChartCard>

                        {/* Growth Forecast */}
                        <ChartCard title="Growth Forecast" subtitle="Actual trend with 30-day projection">
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={forecastChartData}>
                                        <defs>
                                            <linearGradient id="appAreaForecast" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(v) => format(parseISO(v), 'MMM d')}
                                            tick={{ fill: chartTheme.tickDim, fontSize: 9 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fill: chartTheme.tickDim, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="cumulative"
                                            stroke={GOLD}
                                            fill="url(#appAreaForecast)"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Actual"
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="projected"
                                            stroke={GOLD}
                                            strokeWidth={2}
                                            strokeDasharray="8 4"
                                            dot={false}
                                            name="Projected"
                                            connectNulls={false}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </div>

                    {/* Row 8: Recent Applications Table */}
                    <ChartCard title="Recent Applications" subtitle={`Last ${recentApplications.length} submissions`}>
                        <div className="overflow-x-auto -mx-2">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-[var(--border-subtle)]">
                                        {['Name', 'Position', 'Nationality', 'Age', 'Status', 'CV', 'Applied'].map(h => (
                                            <th key={h} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]/30 text-left px-3 py-3 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((a, i) => (
                                        <motion.tr
                                            key={a.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.4 }}
                                            className="border-b border-[var(--border-subtle)]/30 hover:bg-[var(--surface-high)]/30 transition-colors"
                                        >
                                            <td className="px-3 py-3">
                                                <span className="text-sm text-[var(--text-primary)]">{a.name}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-xs text-[var(--text-secondary)]/60">{a.position}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    {a.nationalityFlag && (
                                                        <Image src={a.nationalityFlag} alt="" width={16} height={10} className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-subtle)]" />
                                                    )}
                                                    <span className="text-xs text-[var(--text-secondary)]/50">{a.nationality || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-xs text-[var(--text-secondary)]/50">{a.age !== null && a.age !== undefined ? a.age : '—'}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <StatusBadge status={a.status} />
                                            </td>
                                            <td className="px-3 py-3">
                                                {a.hasCV ? (
                                                    <FileText size={14} className="text-[var(--accent-gold)]" />
                                                ) : (
                                                    <span className="text-[10px] text-[var(--text-secondary)]/20">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-[10px] text-[var(--text-secondary)]/30">
                                                    {formatDistanceToNow(parseISO(a.created_at), { addSuffix: true })}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {recentApplications.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-[var(--text-secondary)]/30 text-xs">No applications yet</p>
                                </div>
                            )}
                        </div>
                    </ChartCard>

                </motion.div>

                {/* Analytics Filter Drawer */}
                <ApplicationsFilterDrawer
                    filtersVisible={filtersVisible}
                    setFiltersVisible={setFiltersVisible}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    positionFilter={positionFilter}
                    setPositionFilter={setPositionFilter}
                    nationalityFilter={nationalityFilter}
                    setNationalityFilter={setNationalityFilter}
                    ageRangeFilter={ageRangeFilter}
                    setAgeRangeFilter={setAgeRangeFilter}
                    availablePositions={availablePositions}
                    activeFilterCount={activeFilterCount}
                />

                {/* Export Overlay */}
                <ExportOverlay isVisible={isExporting} title="Generating PDF" subtitle="Processing recruitment data…" />
            </div>
        </PermissionGate>
    );
}

const TIME_RANGE_PRESETS: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
];

const STATUS_OPTIONS: { value: ApplicantStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'text-amber-400' },
    { value: 'reviewed', label: 'Reviewed', color: 'text-sky-400' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'text-blue-400' },
    { value: 'hired', label: 'Hired', color: 'text-emerald-400' },
    { value: 'rejected', label: 'Rejected', color: 'text-rose-400' },
    { value: 'archived', label: 'Archived', color: 'text-zinc-400' },
];

const AGE_RANGES = [
    { id: '18-24', label: '18–24' },
    { id: '25-34', label: '25–34' },
    { id: '35-44', label: '35–44' },
    { id: '45-54', label: '45–54' },
    { id: '55+', label: '55+' },
];

interface ApplicationsFilterDrawerProps {
    filtersVisible: boolean;
    setFiltersVisible: (v: boolean) => void;
    timeRange: TimeRange;
    setTimeRange: (v: TimeRange) => void;
    customRange: { start: string; end: string } | null;
    setCustomRange: (v: { start: string; end: string } | null) => void;
    statusFilter: string[];
    setStatusFilter: React.Dispatch<React.SetStateAction<string[]>>;
    positionFilter: string[];
    setPositionFilter: React.Dispatch<React.SetStateAction<string[]>>;
    nationalityFilter: string[];
    setNationalityFilter: React.Dispatch<React.SetStateAction<string[]>>;
    ageRangeFilter: string[];
    setAgeRangeFilter: React.Dispatch<React.SetStateAction<string[]>>;
    availablePositions: string[];
    activeFilterCount: number;
}

function ApplicationsFilterDrawer({
    filtersVisible, setFiltersVisible,
    timeRange, setTimeRange,
    customRange, setCustomRange,
    statusFilter, setStatusFilter,
    positionFilter, setPositionFilter,
    nationalityFilter, setNationalityFilter,
    ageRangeFilter, setAgeRangeFilter,
    availablePositions,
    activeFilterCount,
}: ApplicationsFilterDrawerProps) {
    const [tempStart, setTempStart] = useState('');
    const [tempEnd, setTempEnd] = useState('');
    const [natFilterSearch, setNatFilterSearch] = useState('');

    const natFilterSuggestion = useMemo(() => {
        if (!natFilterSearch) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(natFilterSearch.toLowerCase()) &&
            !nationalityFilter.includes(c.name)
        ) || null;
    }, [natFilterSearch, nationalityFilter]);

    const clearAll = () => {
        setTimeRange('all');
        setCustomRange(null);
        setTempStart('');
        setTempEnd('');
        setStatusFilter([]);
        setPositionFilter([]);
        setNationalityFilter([]);
        setAgeRangeFilter([]);
        setNatFilterSearch('');
    };

    const handleApplyCustomRange = () => {
        if (tempStart && tempEnd) {
            setCustomRange({ start: tempStart.split('T')[0], end: tempEnd.split('T')[0] });
            setTimeRange('custom');
        }
    };

    const handleClearCustomRange = () => {
        setTempStart('');
        setTempEnd('');
        setCustomRange(null);
        if (timeRange === 'custom') setTimeRange('all');
    };

    const filterFooter = (
        <div className="px-8 py-6 border-t border-[var(--border-strong)]/60 flex items-center justify-between shrink-0">
            <button type="button" onClick={clearAll}
                className="h-12 px-7 rounded-2xl text-[13px] font-bold uppercase tracking-[0.12em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-colors">
                Clear All
            </button>
            <button type="button" onClick={() => setFiltersVisible(false)}
                className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[13px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-[var(--accent-gold)]/25 hover:shadow-[var(--accent-gold)]/45 hover:scale-[1.02] active:scale-[0.98] transition-colors">
                Apply Filters
            </button>
        </div>
    );

    return (
        <AdminDrawer
            isOpen={filtersVisible}
            onClose={() => setFiltersVisible(false)}
            subtitle={`${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''} applied`}
            title="Filter Analytics"
            width="680px"
            footer={filterFooter}
            bodyClassName="space-y-8"
        >
            {/* Time Range */}
            <FilterSection title="Time Range">
                <div className="grid grid-cols-5 gap-3">
                    {TIME_RANGE_PRESETS.map(opt => {
                        const isSelected = timeRange === opt.value;
                        return (
                            <button key={opt.value} type="button"
                                onClick={() => { setTimeRange(opt.value); setCustomRange(null); setTempStart(''); setTempEnd(''); }}
                                className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border ${isSelected
                                    ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                                    : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    }`}>
                                {opt.label}
                            </button>
                        );
                    })}
                    {/* Custom button — 5th in the grid */}
                    <button type="button"
                        onClick={() => {
                            if (timeRange === 'custom') {
                                handleClearCustomRange();
                            } else {
                                setTimeRange('custom');
                            }
                        }}
                        className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${timeRange === 'custom'
                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                            : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                            }`}>
                        <Calendar size={13} />
                        Custom
                    </button>
                </div>

                {/* Custom Date Range — revealed when Custom is selected */}
                <AnimatePresence>
                    {timeRange === 'custom' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">From</label>
                                        <DateTimePicker
                                            value={tempStart || null}
                                            onChange={(v) => setTempStart(v)}
                                            dateOnly
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">To</label>
                                        <DateTimePicker
                                            value={tempEnd || null}
                                            onChange={(v) => setTempEnd(v)}
                                            dateOnly
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <button type="button" onClick={handleApplyCustomRange}
                                        disabled={!tempStart || !tempEnd}
                                        className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-gold)]/20 hover:shadow-[var(--accent-gold)]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-colors">
                                        Apply Range
                                    </button>
                                    {customRange && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[var(--accent-gold)] font-medium italic">
                                                {customRange.start} — {customRange.end}
                                            </span>
                                            <button type="button" onClick={handleClearCustomRange}
                                                className="text-[11px] font-bold uppercase tracking-wider text-rose-500/60 hover:text-rose-400 transition-colors">
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </FilterSection>

            {/* Status */}
            <FilterSection title="Status" columns={3}>
                {STATUS_OPTIONS.map((opt) => (
                    <FilterPill
                        key={opt.value}
                        label={opt.label}
                        isSelected={statusFilter.includes(opt.value)}
                        onClick={() => setStatusFilter(prev => statusFilter.includes(opt.value) ? prev.filter(x => x !== opt.value) : [...prev, opt.value])}
                    />
                ))}
            </FilterSection>

            {/* Position */}
            <FilterSection title="Position">
                <div className="flex flex-wrap gap-3">
                    {availablePositions.map((pos) => (
                        <FilterPill
                            key={pos}
                            label={pos}
                            isSelected={positionFilter.includes(pos)}
                            onClick={() => setPositionFilter(prev => positionFilter.includes(pos) ? prev.filter(x => x !== pos) : [...prev, pos])}
                        />
                    ))}
                    {availablePositions.length === 0 && (
                        <p className="text-[11px] text-[var(--text-muted)]/40 italic">No positions available</p>
                    )}
                </div>
            </FilterSection>

            {/* Nationality */}
            <FilterSection title="Nationality">
                <div className="relative h-12 px-5 rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-medium)] focus-within:border-[var(--accent-gold)]/40 focus-within:bg-[var(--surface-high)]/60 transition-colors duration-300 flex items-center gap-3">
                    <Globe2 size={16} className="text-[var(--accent-gold)]/60 shrink-0" />
                    <div className="h-4 w-px bg-[var(--border-medium)]" />
                    <div className="relative flex-1">
                        {natFilterSuggestion && natFilterSearch && (
                            <div className="absolute inset-0 pointer-events-none flex items-center">
                                <span className="text-sm font-serif text-[var(--text-muted)]/50 whitespace-pre">
                                    {natFilterSearch}
                                    <span className="text-[var(--text-muted)]/50">{natFilterSuggestion.name.slice(natFilterSearch.length)}</span>
                                </span>
                            </div>
                        )}
                        <input type="text" value={natFilterSearch}
                            onChange={(e) => setNatFilterSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.key === 'Tab' || e.key === 'Enter') && natFilterSuggestion) {
                                    e.preventDefault();
                                    setNationalityFilter(prev => [...prev, natFilterSuggestion.name]);
                                    setNatFilterSearch('');
                                }
                            }}
                            placeholder="Type country name..."
                            className="w-full bg-transparent text-sm font-serif text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 focus:outline-none relative z-10"
                        />
                    </div>
                    {natFilterSearch && (
                        <button type="button" onClick={() => setNatFilterSearch('')}
                            className="p-1 rounded-lg text-[var(--text-muted)]/50 hover:text-[var(--text-secondary)] transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
                {nationalityFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {nationalityFilter.map((nat) => {
                            const countryData = COUNTRIES.find(c => c.name === nat);
                            return (
                                <motion.div key={nat} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-lg bg-gradient-to-r from-[var(--accent-gold)]/15 to-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
                                    {countryData && <Image src={countryData.flag} alt="" width={16} height={12} className="w-4 h-3 object-cover rounded-sm" />}
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{nat}</span>
                                    <button type="button" onClick={() => setNationalityFilter(prev => prev.filter(x => x !== nat))}
                                        className="p-0.5 rounded hover:bg-[var(--surface-high)] transition-colors ml-1">
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </FilterSection>

            {/* Age Range */}
            <FilterSection title="Age Range" columns={3}>
                {AGE_RANGES.map((range) => (
                    <FilterPill
                        key={range.id}
                        label={range.label}
                        isSelected={ageRangeFilter.includes(range.id)}
                        onClick={() => setAgeRangeFilter(prev => ageRangeFilter.includes(range.id) ? prev.filter(x => x !== range.id) : [...prev, range.id])}
                    />
                ))}
            </FilterSection>
        </AdminDrawer>
    );
}

