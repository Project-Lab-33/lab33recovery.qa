"use client";

import React from "react";
import { motion } from "framer-motion";

export interface KpiCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    /** Accent color for icon and glow — defaults to var(--accent-gold) */
    accent?: string;
    /** Optional subtitle/description below the value */
    sub?: string;
    /** Trend direction */
    trend?: 'up' | 'down' | 'neutral';
    /** Trend label (e.g. "+12%") */
    trendLabel?: string;
    /** Animation delay in seconds */
    delay?: number;
}

export function KpiCard({ label, value, icon: Icon, accent, sub, trend, trendLabel, delay = 0 }: KpiCardProps) {
    const accentColor = accent || 'var(--accent-gold)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative p-5 rounded-2xl bg-[linear-gradient(135deg,var(--surface-mid)_0%,var(--surface-low)_100%)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors group overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" style={{ background: `radial-gradient(circle, ${accentColor}15, transparent)` }} />
            <div className="relative flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}>
                    <Icon size={16} strokeWidth={1.5} />
                </div>
                {trend && trendLabel && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendLabel}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mt-1">{label}</p>
            {sub && <p className="text-[10px] text-[var(--text-muted)] mt-1">{sub}</p>}
        </motion.div>
    );
}
