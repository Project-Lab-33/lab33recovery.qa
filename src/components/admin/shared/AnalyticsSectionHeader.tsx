"use client";

import React from "react";

export interface AnalyticsSectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
}

export function AnalyticsSectionHeader({ title, subtitle, icon: Icon }: AnalyticsSectionHeaderProps) {
    return (
        <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={14} className="text-[var(--accent-gold)]/60" />}
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-gold)]">{title}</h3>
            </div>
            {subtitle && <p className="text-2xl font-serif text-[var(--text-primary)] tracking-tight">{subtitle}</p>}
        </div>
    );
}
