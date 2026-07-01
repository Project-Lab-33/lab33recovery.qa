"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Notification {
    id: string;
    type: 'new_applicant' | 'new_waitlist' | 'status_change' | 'email_sent' | 'system';
    title: string;
    message: string;
    metadata: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
}

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const supabase = useMemo(() => createClient(), []);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notifications?limit=50');
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('[useNotifications] Fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time subscription (replaces polling)
    useEffect(() => {
        const channel = supabase
            .channel("admin_notifications_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "admin_notifications" },
                () => { fetchNotifications(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (err) {
            console.error('[useNotifications] Mark as read failed:', err);
            fetchNotifications(); // Revert on failure
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true })
            });
        } catch (err) {
            console.error('[useNotifications] Mark all read failed:', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const deleteNotification = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev => {
            const n = prev.find(n => n.id === id);
            if (n && !n.is_read) setUnreadCount(c => Math.max(0, c - 1));
            return prev.filter(n => n.id !== id);
        });

        try {
            await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error('[useNotifications] Delete failed:', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const clearRead = useCallback(async () => {
        setNotifications(prev => prev.filter(n => !n.is_read));

        try {
            await fetch('/api/admin/notifications?clearRead=true', { method: 'DELETE' });
        } catch (err) {
            console.error('[useNotifications] Clear read failed:', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearRead,
        refresh: fetchNotifications
    };
}
