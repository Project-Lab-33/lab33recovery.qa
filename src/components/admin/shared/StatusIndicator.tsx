"use client";

import React from "react";

export type ConnectionStatus = 'connected' | 'error' | 'not_configured' | 'loading';

export interface StatusConfig {
    color: string;
    label: string;
}

export interface StatusIndicatorProps {
    status: ConnectionStatus;
    /** Override default status labels/colors per-integration */
    config?: Partial<Record<ConnectionStatus, StatusConfig>>;
}

const DEFAULT_CONFIG: Record<ConnectionStatus, StatusConfig> = {
    loading: { color: 'var(--text-muted)', label: 'Checking...' },
    connected: { color: '#34d399', label: 'Connected' },
    error: { color: '#fb7185', label: 'Error' },
    not_configured: { color: '#fbbf24', label: 'Not Configured' },
};

export function StatusIndicator({ status, config }: StatusIndicatorProps) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    const c = merged[status];

    return (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--surface-high)] border border-[var(--border-subtle)]">
            <div className="relative">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {status === 'connected' && <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: c.color, opacity: 0.4 }} />}
            </div>
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: c.color }}>{c.label}</span>
        </div>
    );
}
