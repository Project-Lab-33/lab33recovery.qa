"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import { AdminListView, FilterSection, FilterPill } from "@/components/admin/shared";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import { containerVariants, itemVariants } from "@/components/admin/shared/AnalyticsComponents";
import type { Column } from "@/components/admin/shared";
import type { SortOption } from "@/components/admin/shared/SortDropdown";
import { useActivityLogs } from "./hooks";
import { ActivityDetailDrawer } from "./components";
import { ACTION_CONFIG, RESOURCE_CONFIG, ACTION_OPTIONS, RESOURCE_OPTIONS } from "./constants";
import type { ActivityLog } from "./types";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Status badge colors for inline display
const STATUS_COLORS: Record<string, string> = {
    pending: 'text-amber-400',
    shortlisted: 'text-emerald-400',
    rejected: 'text-rose-400',
    archived: 'text-zinc-400',
    hired: 'text-cyan-400',
    interviewed: 'text-blue-400',
};

export default function ActivityLogsClient() {
    const {
        logs,
        actors,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        total,
        isLoading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        activeFilterCount,
        clearFilters,
        refresh,
    } = useActivityLogs({ limit: 500 });

    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleRevert = useCallback(async (log: ActivityLog) => {
        if (log.action !== 'status_change' || !log.details?.status) return;
        const status = log.details.status as { old: string; new: string };
        const oldStatus = status.old;

        if (!log.resource_id || !log.resource_type) {
            toast.error('Cannot revert — missing resource information');
            return;
        }

        const confirmed = window.confirm(
            `Revert "${log.resource_label}" status back to "${oldStatus}"?`
        );
        if (!confirmed) return;

        try {
            const supabase = createClient();

            // Map resource_type to DB table
            const tableMap: Record<string, string> = {
                applicant: 'job_applications',
                waitlist: 'waitlist',
            };
            const table = tableMap[log.resource_type];
            if (!table) {
                toast.error('Revert not supported for this resource type');
                return;
            }

            const { error } = await supabase
                .from(table)
                .update({ status: oldStatus })
                .eq('id', log.resource_id);

            if (error) throw error;
            toast.success(`Reverted "${log.resource_label}" to "${oldStatus}"`);
            refresh();
            setDrawerOpen(false);
        } catch (err) {
            console.error('[Revert]', err);
            toast.error('Failed to revert. Please try again.');
        }
    }, [refresh]);

    const columns: Column<ActivityLog>[] = useMemo(() => [
        {
            key: 'actor_name',
            label: 'User',
            initialWidth: 180,
            primary: true,
            render: (log: ActivityLog) => {
                const actor = actors.find(a => a.id === log.actor_id);
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)] flex-shrink-0 overflow-hidden">
                            {actor?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[11px] font-bold text-[var(--accent-gold)] uppercase">
                                    {log.actor_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                                </span>
                            )}
                        </div>
                        <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                            {log.actor_name}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'action',
            label: 'Action',
            initialWidth: 150,
            render: (log: ActivityLog) => {
                const cfg = ACTION_CONFIG[log.action];
                const Icon = cfg.icon;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <Icon size={12} className={cfg.color} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'description',
            label: 'Description',
            initialWidth: 320,
            render: (log: ActivityLog) => {
                const resourceCfg = RESOURCE_CONFIG[log.resource_type];
                const ResourceIcon = resourceCfg.icon;

                // Extract change summary
                let changeSummary: ReactNode = null;
                if (log.details && typeof log.details === 'object') {
                    const statusChange = log.details.status as { old: string; new: string } | undefined;
                    if (statusChange && typeof statusChange === 'object' && 'old' in statusChange && 'new' in statusChange) {
                        // Special: show status badge inline
                        const oldColor = STATUS_COLORS[statusChange.old] || 'text-zinc-400';
                        const newColor = STATUS_COLORS[statusChange.new] || 'text-zinc-400';
                        changeSummary = (
                            <span className="flex items-center gap-1.5 pl-[22px]">
                                <span className={`text-[11px] font-semibold capitalize ${oldColor}`}>
                                    {statusChange.old}
                                </span>
                                <ArrowRight size={10} className="text-[var(--accent-gold)]/60" />
                                <span className={`text-[11px] font-semibold capitalize ${newColor}`}>
                                    {statusChange.new}
                                </span>
                            </span>
                        );
                    } else {
                        // Generic field diffs
                        const diffs: string[] = [];
                        for (const [key, value] of Object.entries(log.details)) {
                            if (
                                value && typeof value === 'object' && !Array.isArray(value) &&
                                'old' in value && 'new' in value
                            ) {
                                const v = value as { old: unknown; new: unknown };
                                diffs.push(`${key.replace(/_/g, ' ')}: ${v.old ?? '—'} → ${v.new ?? '—'}`);
                            }
                        }
                        if (diffs.length > 0) {
                            changeSummary = (
                                <span className="text-[11px] text-[var(--accent-gold)]/70 truncate pl-[22px]">
                                    {diffs.join(', ')}
                                </span>
                            );
                        }
                    }
                }

                return (
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <ResourceIcon size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                            <span className="text-[13px] text-[var(--text-secondary)] truncate">
                                {resourceCfg.label}
                                {log.resource_label ? ` · ${log.resource_label}` : ''}
                            </span>
                        </div>
                        {changeSummary}
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            label: 'Time',
            initialWidth: 140,
            render: (log: ActivityLog) => (
                <span className="text-[13px] text-[var(--text-muted)]" title={new Date(log.created_at).toLocaleString()}>
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
            ),
        },
    ], [actors]);

    const sortOptions: SortOption[] = [
        { label: 'Newest First', field: 'created_at_desc', icon: Clock, defaultDirection: 'desc' },
        { label: 'Oldest First', field: 'created_at_asc', icon: Clock, defaultDirection: 'asc' },
    ];

    const filterDrawerContent = (
        <div className="space-y-6">
            <FilterSection title="Action" columns={3}>
                {ACTION_OPTIONS.map(opt => (
                    <FilterPill
                        key={opt.value}
                        label={opt.label}
                        isSelected={filters.action === opt.value}
                        onClick={() => setFilters(f => ({
                            ...f,
                            action: f.action === opt.value ? '' : opt.value,
                        }))}
                        icon={ACTION_CONFIG[opt.value].icon}
                    />
                ))}
            </FilterSection>

            <FilterSection title="Module" columns={3}>
                {RESOURCE_OPTIONS.map(opt => (
                    <FilterPill
                        key={opt.value}
                        label={opt.label}
                        isSelected={filters.resourceType === opt.value}
                        onClick={() => setFilters(f => ({
                            ...f,
                            resourceType: f.resourceType === opt.value ? '' : opt.value,
                        }))}
                        icon={RESOURCE_CONFIG[opt.value].icon}
                    />
                ))}
            </FilterSection>

            {actors.length > 0 && (
                <FilterSection title="User" columns={2}>
                    {actors.map(actor => (
                        <FilterPill
                            key={actor.id}
                            label={actor.name}
                            isSelected={filters.actorId === actor.id}
                            onClick={() => setFilters(f => ({
                                ...f,
                                actorId: f.actorId === actor.id ? '' : actor.id,
                            }))}
                        />
                    ))}
                </FilterSection>
            )}

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

    const handleRowClick = (log: ActivityLog) => {
        setSelectedLog(log);
        setDrawerOpen(true);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col flex-1 min-h-0"
        >
            <motion.div variants={itemVariants} className="flex flex-col flex-1 min-h-0">
                <AdminListView<ActivityLog>
                    headerLabel="Audit Trail"
                    title="Activity Logs"
                    hideHeader
                    data={logs}
                    isLoading={isLoading}
                    columns={columns}
                    getRowId={(log) => log.id}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search by user or resource..."
                    sortOptions={sortOptions}
                    defaultSortField="created_at_desc"
                    defaultSortDirection="desc"
                    filterDrawerContent={filterDrawerContent}
                    activeFilterCount={activeFilterCount}
                    onClearFilters={clearFilters}
                    filterDrawerTitle="Filter Activity Logs"
                    onRowClick={handleRowClick}
                    itemsPerPage={10}
                />
            </motion.div>

            <ActivityDetailDrawer
                log={selectedLog}
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedLog(null);
                }}
                actors={actors}
                onRevert={handleRevert}
            />
        </motion.div>
    );
}
