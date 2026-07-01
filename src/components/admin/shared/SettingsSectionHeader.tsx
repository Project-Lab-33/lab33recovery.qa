"use client";

import React from "react";
import { motion } from "framer-motion";

export interface SettingsSectionHeaderProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    /** Animation delay in seconds */
    delay?: number;
    /** Optional trailing action (e.g. a refresh button) */
    action?: React.ReactNode;
    /** Accent color — defaults to var(--accent-gold) */
    accentColor?: string;
}

export function SettingsSectionHeader({
    icon: Icon,
    title,
    subtitle,
    delay = 0,
    action,
    accentColor = 'var(--accent-gold)',
}: SettingsSectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex items-center justify-between mb-4"
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg border flex items-center justify-center"
                    style={{
                        backgroundColor: `${accentColor}15`,
                        borderColor: `${accentColor}30`,
                        color: accentColor,
                    }}
                >
                    <Icon size={14} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
                    <p className="text-[10px] text-[var(--text-muted)] tracking-wide">{subtitle}</p>
                </div>
            </div>
            {action}
        </motion.div>
    );
}
