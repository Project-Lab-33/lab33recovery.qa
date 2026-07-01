"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Code, XCircle, AlertTriangle, Server } from "lucide-react";
import { AdminListView, AdminDrawer, AdminFieldLabel, FilterSection, FilterPill } from "@/components/admin/shared";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import type { Column } from "@/components/admin/shared";
import type { SortOption } from "@/components/admin/shared/SortDropdown";
import { useSystemLogs } from "../hooks";
import { LEVEL_CONFIG, SOURCE_CONFIG, LEVEL_OPTIONS, SOURCE_OPTIONS } from "../constants";
import type { SystemLog } from "../types";

export function SystemLogsTab() {
    const {
        logs,
        isLoading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        activeFilterCount,
        clearFilters,
    } = useSystemLogs({ limit: 500 });

    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const columns: Column<SystemLog>[] = useMemo(() => [
        {
            key: 'level',
            label: 'Level',
            initialWidth: 100,
            render: (log: SystemLog) => {
                const cfg = LEVEL_CONFIG[log.level];
                const Icon = cfg.icon;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${cfg.bg}`}>
                        <Icon size={12} className={cfg.color} />
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'message',
            label: 'Message',
            initialWidth: 320,
            primary: true,
            render: (log: SystemLog) => (
                <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                        {log.message}
                    </p>
                    {log.path && (
                        <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                            {log.method && <span className="text-[var(--accent-gold)] mr-1">{log.method}</span>}
                            {log.path}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'source',
            label: 'Source',
            initialWidth: 120,
            render: (log: SystemLog) => {
                const cfg = SOURCE_CONFIG[log.source];
                const SourceIcon = cfg.icon;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <SourceIcon size={12} className="text-[var(--text-muted)]" />
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            {cfg.label}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'status_code',
            label: 'Status',
            initialWidth: 80,
            render: (log: SystemLog) => {
                if (!log.status_code) return <span className="text-[12px] text-[var(--text-muted)]">—</span>;
                const color = log.status_code >= 500 ? 'text-rose-400' :
                    log.status_code >= 400 ? 'text-amber-400' :
                        'text-emerald-400';
                return (
                    <span className={`text-[13px] font-mono font-bold ${color}`}>
                        {log.status_code}
                    </span>
                );
            },
        },
        {
            key: 'created_at',
            label: 'Time',
            initialWidth: 140,
            render: (log: SystemLog) => (
                <span className="text-[13px] text-[var(--text-muted)]" title={new Date(log.created_at).toLocaleString()}>
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
            ),
        },
    ], []);

    const sortOptions: SortOption[] = [
        { label: 'Newest First', field: 'created_at_desc', icon: Clock, defaultDirection: 'desc' },
        { label: 'Oldest First', field: 'created_at_asc', icon: Clock, defaultDirection: 'asc' },
    ];

    const filterDrawerContent = (
        <div className="space-y-6">
            <FilterSection title="Level" columns={2}>
                {LEVEL_OPTIONS.map(opt => (
                    <FilterPill
                        key={opt.value}
                        label={opt.label}
                        isSelected={filters.level === opt.value}
                        onClick={() => setFilters(f => ({
                            ...f,
                            level: f.level === opt.value ? '' : opt.value,
                        }))}
                        icon={LEVEL_CONFIG[opt.value].icon}
                    />
                ))}
            </FilterSection>

            <FilterSection title="Source" columns={3}>
                {SOURCE_OPTIONS.map(opt => (
                    <FilterPill
                        key={opt.value}
                        label={opt.label}
                        isSelected={filters.source === opt.value}
                        onClick={() => setFilters(f => ({
                            ...f,
                            source: f.source === opt.value ? '' : opt.value,
                        }))}
                        icon={SOURCE_CONFIG[opt.value].icon}
                    />
                ))}
            </FilterSection>

            <FilterSection title="Date Range">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[11px] text-[var(--text-muted)] mb-1 font-medium">From</p>
                        <DateTimePicker
                            value={filters.dateFrom || null}
                            onChange={(v) => setFilters(f => ({ ...f, dateFrom: v || '' }))}
                            dateOnly
                        />
                    </div>
                    <div>
                        <p className="text-[11px] text-[var(--text-muted)] mb-1 font-medium">To</p>
                        <DateTimePicker
                            value={filters.dateTo || null}
                            onChange={(v) => setFilters(f => ({ ...f, dateTo: v || '' }))}
                            dateOnly
                        />
                    </div>
                </div>
            </FilterSection>
        </div>
    );

    const metrics = useMemo(() => {
        const errorCount = logs.filter(l => l.level === 'error' || l.level === 'fatal').length;
        const warnCount = logs.filter(l => l.level === 'warn').length;
        const uniqueSources = new Set(logs.map(l => l.source)).size;
        return { errorCount, warnCount, uniqueSources, totalCount: logs.length };
    }, [logs]);

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            {/* System Pulse Intelligence Strip */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className="flex items-center gap-4 bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Clock className="text-emerald-400" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Log Volume</p>
                        <p className="text-lg font-mono text-[var(--text-primary)] mt-0.5">{metrics.totalCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                        <XCircle className="text-rose-400" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Errors</p>
                        <p className="text-lg font-mono text-[var(--text-primary)] mt-0.5">{metrics.errorCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="text-amber-400" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Warnings</p>
                        <p className="text-lg font-mono text-[var(--text-primary)] mt-0.5">{metrics.warnCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Server className="text-blue-400" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Services Active</p>
                        <p className="text-lg font-mono text-[var(--text-primary)] mt-0.5">{metrics.uniqueSources}</p>
                    </div>
                </div>
            </div>

            <AdminListView<SystemLog>
                headerLabel="System"
                title="System Logs"
                hideHeader
                data={logs}
                isLoading={isLoading}
                columns={columns}
                getRowId={(log) => log.id}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search messages, paths..."
                sortOptions={sortOptions}
                defaultSortField="created_at_desc"
                defaultSortDirection="desc"
                filterDrawerContent={filterDrawerContent}
                activeFilterCount={activeFilterCount}
                onClearFilters={clearFilters}
                filterDrawerTitle="Filter System Logs"
                onRowClick={(log) => { setSelectedLog(log); setDrawerOpen(true); }}
                itemsPerPage={10}
            />

            <AdminDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedLog(null); }}
                title="System Log Detail"
                subtitle={selectedLog ? new Date(selectedLog.created_at).toLocaleString() : ''}
                viewMode
                width="560px"
            >
                {selectedLog && (
                    <div className="space-y-6">
                        {/* Level + Source */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <AdminFieldLabel>Level</AdminFieldLabel>
                                <div className="mt-2">
                                    {(() => {
                                        const cfg = LEVEL_CONFIG[selectedLog.level];
                                        const Icon = cfg.icon;
                                        return (
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${cfg.bg}`}>
                                                <Icon size={14} className={cfg.color} />
                                                <span className={`text-[13px] font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div>
                                <AdminFieldLabel>Source</AdminFieldLabel>
                                <div className="mt-2">
                                    {(() => {
                                        const cfg = SOURCE_CONFIG[selectedLog.source];
                                        const SourceIcon = cfg.icon;
                                        return (
                                            <div className="inline-flex items-center gap-2">
                                                <SourceIcon size={14} className="text-[var(--accent-gold)]" />
                                                <span className="text-[14px] font-medium text-[var(--text-primary)]">{cfg.label}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <AdminFieldLabel>Message</AdminFieldLabel>
                            <p className="mt-2 text-[14px] text-[var(--text-primary)] leading-relaxed">
                                {selectedLog.message}
                            </p>
                        </div>

                        {/* Path + Method + Status */}
                        {selectedLog.path && (
                            <div>
                                <AdminFieldLabel>Request</AdminFieldLabel>
                                <div className="mt-2 p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] font-mono text-[13px]">
                                    <span className="text-[var(--accent-gold)] font-bold mr-2">{selectedLog.method || 'GET'}</span>
                                    <span className="text-[var(--text-primary)]">{selectedLog.path}</span>
                                    {selectedLog.status_code && (
                                        <span className={`ml-2 ${selectedLog.status_code >= 500 ? 'text-rose-400' : selectedLog.status_code >= 400 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            → {selectedLog.status_code}
                                        </span>
                                    )}
                                    {selectedLog.duration_ms !== null && (
                                        <span className="text-[var(--text-muted)] ml-2">
                                            ({selectedLog.duration_ms}ms)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stack Trace */}
                        {selectedLog.error_stack && (
                            <div>
                                <AdminFieldLabel>Stack Trace</AdminFieldLabel>
                                <div className="mt-2 p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] overflow-x-auto">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code size={12} className="text-rose-400" />
                                        <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider">Error Stack</span>
                                    </div>
                                    <pre className="text-[12px] text-[var(--text-secondary)] font-mono whitespace-pre-wrap break-all leading-relaxed">
                                        {selectedLog.error_stack}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                            <div>
                                <AdminFieldLabel>Metadata</AdminFieldLabel>
                                <div className="mt-2 p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] space-y-1.5">
                                    {Object.entries(selectedLog.metadata).map(([key, value]) => (
                                        <div key={key} className="flex items-start gap-3">
                                            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold min-w-[90px] pt-0.5">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[13px] text-[var(--text-primary)] break-words font-mono">
                                                {value === null ? '(null)' : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* IP Address */}
                        {selectedLog.ip_address && (
                            <div>
                                <AdminFieldLabel>IP Address</AdminFieldLabel>
                                <p className="mt-2 text-[14px] font-mono text-[var(--text-primary)]">
                                    {selectedLog.ip_address}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </AdminDrawer>
        </div>
    );
}
