"use client";

import { motion } from "framer-motion";
import {
    Users,
    TrendingUp,
    CalendarDays,
    Zap,
    RefreshCcw,
    Target,
    Activity,
    SlidersHorizontal,
    Share2,
} from "lucide-react";
import { AdminLoader } from "@/components/admin/shared/AdminLoader";
import { useState, useMemo, useCallback, useRef } from "react";
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
import { useWaitlistAnalytics } from "./hooks/useWaitlistAnalytics";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { GenderIcon } from "@/components/admin/shared/GenderIcon";
import { AnalyticsFilterDrawer } from "./components/AnalyticsFilterDrawer";
import { CustomTooltip, KPICard, ChartCard, containerVariants, GOLD, GOLD_DIM, CHART_COLORS, HEATMAP_SCALE, useChartTheme } from "@/components/admin/shared/AnalyticsComponents";
import { GENDER_COLORS, HEATMAP_TEXT } from "./constants";
import { ExportOverlay, HeaderIconBtn, Badge, PermissionGate, AdminPageHeader } from "@/components/admin/shared";

export default function WaitlistAnalytics() {
    const {
        isLoading, error, timeRange, setTimeRange, customRange, setCustomRange, fetchData,
        genderFilter, setGenderFilter, nationalityFilter, setNationalityFilter,
        ageRangeFilter, setAgeRangeFilter, activeFilterCount,
        kpis, dailySignups, genderData, ageData, averageAge,
        nationalityData, dayOfWeekData, hourOfDayData, monthlyData,
        emailDomainData, genderAgeHeatmap, projectionData, recentSignups, milestones,
    } = useWaitlistAnalytics();

    const [filtersVisible, setFiltersVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const chartsRef = useRef<HTMLDivElement>(null);
    const chartTheme = useChartTheme();

    const handleSharePDF = useCallback(async () => {
        if (!chartsRef.current) return;
        setIsExporting(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            // Force a slight wait so any layout shifts settle
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(chartsRef.current, {
                scale: 1.5, // High quality render
                useCORS: true,
                logging: false,
                backgroundColor: '#050505', // Match background
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

            // Simple multi-page slicing if the container is very tall
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save(`lab33-waitlist-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        } catch (err) {
            console.error('PDF export error:', err);
        } finally {
            setIsExporting(false);
        }
    }, [chartsRef]);

    // Combine daily + projection for the forecast chart
    const forecastChartData = useMemo(() => {
        const actual = dailySignups.map(d => ({ ...d, projected: null }));
        return [...actual, ...projectionData];
    }, [dailySignups, projectionData]);

    // Heatmap max for color scaling
    const heatmapMax = useMemo(() => Math.max(...genderAgeHeatmap.map(c => c.count), 1), [genderAgeHeatmap]);

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

    if (isLoading) {
        return (
            <PermissionGate resource="waitlist" action="read">
                <AdminLoader page title="Waitlist Insights" subtitle="Analyzing subscriber trends..." />
            </PermissionGate>
        );
    }

    if (error) {
        return (
            <PermissionGate resource="waitlist" action="read">
                <div className="w-full flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button onClick={fetchData} className="text-[var(--accent-gold)] text-xs uppercase tracking-widest hover:underline">Retry</button>
                    </div>
                </div>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="waitlist" action="read">
            <div className="w-full space-y-8 pb-12">
                <AdminPageHeader
                    eyebrow="Behavioral Insights"
                    title="Waitlist Analytics"
                    badge={kpis.totalSubscribers}
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

                <motion.div ref={chartsRef} variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">


                    {/* Row 1: KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <KPICard
                            title="Total Subscribers"
                            value={kpis.totalSubscribers}
                            subtitle="All time registrations"
                            icon={Users}
                            trend={kpis.growthRate > 0 ? 'up' : kpis.growthRate < 0 ? 'down' : 'flat'}
                            trendValue={`${Math.abs(Math.round(kpis.growthRate))}%`}
                        />
                        <KPICard
                            title="Growth Rate"
                            value={`${kpis.growthRate > 0 ? '+' : ''}${Math.round(kpis.growthRate)}%`}
                            subtitle="vs previous 30 days"
                            icon={TrendingUp}
                            trend={kpis.growthRate > 0 ? 'up' : kpis.growthRate < 0 ? 'down' : 'flat'}
                            trendValue="30d"
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
                            subtitle="Signups today"
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

                    {/* Row 2: Registration Velocity (Full Width) */}
                    <div>
                        <ChartCard title="Registration Velocity" subtitle="Daily signups with cumulative total">
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={dailySignups}>
                                        <defs>
                                            <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
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
                                            tick={{ fill: chartTheme.tickFaint, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="count"
                                            stroke={GOLD}
                                            fill="url(#areaGold)"
                                            strokeWidth={2}
                                            name="Daily Signups"
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
                    </div>

                    {/* Row 3: Demographics (3 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Gender Distribution — Donut */}
                        <ChartCard title="Gender Distribution" subtitle={`${kpis.totalSubscribers} subscribers`}>
                            <div className="h-[260px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData as unknown as Array<Record<string, string | number>>}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            stroke="none"
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={index} fill={GENDER_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap justify-center gap-4 mt-2">
                                {genderData.map((g, i) => (
                                    <div key={g.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[g.name] || CHART_COLORS[i] }} />
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]/50">{g.name}</span>
                                        <span className="text-[10px] font-bold text-[var(--text-primary)]">{g.percentage}%</span>
                                    </div>
                                ))}
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
                                        <Bar dataKey="count" name="Subscribers" radius={[6, 6, 0, 0]}>
                                            {ageData.map((entry, index) => (
                                                <Cell key={index} fill={entry.range === 'N/A' ? chartTheme.naFill : GOLD} fillOpacity={entry.range === 'N/A' ? 0.5 : 0.7 + (index * 0.05)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        {/* Top Nationalities — Horizontal Bar */}
                        <ChartCard title="Top Nationalities" subtitle="Top 10 by count">
                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {nationalityData.map((nat, i) => (
                                    <div key={nat.nationality} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[var(--text-secondary)]/30 w-4 text-right font-mono">{i + 1}</span>
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
                    </div>

                    {/* Row 4: Temporal Patterns (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Day of Week — Radar */}
                        <ChartCard title="Signups by Day of Week" subtitle={peakDay ? `Peak: ${peakDay}` : undefined}>
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
                                            name="Signups"
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
                        <ChartCard title="Signups by Hour of Day" subtitle={peakHour ? `Peak hour: ${peakHour}` : undefined}>
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
                                        <Bar dataKey="count" name="Signups" radius={[4, 4, 0, 0]}>
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

                    {/* Row 5: Monthly Growth & Gender×Age Heatmap */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Growth */}
                        <ChartCard title="Monthly Growth" subtitle="Signups per month with growth rate">
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
                                        <Bar yAxisId="left" dataKey="count" name="Signups" fill={GOLD} fillOpacity={0.6} radius={[6, 6, 0, 0]} barSize={28} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        {/* Gender × Age Heatmap */}
                        <ChartCard title="Gender × Age Heatmap" subtitle="Demographic density map">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]/30 text-left px-3 py-2 font-medium"></th>
                                            {['18-24', '25-34', '35-44', '45-54', '55+'].map(range => (
                                                <th key={range} className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)]/40 text-center px-2 py-2 font-medium">{range}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['Male', 'Female', 'Unspecified'].map(gender => (
                                            <tr key={gender}>
                                                <td className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]/50 px-3 py-2 font-medium">{gender}</td>
                                                {['18-24', '25-34', '35-44', '45-54', '55+'].map(ageRange => {
                                                    const cell = genderAgeHeatmap.find(c => c.gender === gender && c.ageRange === ageRange);
                                                    const count = cell?.count || 0;
                                                    return (
                                                        <td key={ageRange} className="px-1 py-1.5">
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ duration: 0.5 }}
                                                                className="mx-auto w-full h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                                                                style={{ backgroundColor: getHeatmapColor(count), color: count > heatmapMax * 0.4 ? HEATMAP_TEXT.bright : HEATMAP_TEXT.dim }}
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

                    {/* Row 6: Email Domains & Milestones */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Email Domain Distribution — Donut */}
                        <ChartCard title="Email Provider Distribution" subtitle="Top 10 email domains">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={emailDomainData.slice(0, 6) as unknown as Array<Record<string, string | number>>}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="count"
                                                nameKey="domain"
                                                stroke="none"
                                            >
                                                {emailDomainData.slice(0, 6).map((_, index) => (
                                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 flex flex-col justify-center">
                                    {emailDomainData.slice(0, 8).map((d, i) => (
                                        <div key={d.domain} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                                <span className="text-[11px] text-[var(--text-secondary)]/60 truncate max-w-[120px]">{d.domain}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-[var(--text-primary)]">{d.count}</span>
                                                <span className="text-[9px] text-[var(--text-secondary)]/30">{d.percentage}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ChartCard>

                        {/* Growth Milestones */}
                        <ChartCard title="Growth Milestones" subtitle="Projected milestone dates">
                            <div className="space-y-4 flex flex-col justify-center min-h-[200px]">
                                {milestones.length > 0 ? milestones.map((m, i) => (
                                    <motion.div
                                        key={m.target}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.15, duration: 0.5 }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-high)] border border-[var(--border-subtle)]"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-gold)]/10 flex items-center justify-center flex-shrink-0">
                                            <Target className="w-5 h-5 text-[var(--accent-gold)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-serif text-[var(--text-primary)]">{m.target.toLocaleString()} Subscribers</p>
                                            <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">
                                                Est. {format(parseISO(m.estimatedDate), 'MMM d, yyyy')} · {m.daysNeeded} days
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-[var(--accent-gold)] font-medium">{m.daysNeeded}d</p>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center py-8">
                                        <p className="text-[var(--text-secondary)]/30 text-xs">Not enough data to project milestones</p>
                                    </div>
                                )}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Row 7: Growth Forecast (Full Width) */}
                    <div>
                        <ChartCard title="Growth Forecast" subtitle="Actual trend with 30-day projection">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={forecastChartData}>
                                        <defs>
                                            <linearGradient id="areaForecast" x1="0" y1="0" x2="0" y2="1">
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
                                            fill="url(#areaForecast)"
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

                    {/* Row 8: Recent Registrations Table */}
                    <div>
                        <ChartCard title="Recent Registrations" subtitle={`Last ${recentSignups.length} signups`}>
                            <div className="overflow-x-auto -mx-2">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-[var(--border-subtle)]">
                                            {['Name', 'Email', 'Nationality', 'Gender', 'Age', 'Joined'].map(h => (
                                                <th key={h} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]/30 text-left px-3 py-3 font-medium">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSignups.map((s, i) => (
                                            <motion.tr
                                                key={s.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03, duration: 0.4 }}
                                                className="border-b border-[var(--border-subtle)]/30 hover:bg-[var(--surface-high)]/30 transition-colors"
                                            >
                                                <td className="px-3 py-3">
                                                    <span className="text-sm text-[var(--text-primary)]">{s.name}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-xs text-[var(--text-secondary)]/50">{s.email}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-xs text-[var(--text-secondary)]/60">{s.nationality}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <GenderIcon gender={s.gender} />
                                                        <span className="text-[10px] text-[var(--text-secondary)]/40 uppercase">{s.gender}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-xs text-[var(--text-secondary)]/50">{s.age !== null ? s.age : '—'}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-[10px] text-[var(--text-secondary)]/30">
                                                        {formatDistanceToNow(parseISO(s.created_at), { addSuffix: true })}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {recentSignups.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-[var(--text-secondary)]/30 text-xs">No subscribers yet</p>
                                    </div>
                                )}
                            </div>
                        </ChartCard>
                    </div>

                </motion.div>

                {/* Analytics Filter Drawer */}
                <AnalyticsFilterDrawer
                    filtersVisible={filtersVisible}
                    setFiltersVisible={setFiltersVisible}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    genderFilter={genderFilter}
                    setGenderFilter={setGenderFilter}
                    nationalityFilter={nationalityFilter}
                    setNationalityFilter={setNationalityFilter}
                    ageRangeFilter={ageRangeFilter}
                    setAgeRangeFilter={setAgeRangeFilter}
                    activeFilterCount={activeFilterCount}
                />

                {/* Export loading overlay */}
                <ExportOverlay isVisible={isExporting} title="Generating PDF" subtitle="Capturing analytics charts…" />
            </div>
        </PermissionGate>
    );
}
