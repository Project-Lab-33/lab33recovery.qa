"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, ActivityActor, ActivityAction, ActivityResourceType } from "../types";
import { toast } from "sonner";

interface UseActivityLogsOptions {
    page?: number;
    limit?: number;
}

interface ActivityLogsFilters {
    action: ActivityAction | '';
    resourceType: ActivityResourceType | '';
    actorId: string;
    dateFrom: string;
    dateTo: string;
}

export function useActivityLogs(options: UseActivityLogsOptions = {}) {
    const { limit = 50 } = options;

    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [actors, setActors] = useState<ActivityActor[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ActivityLogsFilters>({
        action: '',
        resourceType: '',
        actorId: '',
        dateFrom: '',
        dateTo: '',
    });

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(limit));

            if (searchQuery) params.set('search', searchQuery);
            if (filters.action) params.set('action', filters.action);
            if (filters.resourceType) params.set('resource_type', filters.resourceType);
            if (filters.actorId) params.set('actor_id', filters.actorId);
            if (filters.dateFrom) params.set('date_from', filters.dateFrom);
            if (filters.dateTo) params.set('date_to', filters.dateTo);

            const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            setLogs(data.logs || []);
            setTotal(data.total || 0);
            setActors(data.actors || []);
        } catch (err) {
            console.error('[useActivityLogs]', err);
            setLogs([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, searchQuery, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Real-time subscription for new activity logs
    const fetchLogsRef = useRef(fetchLogs);
    fetchLogsRef.current = fetchLogs;

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('activity-logs-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'admin_activity_logs',
                },
                (payload) => {
                    // Prepend the new log to the list immediately
                    const newLog = payload.new as ActivityLog;
                    setLogs(prev => [newLog, ...prev]);
                    setTotal(prev => prev + 1);

                    // Show a subtle toast for new activity
                    const actionLabel = newLog.action?.replace(/_/g, ' ') || 'action';
                    toast.info(`New activity: ${newLog.actor_name} — ${actionLabel}`, {
                        duration: 3000,
                        position: 'bottom-right',
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, filters]);

    const activeFilterCount =
        (filters.action ? 1 : 0) +
        (filters.resourceType ? 1 : 0) +
        (filters.actorId ? 1 : 0) +
        (filters.dateFrom || filters.dateTo ? 1 : 0);

    const clearFilters = useCallback(() => {
        setFilters({ action: '', resourceType: '', actorId: '', dateFrom: '', dateTo: '' });
    }, []);

    return {
        logs,
        actors,
        total,
        page,
        setPage,
        isLoading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        activeFilterCount,
        clearFilters,
        refresh: fetchLogs,
    };
}
