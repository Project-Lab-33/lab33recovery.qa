"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface FilterPillProps {
    /** Button label */
    label: string;
    /** Whether the pill is currently selected */
    isSelected: boolean;
    /** Click handler */
    onClick: () => void;
    /** Optional icon component */
    icon?: LucideIcon;
    /** Optional ReactNode icon (alternative to LucideIcon) */
    iconNode?: ReactNode;
    /** Additional className overrides */
    className?: string;
}

export function FilterPill({
    label,
    isSelected,
    onClick,
    icon: Icon,
    iconNode,
    className = "",
}: FilterPillProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isSelected}
            className={`h-12 flex items-center justify-center gap-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors border ${isSelected
                ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                } ${className}`}
        >
            {Icon && <Icon size={14} className={isSelected ? 'text-white' : 'text-[var(--accent-gold)]/40'} />}
            {iconNode}
            {label}
        </button>
    );
}

export interface FilterSectionProps {
    /** Section title (e.g. "Gender", "Status") */
    title: string;
    /** Section content — typically filter pills, inputs, or other controls */
    children: ReactNode;
    /** Optional grid columns. If provided, wraps children in a grid. */
    columns?: 2 | 3 | 4 | 5;
}

export function FilterSection({
    title,
    children,
    columns,
}: FilterSectionProps) {
    const gridClass = columns
        ? columns === 2 ? 'grid-cols-2'
            : columns === 4 ? 'grid-cols-4'
                : columns === 5 ? 'grid-cols-5'
                    : 'grid-cols-3'
        : undefined;

    return (
        <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                {title}
            </label>
            {gridClass ? (
                <div className={`grid ${gridClass} gap-3`}>
                    {children}
                </div>
            ) : children}
        </div>
    );
}
