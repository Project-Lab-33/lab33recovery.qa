"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

export interface SortOption {
    field: string;
    label: string;
    icon: LucideIcon;
    /** Default direction when first selected. Defaults to 'desc' */
    defaultDirection?: 'asc' | 'desc';
}

export interface SortDropdownProps {
    /** Available sort options */
    options: SortOption[];
    /** Currently active sort field */
    sortField: string;
    /** Currently active sort direction */
    sortDirection: 'asc' | 'desc';
    /** Called when the sort field changes */
    onSortFieldChange: (field: string) => void;
    /** Called when the sort direction changes */
    onSortDirectionChange: (direction: 'asc' | 'desc') => void;
    /** The default sort field (used to detect non-default state for the reset button). Defaults to 'created_at' */
    defaultField?: string;
    /** The default sort direction. Defaults to 'desc' */
    defaultDirection?: 'asc' | 'desc';
}

export function SortDropdown({
    options,
    sortField,
    sortDirection,
    onSortFieldChange,
    onSortDirectionChange,
    defaultField = 'created_at',
    defaultDirection = 'desc',
}: SortDropdownProps) {
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    const isNonDefault = sortField !== defaultField || sortDirection !== defaultDirection;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={sortRef}>
            <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${sortOpen || isNonDefault
                    ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                    : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"
                    }`}
                title="Sort"
            >
                <ArrowUpDown size={20} className="absolute inset-0 m-auto" />
            </button>

            <AnimatePresence>
                {sortOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="absolute right-0 top-[calc(100%+8px)] w-[280px] z-[110] rounded-2xl overflow-hidden"
                    >
                        {/* Glass background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] border border-[var(--accent-gold)]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(180,140,80,0.1)]" />

                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative p-2">
                            {/* Header */}
                            <div className="px-4 pt-3 pb-2">
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--accent-gold)]/60">Sort By</span>
                            </div>

                            {/* Sort Options */}
                            {options.map((option) => {
                                const Icon = option.icon;
                                const isActive = sortField === option.field;
                                return (
                                    <button
                                        key={option.field}
                                        onClick={() => {
                                            if (isActive) {
                                                onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                onSortFieldChange(option.field);
                                                onSortDirectionChange(option.defaultDirection || 'desc');
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive
                                            ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-high)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <Icon size={16} className={isActive ? 'text-[var(--accent-gold)]' : 'opacity-40'} />
                                        <span className="flex-1 text-left text-[11px] font-bold uppercase tracking-[0.15em]">{option.label}</span>
                                        {isActive && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6 rounded-lg bg-[var(--accent-gold)]/20 flex items-center justify-center"
                                            >
                                                {sortDirection === 'asc'
                                                    ? <ArrowUp size={12} className="text-[var(--accent-gold)]" />
                                                    : <ArrowDown size={12} className="text-[var(--accent-gold)]" />
                                                }
                                            </motion.div>
                                        )}
                                    </button>
                                );
                            })}

                            {/* Reset */}
                            {isNonDefault && (
                                <div className="px-2 pt-2 mt-1 border-t border-[var(--border-subtle)]/30">
                                    <button
                                        onClick={() => {
                                            onSortFieldChange(defaultField);
                                            onSortDirectionChange(defaultDirection);
                                            setSortOpen(false);
                                        }}
                                        className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500/60 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/5"
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
