"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
    label: string;
    icon?: LucideIcon;
    variant?: 'gold' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
}

const variantStyles = {
    gold: 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border-[var(--accent-gold)]/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-[var(--surface-mid)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-[9px] gap-1',
    md: 'px-2.5 py-1 text-[10px] gap-1.5',
    lg: 'px-3 py-1.5 text-[11px] gap-2',
};

export function StatusBadge({
    label,
    icon: Icon,
    variant = 'neutral',
    size = 'md',
    pulse = false,
    className = '',
}: StatusBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                inline-flex items-center rounded-full border font-bold uppercase tracking-wider
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `}
        >
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
            )}
            {Icon && <Icon size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />}
            <span>{label}</span>
        </motion.div>
    );
}
