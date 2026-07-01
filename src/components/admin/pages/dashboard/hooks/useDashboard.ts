"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAdminUser } from "@/hooks/useAdminUser";
import { createClient } from "@/lib/supabase/client";

export interface DashboardStats {
    // Totals
    totalWaitlist: number;
    totalApplications: number;
    totalEmails: number;
    totalPositions: number;

    // Today
    todayWaitlist: number;
    todayApplications: number;
    todayEmails: number;

    // This week
    weekWaitlist: number;
    weekApplications: number;

    // Growth (week-over-week %)
    waitlistGrowth: number;
    applicationsGrowth: number;

    // Pipeline
    pendingApplications: number;
    shortlistedApplications: number;
    hiredApplications: number;
    archivedApplications: number;

    // Unread
    unreadWaitlist: number;
    unreadApplications: number;
    unreadNotifications: number;

    // Daily velocity (last 14 days for sparklines)
    dailyWaitlist: { date: string; count: number }[];
    dailyApplications: { date: string; count: number }[];

    // Combined daily for overlay chart (last 30 days)
    dailyCombined: { date: string; waitlist: number; applications: number }[];
}

export interface ServiceHealthItem {
    service_key: string;
    service_name: string;
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    response_time_ms: number | null;
}

export interface ActivityItem {
    id: string;
    type: 'new_applicant' | 'new_waitlist' | 'status_change' | 'email_sent' | 'system';
    title: string;
    message: string;
    metadata: Record<string, unknown>;
    created_at: string;
    is_read: boolean;
}

export interface RecentEntry {
    id: string;
    type: 'waitlist' | 'application';
    name: string;
    detail: string;      // email or position
    status?: string;
    created_at: string;
}

export function useDashboard() {
    const { user } = useAdminUser();
    const [time, setTime] = useState(new Date());
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
    const [serviceHealth, setServiceHealth] = useState<ServiceHealthItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const greeting = useMemo(() => {
        const hour = time.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        if (hour < 21) return "Good Evening";
        return "Good Night";
    }, [time]);

    const firstName = user?.name ? user.name.split(" ")[0] : "there";

    const formattedTime = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const formattedDate = time.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const fetchCoreData = useCallback(async () => {
        setIsLoading(true);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // This week (Monday start)
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset).toISOString();

        // Previous week
        const prevWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset - 7).toISOString();
        const prevWeekEnd = weekStart;

        // 30 days ago for combined chart
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString();

        try {
            const [
                // Totals
                waitlistRes,
                applicationsRes,
                emailsRes,
                positionsRes,
                // Today
                todayWaitlistRes,
                todayAppsRes,
                todayEmailsRes,
                // This week
                weekWaitlistRes,
                weekAppsRes,
                // Previous week
                prevWeekWaitlistRes,
                prevWeekAppsRes,
                // Pipeline
                pendingRes,
                shortlistedRes,
                hiredRes,
                archivedRes,
                // Unread
                unreadWaitlistRes,
                unreadAppsRes,
                unreadNotifRes,
                // Activity feed
                activityRes,
                // Recent waitlist entries
                recentWaitlistRes,
                // Recent applications
                recentAppsRes,
                // Daily waitlist (last 30 days raw)
                dailyWaitlistRes,
                // Daily applications (last 30 days raw)
                dailyAppsRes,
            ] = await Promise.all([
                supabase.from('waitlist').select('id', { count: 'exact', head: true }),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }),
                supabase.from('email_logs').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
                supabase.from('positions').select('id', { count: 'exact', head: true }).eq('status', 'active'),

                supabase.from('waitlist').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
                supabase.from('email_logs').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('created_at', todayStart),

                supabase.from('waitlist').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),

                supabase.from('waitlist').select('id', { count: 'exact', head: true }).gte('created_at', prevWeekStart).lt('created_at', prevWeekEnd),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).gte('created_at', prevWeekStart).lt('created_at', prevWeekEnd),

                supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'shortlisted'),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'hired'),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'archived'),

                supabase.from('waitlist').select('id', { count: 'exact', head: true }).eq('is_read', false),
                supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('is_read', false),
                supabase.from('admin_notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),

                supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(20),

                supabase.from('waitlist').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(8),
                supabase.from('job_applications').select('id, first_name, last_name, position_title, status, created_at').order('created_at', { ascending: false }).limit(8),

                supabase.from('waitlist').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
                supabase.from('job_applications').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
            ]);

            // Build daily velocity data
            const buildDaily = (rows: { created_at: string }[] | null) => {
                const map = new Map<string, number>();
                const dNow = new Date();
                // Initialise 30 days
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(dNow.getFullYear(), dNow.getMonth(), dNow.getDate() - i);
                    map.set(d.toISOString().split('T')[0], 0);
                }
                (rows || []).forEach(r => {
                    const day = new Date(r.created_at).toISOString().split('T')[0];
                    if (map.has(day)) map.set(day, (map.get(day) || 0) + 1);
                });
                return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
            };

            const dailyWL = buildDaily(dailyWaitlistRes.data);
            const dailyApps = buildDaily(dailyAppsRes.data);

            // Combined chart
            const dailyCombined = dailyWL.map((d, i) => ({
                date: d.date,
                waitlist: d.count,
                applications: dailyApps[i]?.count || 0,
            }));

            // Growth calculations
            const thisWeekWL = weekWaitlistRes.count || 0;
            const prevWeekWL = prevWeekWaitlistRes.count || 0;
            const waitlistGrowth = prevWeekWL > 0
                ? Math.round(((thisWeekWL - prevWeekWL) / prevWeekWL) * 100)
                : thisWeekWL > 0 ? 100 : 0;

            const thisWeekApps = weekAppsRes.count || 0;
            const prevWeekApps = prevWeekAppsRes.count || 0;
            const applicationsGrowth = prevWeekApps > 0
                ? Math.round(((thisWeekApps - prevWeekApps) / prevWeekApps) * 100)
                : thisWeekApps > 0 ? 100 : 0;

            setStats({
                totalWaitlist: waitlistRes.count || 0,
                totalApplications: applicationsRes.count || 0,
                totalEmails: emailsRes.count || 0,
                totalPositions: positionsRes.count || 0,
                todayWaitlist: todayWaitlistRes.count || 0,
                todayApplications: todayAppsRes.count || 0,
                todayEmails: todayEmailsRes.count || 0,
                weekWaitlist: thisWeekWL,
                weekApplications: thisWeekApps,
                waitlistGrowth,
                applicationsGrowth,
                pendingApplications: pendingRes.count || 0,
                shortlistedApplications: shortlistedRes.count || 0,
                hiredApplications: hiredRes.count || 0,
                archivedApplications: archivedRes.count || 0,
                unreadWaitlist: unreadWaitlistRes.count || 0,
                unreadApplications: unreadAppsRes.count || 0,
                unreadNotifications: unreadNotifRes.count || 0,
                dailyWaitlist: dailyWL.slice(-14),
                dailyApplications: dailyApps.slice(-14),
                dailyCombined,
            });

            setActivity((activityRes.data || []) as ActivityItem[]);

            // Merge recent entries
            const entries: RecentEntry[] = [
                ...(recentWaitlistRes.data || []).map(w => ({
                    id: w.id,
                    type: 'waitlist' as const,
                    name: w.name || 'Anonymous',
                    detail: w.email || '',
                    created_at: w.created_at,
                })),
                ...(recentAppsRes.data || []).map(a => ({
                    id: a.id,
                    type: 'application' as const,
                    name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Anonymous',
                    detail: a.position_title || 'No position',
                    status: a.status,
                    created_at: a.created_at,
                })),
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 12);

            setRecentEntries(entries);
        } catch (error) {
            console.error('[Dashboard] Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const fetchHealthStatus = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/settings/service-health', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (!res.ok) return;
            const data = await res.json();

            // Build a compact health summary from configs + recent checks
            const configs = data.configs || [];
            const recentChecks = data.recent_checks || [];

            const snapshot: ServiceHealthItem[] = configs.map((cfg: { service_key: string; service_name: string; last_status: string; enabled: boolean }) => {
                const latestCheck = recentChecks.find((c: { service_key: string }) => c.service_key === cfg.service_key);
                return {
                    service_key: cfg.service_key,
                    service_name: cfg.service_name,
                    status: (cfg.last_status || 'unknown') as ServiceHealthItem['status'],
                    response_time_ms: latestCheck?.response_time_ms ?? null,
                };
            }).filter((s: ServiceHealthItem) => s.service_key !== 'unknown');

            setServiceHealth(snapshot);
        } catch {
            console.warn('[Dashboard] Service health unavailable');
        }
    }, [supabase]);

    const refreshAll = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchCoreData(),
                fetchHealthStatus(),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchCoreData, fetchHealthStatus]);

    useEffect(() => {
        fetchCoreData();
        fetchHealthStatus();
        const interval = setInterval(() => {
            fetchCoreData();
        }, 60_000);
        // Refresh health every 5 minutes
        const healthInterval = setInterval(fetchHealthStatus, 300_000);
        return () => {
            clearInterval(interval);
            clearInterval(healthInterval);
        };
    }, [fetchCoreData, fetchHealthStatus]);

    return {
        greeting,
        firstName,
        formattedTime,
        formattedDate,
        stats,
        activity,
        recentEntries,
        serviceHealth,
        isLoading,
        isRefreshing,
        refreshAll,
        refreshData: fetchCoreData,
    };
}
