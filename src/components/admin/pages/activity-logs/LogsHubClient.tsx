"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Server } from "lucide-react";
import { containerVariants, itemVariants } from "@/components/admin/shared/AnalyticsComponents";
import { AdminPageHeader, PermissionGate } from "@/components/admin/shared";
import ActivityLogsClient from "./ActivityLogsClient";
import { AuthLogsTab } from "./components/AuthLogsTab";
import { SystemLogsTab } from "./components/SystemLogsTab";
import type { LogsTab } from "./types";

const TABS: { id: LogsTab; label: string; icon: typeof Activity; description: string }[] = [
    { id: 'activity', label: 'Activity', icon: Activity, description: 'Admin actions & audit trail' },
    { id: 'auth', label: 'Auth', icon: Shield, description: 'Login & authentication events' },
    { id: 'system', label: 'System', icon: Server, description: 'API errors & server logs' },
];

export default function LogsHubClient({ initialTab = 'activity' }: { initialTab?: LogsTab }) {
    const [activeTab, setActiveTab] = useState<LogsTab>(initialTab);

    const tabBar = (
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-mid)]/60 border border-[var(--border-subtle)] w-fit backdrop-blur-sm">
            {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${isActive
                            ? 'text-[var(--accent-gold)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="logsTabIndicator"
                                className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/12 to-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 shadow-[0_0_20px_rgba(212,175,119,0.08)]"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        <Icon size={15} className="relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <PermissionGate resource="settings" action="read">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col flex-1 min-h-0"
            >
                {/* Shared Header */}
                <motion.div variants={itemVariants}>
                    <AdminPageHeader
                        eyebrow="System"
                        title="Logs"
                        centreContent={tabBar}
                    />
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-1 min-h-0 mt-8"
                    >
                        {activeTab === 'activity' && <ActivityLogsClient />}
                        {activeTab === 'auth' && <AuthLogsTab />}
                        {activeTab === 'system' && <SystemLogsTab />}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </PermissionGate>
    );
}
