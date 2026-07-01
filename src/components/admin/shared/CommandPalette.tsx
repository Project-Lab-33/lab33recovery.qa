"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, Users, FileText, Settings, Activity, FileLock2, Mail, ArrowRight } from "lucide-react";
import { useAdminUser } from "@/hooks/useAdminUser";
import { hasPermission } from "@/lib/permissions";

interface CommandItem {
    id: string;
    label: string;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    section: string;
    keywords: string[];
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { user: adminUser } = useAdminUser();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Generate available commands based on permissions
    const getAvailableCommands = (): CommandItem[] => {
        const overrides = adminUser?.permissions_override;
        const canViewWaitlist = hasPermission(adminUser?.role, 'waitlist', 'read', overrides);
        const canViewApplications = hasPermission(adminUser?.role, 'applications', 'read', overrides);
        const canViewEmail = hasPermission(adminUser?.role, 'email', 'read', overrides);
        const canViewSettings = hasPermission(adminUser?.role, 'settings', 'read', overrides);

        const commands: CommandItem[] = [
            { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid, section: "General", keywords: ["home", "main", "start"] },
        ];

        if (canViewWaitlist) {
            commands.push({ id: "waitlist-subscribers", label: "Waitlist Subscribers", href: "/admin/waitlist/subscribers", icon: Users, section: "Waitlist", keywords: ["users", "people", "list"] });
            commands.push({ id: "waitlist-analytics", label: "Waitlist Analytics", href: "/admin/waitlist/analytics", icon: Activity, section: "Waitlist", keywords: ["stats", "data", "charts"] });
        }

        if (canViewApplications) {
            commands.push({ id: "apps-positions", label: "Application Positions", href: "/admin/applications/positions", icon: FileText, section: "Applications", keywords: ["roles", "jobs"] });
            commands.push({ id: "apps-candidates", label: "Applicants", href: "/admin/applications/applicants", icon: Users, section: "Applications", keywords: ["candidates", "people"] });
        }

        if (canViewEmail) {
            commands.push({ id: "email-templates", label: "Email Templates", href: "/admin/email/templates", icon: Mail, section: "Email", keywords: ["design", "builder"] });
            commands.push({ id: "email-automations", label: "Email Automations", href: "/admin/email/automations", icon: Activity, section: "Email", keywords: ["flows", "drip"] });
        }

        if (canViewSettings) {
            commands.push({ id: "settings-general", label: "General Settings", href: "/admin/settings", icon: Settings, section: "Settings", keywords: ["config", "setup"] });
            commands.push({ id: "settings-integrations", label: "Integrations", href: "/admin/settings/integrations", icon: FileLock2, section: "Settings", keywords: ["api", "keys", "third-party"] });
            commands.push({ id: "logs", label: "Logs", href: "/admin/logs", icon: Activity, section: "Logs", keywords: ["activity", "auth", "system", "errors", "audit", "trail"] });
        }

        return commands;
    };

    const commands = getAvailableCommands();
    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const navigateTo = (href: string) => {
        setIsOpen(false);
        setSearchQuery("");
        router.push(href);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[600px] bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden shadow-black/50"
                    >
                        {/* Search Input */}
                        <div className="relative border-b border-[var(--border-subtle)]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" size={20} />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search pages, settings, or tools..."
                                className="w-full h-14 pl-12 pr-4 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-[15px]"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--surface-high)] border border-[var(--border-subtle)] text-[var(--text-muted)]">ESC</span>
                                <span className="text-[12px] text-[var(--text-muted)] ml-1">to close</span>
                            </div>
                        </div>

                        {/* Results list */}
                        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                            {filteredCommands.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredCommands.map((cmd) => {
                                        const Icon = cmd.icon;
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={() => navigateTo(cmd.href)}
                                                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[var(--surface-high)] group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-low)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-gold)]/30 group-hover:bg-[var(--accent-gold)]/5 transition-colors">
                                                        <Icon size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors" />
                                                    </div>
                                                    <div className="text-left flex flex-col min-w-0">
                                                        <span className="text-[14px] font-medium text-[var(--text-primary)]">{cmd.label}</span>
                                                        <span className="text-[11px] text-[var(--text-muted)]">{cmd.section}</span>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight size={16} className="text-[var(--accent-gold)]" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-[var(--surface-high)] flex items-center justify-center mb-3">
                                        <Search className="text-[var(--text-muted)] w-5 h-5" />
                                    </div>
                                    <p className="text-[14px] text-[var(--text-primary)] font-medium">No results found</p>
                                    <p className="text-[12px] text-[var(--text-muted)] mt-1">Try a different search term or check spelling.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
