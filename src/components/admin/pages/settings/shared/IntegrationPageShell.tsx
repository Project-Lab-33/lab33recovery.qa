"use client";

import React from "react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { AdminLoader } from "@/components/admin/shared/AdminLoader";
import { PermissionGate, StatusIndicator, AdminPageHeader } from "@/components/admin/shared";
import type { ConnectionStatus } from "@/components/admin/shared";

const ACCENT = "#b48c50";

interface IntegrationPageShellProps {
    /** Small uppercase pre-title above the heading */
    headerLabel: string;
    /** Main page heading */
    title: string;
    /** Short description below the heading */
    description: string;
    /** Connection status for the status indicator */
    status: ConnectionStatus | 'loading';
    /** Whether data is being fetched */
    isLoading: boolean;
    /** Whether initial data has loaded at least once */
    hasData: boolean;
    /** Refresh handler */
    onRefresh: () => void;
    /** Accent color override */
    accent?: string;
    /** Children rendered inside the glass panel */
    children: React.ReactNode;
    /** Optional extra header buttons */
    headerActions?: React.ReactNode;
}

/**
 * Standard outer shell for integration settings pages.
 * Provides: PermissionGate → loading state → header + refresh + status → glass panel wrapper
 */
export function IntegrationPageShell({
    headerLabel,
    title,
    description,
    status,
    isLoading,
    hasData,
    onRefresh,
    accent = ACCENT,
    children,
    headerActions,
}: IntegrationPageShellProps) {
    if (isLoading && !hasData) {
        return (
            <PermissionGate resource="settings" action="read">
                <AdminLoader page title={`Loading ${title}...`} />
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="settings" action="read">
            <div className="w-full flex flex-col h-full pt-0">
                <AdminPageHeader
                    eyebrow={headerLabel}
                    title={title}
                    description={description}
                    actions={
                        <div className="flex items-center gap-3">
                            {headerActions}
                            <button onClick={onRefresh} disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] transition-colors text-[11px] font-bold uppercase tracking-wider">
                                <RefreshCcw size={13} className={isLoading ? 'animate-spin' : ''} />Refresh
                            </button>
                            <StatusIndicator status={status} />
                        </div>
                    }
                />

                <div className="mt-8 flex-1 overflow-y-auto pipeline-scrollbar pb-8">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] border rounded-2xl" style={{ borderColor: `${accent}22`, boxShadow: `0 0 80px ${accent}0a` }} />
                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: `${accent}08` }} />
                        <div className="relative">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </div>
        </PermissionGate>
    );
}
