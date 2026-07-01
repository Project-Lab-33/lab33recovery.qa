"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseIntegrationSettingsOptions<T> {
    /** API endpoint to fetch/save settings, e.g. '/api/admin/settings/meta' */
    endpoint: string;
    /** Success toast label, e.g. 'Meta' */
    label: string;
    /** Called after successful fetch to seed form state from API data */
    onDataLoaded?: (data: T) => void;
}

export function useIntegrationSettings<T>({ endpoint, label, onDataLoaded }: UseIntegrationSettingsOptions<T>) {
    const supabase = useMemo(() => createClient(), []);
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string; details?: Record<string, string | null> } | null>(null);

    const getAuthHeader = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');
        return { 'Authorization': `Bearer ${session.access_token}` };
    }, [supabase]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch(endpoint, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const result: T = await res.json();
            setData(result);
            onDataLoaded?.(result);
        } catch (err) {
            console.error(`[${label}Settings] Failed to fetch:`, err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, label, getAuthHeader, onDataLoaded]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const save = useCallback(async (body: Record<string, unknown>, successMsg?: string) => {
        setIsSaving(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to save');
            toast.success(successMsg || `${label} configuration updated`);
            fetchData();
            return result;
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, [endpoint, label, getAuthHeader, fetchData]);

    const toggle = useCallback(async (key: string, value: boolean) => {
        try {
            const headers = await getAuthHeader();
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value }),
            });
            if (!res.ok) throw new Error('Failed to update');
            toast.success(`${label} integration ${value ? 'enabled' : 'disabled'}`);
            fetchData();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to toggle');
        }
    }, [endpoint, label, getAuthHeader, fetchData]);

    const testConnection = useCallback(async (action = 'test_connection') => {
        setIsTesting(true);
        setTestStatus(null);
        try {
            const headers = await getAuthHeader();
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Connection failed');
            setTestStatus({ type: 'success', message: result.message, details: result.details });
        } catch (err: unknown) {
            setTestStatus({ type: 'error', message: err instanceof Error ? err.message : 'Connection failed' });
            setTimeout(() => setTestStatus(null), 5000);
        } finally {
            setIsTesting(false);
        }
    }, [endpoint, getAuthHeader]);

    const post = useCallback(async (body: Record<string, unknown>) => {
        const headers = await getAuthHeader();
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Request failed');
        return result;
    }, [endpoint, getAuthHeader]);

    return {
        supabase,
        data,
        loading,
        isSaving,
        isTesting,
        testStatus,
        setTestStatus,
        fetchData,
        save,
        toggle,
        testConnection,
        post,
    };
}
