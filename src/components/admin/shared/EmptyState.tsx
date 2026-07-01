"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    /** "standalone" renders a motion.div; "table-row" renders inside <tr><td> for table contexts */
    variant?: "standalone" | "table-row";
    /** Required when variant="table-row" so the td spans the full table width */
    colSpan?: number;
    /** Custom height — defaults to min-h-[60vh] for standalone, h-[720px] for table-row */
    height?: string;
    className?: string;
}

/** Shared visual content used by both variants */
function EmptyStateContent({
    title,
    description,
    icon,
    action,
}: Pick<EmptyStateProps, "title" | "description" | "icon" | "action">) {
    return (
        <>
            {/* Icon Container */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--surface-high)] to-[var(--surface-mid)] flex items-center justify-center border border-[var(--border-subtle)] shadow-inner">
                {icon || <Inbox size={36} className="text-[var(--text-secondary)]/20" />}
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
                <p className="text-sm text-[var(--text-primary)] font-medium">{title}</p>
                {description && (
                    <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.3em]">
                        {description}
                    </p>
                )}
            </div>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-dark)] text-black text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-gold)]/20 hover:shadow-[var(--accent-gold)]/40 hover:scale-[1.02] transition-colors"
                >
                    {action.label}
                </button>
            )}
        </>
    );
}

export function EmptyState({
    title,
    description,
    icon,
    action,
    variant = "standalone",
    colSpan = 1,
    height,
    className = "",
}: EmptyStateProps) {
    const contentProps = { title, description, icon, action };

    if (variant === "table-row") {
        return (
            <tr>
                <td colSpan={colSpan} className="px-8 text-center">
                    <div className={`flex flex-col items-center justify-center gap-6 ${height || "h-[720px]"} ${className}`}>
                        <EmptyStateContent {...contentProps} />
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-center justify-center gap-6 ${height || "min-h-[calc(100vh-220px)]"} ${className}`}
        >
            <EmptyStateContent {...contentProps} />
        </motion.div>
    );
}
