"use client";

import React from "react";

interface AdminPageHeaderProps {
    /** Small gold eyebrow text above the title (e.g. "Marketing Hub") */
    eyebrow: string;
    /** Main h1 title */
    title: string;
    /** Optional badge/count shown next to the title in muted mono */
    badge?: React.ReactNode;
    /** Subtitle / description shown below the title */
    description?: string;
    /** Right-side action buttons */
    actions?: React.ReactNode;
    /** Content centred absolutely in the header (e.g. view-toggle tabs) */
    centreContent?: React.ReactNode;
}

/**
 * Shared page header for all admin pages.
 *
 * Layout:
 *   [eyebrow]
 *   [title]  [badge]
 *   [description]
 *                      [centreContent]        [actions]
 */
export function AdminPageHeader({
    eyebrow,
    title,
    badge,
    description,
    actions,
    centreContent,
}: AdminPageHeaderProps) {
    return (
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Left — text stack */}
            <div className="space-y-2">
                <span className="text-[var(--accent-gold)] text-[10px] uppercase tracking-[0.4em] font-bold">
                    {eyebrow}
                </span>

                <div className="flex items-baseline gap-4">
                    <h1 className="text-4xl font-serif text-[var(--text-primary)]">{title}</h1>
                    {badge !== undefined && badge !== null && (
                        <span className="text-lg font-mono text-[var(--accent-gold)]/40">{badge}</span>
                    )}
                </div>

                {description && (
                    <p className="text-sm text-[var(--text-secondary)]/60 max-w-lg">{description}</p>
                )}
            </div>

            {/* Centre — optional tab/toggle (positioned absolutely on desktop) */}
            {centreContent && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 hidden md:block">
                    {centreContent}
                </div>
            )}

            {/* Right — action buttons */}
            {actions && (
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
