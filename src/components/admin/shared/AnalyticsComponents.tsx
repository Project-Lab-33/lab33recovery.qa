"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from "lucide-react";

// Stagger animations
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

// Chart color palette
export const GOLD = '#C8A55C';
export const GOLD_DIM = 'rgba(200, 165, 92, 0.3)';
export const GOLD_FAINT = 'rgba(200, 165, 92, 0.08)';
export const CHART_COLORS = ['#C8A55C', '#8B6E3B', '#E8D5A3', '#A08040', '#D4B87A', '#6B5530'];
export const HEATMAP_SCALE = ['rgba(200,165,92,0.05)', 'rgba(200,165,92,0.15)', 'rgba(200,165,92,0.3)', 'rgba(200,165,92,0.5)', 'rgba(200,165,92,0.7)', 'rgba(200,165,92,0.9)'];

// Dark mode: white-alpha text on dark background
const CHART_AXIS_DARK = {
    grid: 'rgba(255,255,255,0.12)',
    tick: 'rgba(255,255,255,0.85)',
    tickDim: 'rgba(255,255,255,0.70)',
    tickFaint: 'rgba(255,255,255,0.50)',
    tickBold: 'rgba(255,255,255,0.45)',
    axisLine: 'rgba(255,255,255,0.08)',
    naFill: 'rgba(255,255,255,0.08)',
} as const;

// Light mode: black-alpha text on light background
const CHART_AXIS_LIGHT = {
    grid: 'rgba(0,0,0,0.12)',
    tick: 'rgba(0,0,0,0.85)',
    tickDim: 'rgba(0,0,0,0.70)',
    tickFaint: 'rgba(0,0,0,0.50)',
    tickBold: 'rgba(0,0,0,0.55)',
    axisLine: 'rgba(0,0,0,0.10)',
    naFill: 'rgba(0,0,0,0.06)',
} as const;

// Static export — kept for backward compat (PDF color-swap code)
export const CHART_AXIS = CHART_AXIS_DARK;

// Recharts SVG props require raw color strings (no CSS vars), hence this hook.
export function useChartTheme() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const html = document.documentElement;
        const check = () => setIsDark(html.classList.contains('dark'));
        check();

        // Watch for class changes (theme toggle)
        const observer = new MutationObserver(check);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return isDark ? CHART_AXIS_DARK : CHART_AXIS_LIGHT;
}

export const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--surface-mid)]/80 backdrop-blur-xl border border-[var(--border-medium)] rounded-xl px-4 py-3 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">{label}</p>
            <div className="space-y-1.5">
                {payload.map((entry: { color: string; name: string; value: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || GOLD }} />
                            <span className="text-[11px] font-medium text-[var(--text-secondary)]">{entry.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, delay = 0 }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
    delay?: number;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
            className="relative group cursor-default"
        >
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-[var(--accent-gold)]/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[2px]" />

            <div className="relative h-full bg-[linear-gradient(135deg,var(--surface-mid)_0%,var(--surface-low)_100%)] border border-[var(--border-subtle)] group-hover:border-[var(--accent-gold)]/20 rounded-2xl p-6 transition-all duration-500 overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:shadow-black/5">
                {/* Surface Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-high)]/50 border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden group-hover:border-[var(--accent-gold)]/30 transition-colors duration-500 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                        <Icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors duration-500" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            trend === 'down' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                'bg-[var(--surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                            }`}>
                            {trend === 'up' ? <ArrowUpRight size={10} strokeWidth={3} /> : trend === 'down' ? <ArrowDownRight size={10} strokeWidth={3} /> : <Minus size={10} strokeWidth={3} />}
                            {trendValue}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 pt-1">
                    <p className="text-4xl font-serif text-[var(--text-primary)] tracking-tight">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="h-[1px] w-4 bg-[var(--accent-gold)]/40 group-hover:w-8 transition-all duration-700" />
                        <p className="text-[11px] uppercase tracking-wider text-[var(--accent-gold)] font-bold">{title}</p>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]/80 mt-1.5 font-bold group-hover:text-[var(--text-primary)] transition-colors duration-500">
                        {subtitle}
                    </p>
                </div>

                {/* Corner Accent */}
                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute bottom-3 right-3 w-[1px] h-2 bg-[var(--accent-gold)]/20" />
                    <div className="absolute bottom-3 right-3 w-2 h-[1px] bg-[var(--accent-gold)]/20" />
                </div>
            </div>
        </motion.div>
    );
}

export function ChartCard({ title, subtitle, children, className = '' }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
            className={`relative group ${className}`}
        >
            {/* Subtle Surface Glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-[var(--border-medium)] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]" />

            <div className="relative h-full bg-[linear-gradient(135deg,var(--surface-mid)_0%,var(--surface-low)_100%)] border border-[var(--border-subtle)] group-hover:border-[var(--accent-gold)]/10 rounded-2xl p-6 transition-all duration-500 overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:shadow-black/5">
                {/* HUD Scanline Effect - Ultra Subtle */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-[0.3]" />

                <div className="mb-6 relative flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase">{title}</h3>
                        {subtitle && <p className="text-[10px] text-[var(--text-secondary)]/80 uppercase tracking-wider mt-1.5 font-bold">{subtitle}</p>}
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
