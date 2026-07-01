"use client";

import type { LucideIcon } from "lucide-react";

export interface ViewOption<V extends string = string> {
    /** Unique key for this view mode */
    view: V;
    /** Lucide icon component */
    icon: LucideIcon;
    /** Display label */
    label: string;
}

export interface ViewToggleProps<V extends string = string> {
    /** Available view options */
    options: ViewOption<V>[];
    /** Currently active view */
    activeView: V;
    /** Called when a view is selected */
    onViewChange: (view: V) => void;
    /** Optional extra content rendered to the right of the toggle (e.g. drag hint) */
    trailing?: React.ReactNode;
}

export function ViewToggle<V extends string = string>({
    options,
    activeView,
    onViewChange,
    trailing,
}: ViewToggleProps<V>) {
    return (
        <div className="flex items-center gap-4 h-12">
            <div className="flex items-center h-full bg-[var(--surface-high)] border border-[var(--border-subtle)] rounded-2xl p-1 gap-1" role="tablist" aria-label="View mode">
                {options.map(({ view, icon: Icon, label }) => (
                    <button
                        key={view}
                        onClick={() => onViewChange(view)}
                        role="tab"
                        aria-selected={activeView === view}
                        aria-label={`${label} view`}
                        className={`relative flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors ${activeView === view
                            ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                            : 'text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)] hover:bg-[var(--surface-mid)]'
                            }`}
                    >
                        <Icon size={14} aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>
            {trailing}
        </div>
    );
}
