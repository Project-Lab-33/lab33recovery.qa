"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SystemLog, SystemLogLevel, SystemLogSource } from "../types";

interface UseSystemLogsOptions {
    limit?: number;
}

interface SystemLogsFilters {
    level: SystemLogLevel | '';
    source: SystemLogSource | '';
    dateFrom: string;
    dateTo: string;
}

export function useSystemLogs({ limit = 50 }: UseSystemLogsOptions = {}) {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SystemLogsFilters>({
        level: '',
        source: '',
        dateFrom: '',
        dateTo: '',
    });
    const [page, setPage] = useState(1);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.level) count++;
        if (filters.source) count++;
        if (filters.dateFrom || filters.dateTo) count++;
        return count;
    }, [filters]);

    const clearFilters = useCallback(() => {
        setFilters({ level: '', source: '', dateFrom: '', dateTo: '' });
    }, []);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (searchQuery) params.set('search', searchQuery);
            if (filters.level) params.set('level', filters.level);
            if (filters.source) params.set('source', filters.source);
            if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.set('dateTo', filters.dateTo);

            const res = await fetch(`/api/admin/system-logs?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err) {
            console.error('[useSystemLogs]', err);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, searchQuery, filters]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // Real-time subscription for system logs
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('system-logs-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'system_logs',
                },
                (payload) => {
                    const newLog = payload.new as SystemLog;
                    setLogs(prev => [newLog, ...prev]);
                    setTotal(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [searchQuery, filters]);

    return {
        logs,
        total,
        isLoading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        activeFilterCount,
        clearFilters,
        page,
        setPage,
        refresh: fetchLogs,
    };
}
