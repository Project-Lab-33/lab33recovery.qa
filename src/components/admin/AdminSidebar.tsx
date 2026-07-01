"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutGrid,
    Users,
    FileText,
    Settings,
    ChevronDown,
    LogOut,
    UserCircle,
    Sun,
    Moon,
    MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useAdminUser } from "@/hooks/useAdminUser";
import { hasPermission, getRoleLabel } from "@/lib/permissions";
import NotificationPanel from "./shared/NotificationPanel";

interface NavItemProps {
    href?: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    label: string;
    badge?: string | number;
    isActive?: boolean;
    isExpanded?: boolean;
    onClick?: () => void;
    hasChildren?: boolean;
}

const NavRow = ({ href, icon: Icon, label, badge, isActive, isExpanded, onClick, hasChildren }: NavItemProps) => {
    const content = (
        <div
            className={`group relative flex items-center justify-between px-5 h-[48px] cursor-pointer transition-colors duration-500 overflow-hidden ${isActive ? 'bg-[linear-gradient(90deg,var(--accent-gold-soft)_0%,transparent_100%)]' : 'hover:bg-[linear-gradient(90deg,var(--accent-gold-soft)/50_0%,transparent_100%)]'}`}
            onClick={onClick}
        >
            {/* Active Glow Path */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-gold)]/[0.04] to-transparent pointer-events-none" />
            )}

            {/* Active Indicator Bar */}
            {isActive && (
                <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 w-[3px] h-[24px] bg-[var(--accent-gold)] shadow-[0_0_15px_var(--accent-gold)]/40"
                />
            )}

            <div className="flex items-center gap-4 relative z-10">
                <Icon
                    size={20}
                    strokeWidth={1.5}
                    className={`transition-colors duration-300 ${isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]/40 group-hover:text-[var(--text-secondary)]'}`}
                />
                <span className={`text-[15px] font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]/70 group-hover:text-[var(--text-secondary)]'}`}>
                    {label}
                </span>
            </div>

            <div className="flex items-center gap-2 relative z-10">
                {badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--background)] border border-[var(--accent-gold)]/30 text-[10px] text-[var(--accent-gold)] font-bold tracking-tight shadow-sm">
                        {badge}
                    </span>
                )}
                {hasChildren && (
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-500 text-[var(--text-secondary)]/40 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                )}
            </div>
        </div>
    );

    if (href && !hasChildren) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
};

const SubNavRow = ({ href, label, isActive }: { href: string; label: string; isActive: boolean }) => (
    <Link href={href}>
        <div className={`group flex items-center px-14 h-[40px] transition-colors duration-300 relative overflow-hidden ${isActive ? 'text-[var(--text-primary)] bg-[var(--accent-gold-soft)]/30' : 'text-[var(--text-secondary)]/50 hover:text-[var(--text-secondary)] hover:bg-[var(--accent-gold-soft)]/20'}`}>
            <span className={`text-[14px] transition-colors duration-300 relative z-10 ${isActive ? 'font-semibold' : ''}`}>
                {label}
            </span>
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent-gold)]/40" />
            )}
        </div>
    </Link>
);

export default function AdminSidebar() {
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { user: adminUser } = useAdminUser();
    const [mounted, setMounted] = useState(false);
    const [expanded, setExpanded] = useState<string | null>("waitlist");
    const supabase = useMemo(() => createClient(), []);

    // Permission checks (with per-user overrides)
    const overrides = adminUser?.permissions_override;
    const canViewUsers = hasPermission(adminUser?.role, 'users', 'read', overrides);
    const canViewWaitlist = hasPermission(adminUser?.role, 'waitlist', 'read', overrides);
    const canViewApplications = hasPermission(adminUser?.role, 'applications', 'read', overrides);
    const canViewEmail = hasPermission(adminUser?.role, 'email', 'read', overrides);
    const canViewContact = hasPermission(adminUser?.role, 'contact', 'read', overrides);
    const canViewSettings = hasPermission(adminUser?.role, 'settings', 'read', overrides);
    const canViewAnalytics = hasPermission(adminUser?.role, 'analytics', 'read', overrides);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const toggleExpanded = (key: string) => {
        setExpanded(expanded === key ? null : key);
    };

    const handleSignOut = async () => {
        try {
            // Log the logout event before signing out (fire-and-forget)
            await fetch('/api/admin/auth-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' }),
            }).catch(() => { });

            // Using scope: 'local' and fire-and-forget if possible to not hang
            await supabase.auth.signOut({ scope: 'local' });

            // Clear session persistence flags but keep the remembered email if "Remember Me" was on
            localStorage.removeItem('lab33_remember_session');
            sessionStorage.removeItem('lab33_session_active');

            // Force a hard reload to completely wipe React state memory in Admin
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Sign out failed:', error);
            // Even if it fails, hard redirect to login
            window.location.href = '/admin/login';
        }
    };

    const navGroups = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
            href: "/admin/dashboard",
        },
        ...(canViewWaitlist ? [{
            id: "waitlist",
            label: "Waitlist",
            icon: Users,
            children: [
                { label: "Subscribers", href: "/admin/waitlist/subscribers" },
                ...(canViewAnalytics ? [{ label: "Analytics", href: "/admin/waitlist/analytics" }] : []),
            ]
        }] : []),
        ...(canViewApplications ? [{
            id: "applications",
            label: "Applications",
            icon: FileText,
            children: [
                { label: "Positions", href: "/admin/applications/positions" },
                { label: "Applicants", href: "/admin/applications/applicants" },
                ...(canViewAnalytics ? [{ label: "Analytics", href: "/admin/applications/analytics" }] : []),
            ]
        }] : []),
        ...(canViewContact ? [{
            id: "contact",
            label: "Contact Messages",
            icon: MessageSquare,
            href: "/admin/contact",
        }] : []),
        ...(canViewSettings || canViewUsers || canViewEmail ? [{
            id: "settings",
            label: "Settings",
            icon: Settings,
            children: [
                ...(canViewUsers ? [{ label: "Users", href: "/admin/users" }] : []),
                ...(canViewEmail ? [
                    { label: "Email Templates", href: "/admin/email/templates" },
                    { label: "Automations", href: "/admin/email/automations" },
                    { label: "Email Logs", href: "/admin/email/logs" },
                ] : []),
                ...(canViewSettings ? [
                    { label: "Integrations", href: "/admin/settings/integrations" },
                    { label: "Logs", href: "/admin/logs" },
                ] : []),
            ]
        }] : []),
    ];

    // Filter out sections/sub-sections hidden by admin
    // Supports group-level ("marketing") and child-level ("marketing.analytics")
    const hiddenSet = new Set(adminUser?.hidden_sections ?? []);

    const getChildKey = (groupId: string, href: string): string => {
        if (href === '/admin/settings') return `${groupId}.general`;
        if (href === '/admin/users') return `${groupId}.users`;
        return `${groupId}.${href.split('/').pop()!}`;
    };

    const visibleNavGroups = navGroups
        .filter(g => {
            if (g.id === 'dashboard') return true;
            return !hiddenSet.has(g.id);
        })
        .map(g => {
            if (!g.children) return g;
            const visibleChildren = g.children.filter(child => {
                const childKey = getChildKey(g.id, child.href);
                return !hiddenSet.has(childKey);
            });
            if (visibleChildren.length === 0) return null;
            return { ...g, children: visibleChildren };
        })
        .filter((g): g is NonNullable<typeof g> => g !== null);

    return (
        <aside className="w-[280px] h-screen bg-[linear-gradient(180deg,var(--surface-low)_0%,var(--surface-mid)_100%)] border-r border-[var(--border-medium)] flex flex-col relative overflow-hidden">
            {/* Sidebar Ambient Lights (Top & Bottom Glows) */}
            <div className="absolute -top-[5%] -left-[10%] w-[120%] h-[30%] bg-[var(--accent-gold)]/[0.06] blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[20%] bg-[var(--accent-gold)]/[0.03] blur-[60px] rounded-full pointer-events-none" />

            {/* Micro-noise texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Header */}
            <div className="px-3 pt-12 pb-8">
                <div className="flex items-center justify-center">
                    <Image
                        src={mounted && (theme === 'light' || resolvedTheme === 'light') ? "/logo-black.png" : "/logo-primary.webp"}
                        alt="The Lab 33"
                        width={180}
                        height={60}
                        className="h-8 w-auto contrast-[1.1]"
                    />
                </div>
                <div className="relative mt-8">
                    <div className="h-[1px] w-full bg-gradient-to-r from-[var(--accent-gold)]/10 via-[var(--accent-gold)]/20 to-[var(--accent-gold)]/10" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-0.5 p-1 rounded-full bg-[var(--surface-mid)] border border-[var(--border-medium)] shadow-sm">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-2 rounded-full transition-all duration-300 ${mounted && (theme === 'light' || resolvedTheme === 'light')
                                    ? 'bg-[var(--accent-gold)] text-black shadow-[0_0_12px_rgba(212,175,119,0.5)]'
                                    : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60 hover:bg-[var(--surface-high)]'}`}
                            >
                                <Sun size={12} strokeWidth={2} />
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-2 rounded-full transition-all duration-300 ${mounted && (theme === 'dark' || resolvedTheme === 'dark')
                                    ? 'bg-[var(--accent-gold)] text-black shadow-[0_0_12px_rgba(212,175,119,0.5)]'
                                    : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60 hover:bg-[var(--surface-high)]'}`}
                            >
                                <Moon size={12} strokeWidth={2} />
                            </button>
                            <div className="w-[1px] h-4 bg-[var(--border-medium)] mx-0.5" />
                            <NotificationPanel />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 flex flex-col justify-center space-y-1 overflow-y-auto custom-scrollbar">
                {visibleNavGroups.map((group) => (
                    <div key={group.id} className="space-y-1">
                        <NavRow
                            label={group.label}
                            icon={group.icon}
                            href={group.href}
                            isActive={group.href ? pathname === group.href : group.children?.some(c => pathname === c.href)}
                            isExpanded={expanded === group.id}
                            onClick={group.children ? () => toggleExpanded(group.id) : undefined}
                            hasChildren={!!group.children}
                        />

                        {group.children && (
                            <AnimatePresence>
                                {expanded === group.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        {group.children.map((child) => (
                                            <SubNavRow
                                                key={child.href}
                                                label={child.label}
                                                href={child.href}
                                                isActive={pathname === child.href}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                ))}
            </nav>

            {/* Profile / Bottom Actions */}
            <div className="p-6">
                <div className="relative group">
                    <div className="w-full flex items-center gap-4 mb-3 px-3 py-2">
                        <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-mid)] flex-shrink-0 flex items-center justify-center border border-[var(--border-subtle)] overflow-hidden">
                            {adminUser?.avatar_url ? (
                                <Image src={adminUser.avatar_url} alt={adminUser.name} width={52} height={52} className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={30} className="text-[var(--text-secondary)]/40" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-base font-medium text-[var(--text-primary)] truncate">{adminUser?.name || 'Admin User'}</span>
                            <span className="text-[11px] text-[var(--text-secondary)]/40 uppercase tracking-widest font-semibold truncate">{adminUser?.role ? getRoleLabel(adminUser.role) : 'Principal'}</span>
                        </div>
                    </div>

                    <button onClick={handleSignOut} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-low)] hover:bg-[var(--surface-mid)] transition-colors group/logout">
                        <span className="text-[11px] text-[var(--text-secondary)]/60 uppercase tracking-widest font-bold group-hover/logout:text-[var(--text-primary)] transition-colors">Sign Out</span>
                        <LogOut size={14} className="text-[var(--text-secondary)]/30 group-hover/logout:text-[var(--accent-gold)] transition-colors" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
