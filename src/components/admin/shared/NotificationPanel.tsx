"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    UserPlus,
    Users,
    RefreshCw,
    Mail,
    AlertCircle,
    Clock,
    Inbox,
    Filter,
    ExternalLink,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { AdminDrawer } from "./AdminDrawer";

function getNotificationRoute(notification: Notification): string | null {
    const meta = notification.metadata || {};
    switch (notification.type) {
        case 'new_applicant':
        case 'status_change': {
            const id = meta.application_id as string | undefined;
            return id ? `/admin/applications/applicants?highlight=${id}` : '/admin/applications/applicants';
        }
        case 'new_waitlist': {
            const id = meta.waitlist_id as string | undefined;
            return id ? `/admin/waitlist/subscribers?highlight=${id}` : '/admin/waitlist/subscribers';
        }
        case 'email_sent':
            return '/admin/email/logs';
        case 'system':
            if (meta.service_key) return '/admin/settings/service-health';
            return '/admin/settings/system-logs';
        default:
            // Handle dynamic types like 'service_health' from health-check triggers
            if (String(notification.type).includes('health') || meta.service_key) {
                return '/admin/settings/service-health';
            }
            return null;
    }
}

const TYPE_CONFIG: Record<Notification['type'], {
    icon: typeof Bell;
    gradient: string;
    iconColor: string;
    dotColor: string;
    label: string;
}> = {
    new_applicant: {
        icon: UserPlus,
        gradient: 'from-blue-500/20 to-blue-400/5',
        iconColor: 'text-blue-400',
        dotColor: 'bg-blue-400',
        label: 'Application',
    },
    new_waitlist: {
        icon: Users,
        gradient: 'from-emerald-500/20 to-emerald-400/5',
        iconColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        label: 'Waitlist',
    },
    status_change: {
        icon: RefreshCw,
        gradient: 'from-amber-500/20 to-amber-400/5',
        iconColor: 'text-amber-400',
        dotColor: 'bg-amber-400',
        label: 'Status',
    },
    email_sent: {
        icon: Mail,
        gradient: 'from-purple-500/20 to-purple-400/5',
        iconColor: 'text-purple-400',
        dotColor: 'bg-purple-400',
        label: 'Email',
    },
    system: {
        icon: AlertCircle,
        gradient: 'from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5',
        iconColor: 'text-[var(--accent-gold)]',
        dotColor: 'bg-[var(--accent-gold)]',
        label: 'System',
    },
};

type FilterTab = 'all' | 'unread' | 'new_applicant' | 'new_waitlist';

const TABS: { key: FilterTab; label: string; icon: typeof Bell }[] = [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'unread', label: 'Unread', icon: Bell },
    { key: 'new_applicant', label: 'Applications', icon: UserPlus },
    { key: 'new_waitlist', label: 'Waitlist', icon: Users },
];

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationPanel() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [mounted, setMounted] = useState(false);

     
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearRead,
    } = useNotifications();

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !n.is_read;
        return n.type === activeTab;
    });

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) markAsRead(notification.id);
        const route = getNotificationRoute(notification);
        if (route) {
            setIsOpen(false);
            router.push(route);
        }
    };

    return (
        <>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-full flex items-center justify-center transition-all duration-300 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10"
                title="Notifications"
            >
                {unreadCount > 0 && (
                    <span
                        className="absolute inset-0 rounded-full bg-[var(--accent-gold)]/10"
                        style={{ animation: 'notifPulse 3s ease-in-out infinite' }}
                    />
                )}

                <Bell
                    size={14}
                    strokeWidth={2}
                    className="relative z-10"
                    style={unreadCount > 0 ? { animation: 'notifRing 4s ease-in-out infinite', transformOrigin: 'top center' } : undefined}
                />

                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[7px] font-bold ring-2 ring-[var(--surface-mid)]"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Animations */}
            <style jsx global>{`
                @keyframes notifRing {
                    0%, 85%, 100% { transform: rotate(0deg); }
                    88% { transform: rotate(14deg); }
                    91% { transform: rotate(-12deg); }
                    94% { transform: rotate(8deg); }
                    97% { transform: rotate(-4deg); }
                }
                @keyframes notifPulse {
                    0%, 100% { opacity: 0; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.15); }
                }
            `}</style>

            {/* Drawer */}
            {mounted && createPortal(
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                    <AdminDrawer
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Notifications"
                        subtitle="Activity Feed"
                        width="680px"
                        rawBody
                        headerActions={
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={markAllAsRead}
                                        className="p-3 rounded-xl bg-[var(--surface-high)] hover:bg-[var(--accent-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors border border-[var(--border-medium)]"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={18} />
                                    </motion.button>
                                )}
                                {notifications.some(n => n.is_read) && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={clearRead}
                                        className="p-3 rounded-xl bg-[var(--surface-high)] hover:bg-red-500/15 text-[var(--text-secondary)] hover:text-red-400 transition-colors border border-[var(--border-medium)] hover:border-red-500/40"
                                        title="Clear read"
                                    >
                                        <Trash2 size={18} />
                                    </motion.button>
                                )}
                            </div>
                        }
                        footer={<></>}
                    >
                        {/* Filter Bar */}
                        <div className="px-8 pt-6 pb-4 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2">
                                {TABS.map(tab => {
                                    const isActive = activeTab === tab.key;
                                    const count = tab.key === 'all'
                                        ? notifications.length
                                        : tab.key === 'unread'
                                            ? unreadCount
                                            : notifications.filter(n => n.type === tab.key).length;
                                    const TabIcon = tab.icon;

                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 ${isActive
                                                ? 'bg-[var(--accent-gold)]/12 text-[var(--accent-gold)] border border-[var(--accent-gold)]/25'
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-high)]/60 border border-transparent'
                                                }`}
                                        >
                                            <TabIcon size={12} className={isActive ? 'text-[var(--accent-gold)]' : ''} />
                                            <span>{tab.label}</span>
                                            {count > 0 && (
                                                <span className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold ${isActive
                                                    ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]'
                                                    : 'bg-[var(--surface-high)] text-[var(--text-muted)]'
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-32">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
                                        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Loading</span>
                                    </div>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--surface-high)] to-[var(--surface-mid)] flex items-center justify-center border border-[var(--border-medium)] shadow-lg">
                                            <Inbox size={30} className="text-[var(--text-muted)]" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center border border-[var(--accent-gold)]/30">
                                            <Check size={12} className="text-[var(--accent-gold)]" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1.5">
                                        <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                                            {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                                        </p>
                                        <p className="text-[13px] text-[var(--text-muted)]">
                                            {activeTab === 'unread'
                                                ? 'You\'ve read everything'
                                                : 'New activity will show up here'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-2">
                                    <AnimatePresence mode="popLayout">
                                        {filteredNotifications.map((notification, idx) => {
                                            const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
                                            const Icon = config.icon;
                                            const isUnread = !notification.is_read;

                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: 80, height: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: idx * 0.03,
                                                        ease: [0.16, 1, 0.3, 1]
                                                    }}
                                                    className={`group relative cursor-pointer transition-colors duration-200 ${isUnread
                                                        ? 'bg-[var(--accent-gold)]/[0.04] hover:bg-[var(--accent-gold)]/[0.07]'
                                                        : 'hover:bg-[var(--surface-high)]/40'
                                                        }`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    {/* Unread left accent */}
                                                    {isUnread && (
                                                        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-[var(--accent-gold)]" />
                                                    )}

                                                    <div className="flex gap-4 px-8 py-5">
                                                        {/* Icon Container */}
                                                        <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center border border-[var(--border-subtle)]`}>
                                                            <Icon size={18} className={config.iconColor} />
                                                        </div>

                                                        {/* Body */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Title row */}
                                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                                <p className={`text-[14px] leading-snug ${isUnread
                                                                    ? 'font-semibold text-[var(--text-primary)]'
                                                                    : 'font-medium text-[var(--text-secondary)]'
                                                                    }`}>
                                                                    {notification.title}
                                                                </p>
                                                                {isUnread && (
                                                                    <span className="shrink-0 mt-1.5">
                                                                        <span className={`block w-2 h-2 rounded-full ${config.dotColor} shadow-[0_0_6px_rgba(212,175,119,0.4)]`} />
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Message */}
                                                            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-2.5">
                                                                {notification.message}
                                                            </p>

                                                            {/* Meta row */}
                                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                                {/* Actor attribution */}
                                                                {!!notification.metadata?.changed_by && (
                                                                    <>
                                                                        <div className="inline-flex items-center gap-1.5">
                                                                            <Users size={10} className="text-[var(--text-muted)]" />
                                                                            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                                                                                {String(notification.metadata.changed_by)}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[var(--border-strong)] text-[10px]">·</span>
                                                                    </>
                                                                )}
                                                                <div className="inline-flex items-center gap-1.5">
                                                                    <Icon size={10} className={config.iconColor} />
                                                                    <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${config.iconColor}`}>
                                                                        {config.label}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[var(--border-strong)] text-[10px]">·</span>
                                                                <div className="inline-flex items-center gap-1">
                                                                    <Clock size={10} className="text-[var(--text-muted)]" />
                                                                    <span className="text-[11px] text-[var(--text-muted)]">
                                                                        {timeAgo(notification.created_at)}
                                                                    </span>
                                                                </div>
                                                                {getNotificationRoute(notification) && (
                                                                    <>
                                                                        <span className="text-[var(--border-strong)] text-[10px]">·</span>
                                                                        <div className="inline-flex items-center gap-1 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] transition-colors">
                                                                            <ExternalLink size={9} />
                                                                            <span className="text-[10px] font-medium">View</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Hover Actions */}
                                                        <div className="shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1">
                                                            {isUnread && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                                                    className="p-2 rounded-lg hover:bg-[var(--accent-gold)]/10 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check size={15} />
                                                                </motion.button>
                                                            )}
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={15} />
                                                            </motion.button>
                                                        </div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="mx-8 border-b border-[var(--border-subtle)]" />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </AdminDrawer>
                </div>,
                document.body
            )}
        </>
    );
}
