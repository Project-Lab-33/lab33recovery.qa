"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { AuthLog, AuthUser } from "../types";

interface UseAuthLogsOptions {
    limit?: number;
}

interface AuthLogsFilters {
    dateFrom: string;
    dateTo: string;
}

export function useAuthLogs({ limit = 50 }: UseAuthLogsOptions = {}) {
    const [logs, setLogs] = useState<AuthLog[]>([]);
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<AuthLogsFilters>({
        dateFrom: '',
        dateTo: '',
    });
    const [page, setPage] = useState(1);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.dateFrom || filters.dateTo) count++;
        return count;
    }, [filters]);

    const clearFilters = useCallback(() => {
        setFilters({ dateFrom: '', dateTo: '' });
    }, []);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (searchQuery) params.set('search', searchQuery);
            if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.set('dateTo', filters.dateTo);

            const res = await fetch(`/api/admin/auth-logs?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setLogs(data.logs);
            setTotal(data.total);
            setUsers(data.users || []);
        } catch (err) {
            console.error('[useAuthLogs]', err);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, searchQuery, filters]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);
    useEffect(() => { setPage(1); }, [searchQuery, filters]);

    return {
        logs,
        users,
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
