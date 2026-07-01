"use client";

import React from "react";

export interface HeaderIconBtnProps {
    /** Lucide icon component */
    icon: React.ElementType;
    /** Whether this button is in an active/toggled state */
    active?: boolean;
    /** Click handler */
    onClick: () => void;
    /** Tooltip text */
    title: string;
}

export function HeaderIconBtn({ icon: Icon, active, onClick, title }: HeaderIconBtnProps) {
    return (
        <div className="relative">
            <button onClick={onClick} title={title} aria-label={title}
                className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${active
                    ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                    : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"}`}>
                <Icon size={20} aria-hidden="true" className="absolute inset-0 m-auto" />
            </button>
        </div>
    );
}

export interface BadgeProps {
    /** Number to display */
    count: number;
}

export function Badge({ count }: BadgeProps) {
    return (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-gold)] border-2 border-[var(--background)] flex items-center justify-center text-[9px] font-bold text-black">
            {count}
        </div>
    );
}
