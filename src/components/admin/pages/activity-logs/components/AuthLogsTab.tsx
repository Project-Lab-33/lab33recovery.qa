"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, LogIn, LogOut, Globe, Monitor } from "lucide-react";
import { AdminListView, AdminDrawer, AdminFieldLabel, FilterSection } from "@/components/admin/shared";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import type { Column } from "@/components/admin/shared";
import type { SortOption } from "@/components/admin/shared/SortDropdown";
import { useAuthLogs } from "../hooks";
import type { AuthLog } from "../types";

// Parse user agent string for friendly display
function parseUserAgent(ua: string): { browser: string; os: string } {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    if (ua.includes('Chrome/') && !ua.includes('Edge/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Edge/') || ua.includes('Edg/')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { browser, os };
}

export function AuthLogsTab() {
    const {
        logs,
        users,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        total,
        isLoading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        activeFilterCount,
        clearFilters,
    } = useAuthLogs({ limit: 500 });

    const [selectedLog, setSelectedLog] = useState<AuthLog | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const columns: Column<AuthLog>[] = useMemo(() => [
        {
            key: 'actor_name',
            label: 'User',
            initialWidth: 200,
            primary: true,
            render: (log: AuthLog) => {
                const user = users.find(u => u.id === log.actor_id);
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)] flex-shrink-0 overflow-hidden">
                            {user?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[11px] font-bold text-[var(--accent-gold)] uppercase">
                                    {log.actor_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <span className="text-[14px] font-medium text-[var(--text-primary)] truncate block">
                                {log.actor_name}
                            </span>
                            {log.resource_label && (
                                <span className="text-[11px] text-[var(--text-muted)] truncate block">
                                    {log.resource_label}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'action',
            label: 'Event',
            initialWidth: 120,
            render: (log: AuthLog) => {
                const isLogin = log.action === 'login';
                return (
                    <div className="inline-flex items-center gap-1.5">
                        {isLogin ? (
                            <LogIn size={13} className="text-cyan-400" />
                        ) : (
                            <LogOut size={13} className="text-zinc-400" />
                        )}
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${isLogin ? 'text-cyan-400' : 'text-zinc-400'}`}>
                            {isLogin ? 'Sign In' : 'Sign Out'}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'device',
            label: 'Device',
            initialWidth: 160,
            render: (log: AuthLog) => {
                const ua = log.details?.user_agent as string | undefined;
                if (!ua) return <span className="text-[12px] text-[var(--text-muted)]">—</span>;
                const { browser, os } = parseUserAgent(ua);
                return (
                    <div className="flex items-center gap-2">
                        <Monitor size={13} className="text-[var(--text-muted)] flex-shrink-0" />
                        <span className="text-[12px] text-[var(--text-secondary)] truncate">
                            {browser} · {os}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'ip_address',
            label: 'IP Address',
            initialWidth: 130,
            render: (log: AuthLog) => (
                <span className="text-[12px] font-mono text-[var(--text-muted)]">
                    {log.ip_address || '—'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Time',
            initialWidth: 140,
            render: (log: AuthLog) => (
                <span className="text-[13px] text-[var(--text-muted)]" title={new Date(log.created_at).toLocaleString()}>
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
            ),
        },
    ], [users]);

    const sortOptions: SortOption[] = [
        { label: 'Newest First', field: 'created_at_desc', icon: Clock, defaultDirection: 'desc' },
        { label: 'Oldest First', field: 'created_at_asc', icon: Clock, defaultDirection: 'asc' },
    ];

    const filterDrawerContent = (
        <div className="space-y-6">
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

            {/* Active Users Summary */}
            {users.length > 0 && (
                <FilterSection title="Active Users">
                    <div className="space-y-2">
                        {users.map(user => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)] flex-shrink-0 overflow-hidden">
                                        {user.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase">
                                                {user.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                                        <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-3">
                                    {user.last_sign_in_at ? (
                                        <p className="text-[11px] text-[var(--text-muted)]">
                                            {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                                        </p>
                                    ) : (
                                        <p className="text-[11px] text-[var(--text-muted)]">Never</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </FilterSection>
            )}
        </div>
    );

    // Get the selected user's data for the drawer
    const selectedUser = selectedLog ? users.find(u => u.id === selectedLog.actor_id) : null;
    const selectedUa = selectedLog?.details?.user_agent as string | undefined;
    const parsedDevice = selectedUa ? parseUserAgent(selectedUa) : null;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <AdminListView<AuthLog>
                headerLabel="Authentication"
                title="Auth Events"
                hideHeader
                data={logs}
                isLoading={isLoading}
                columns={columns}
                getRowId={(log) => log.id}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by user..."
                sortOptions={sortOptions}
                defaultSortField="created_at_desc"
                defaultSortDirection="desc"
                filterDrawerContent={filterDrawerContent}
                activeFilterCount={activeFilterCount}
                onClearFilters={clearFilters}
                filterDrawerTitle="Filter Auth Events"
                onRowClick={(log) => { setSelectedLog(log); setDrawerOpen(true); }}
                itemsPerPage={10}
            />

            <AdminDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedLog(null); }}
                title="Auth Event Detail"
                subtitle={selectedLog ? format(new Date(selectedLog.created_at), "MMM d, yyyy · h:mm a") : ''}
                viewMode
                width="500px"
            >
                {selectedLog && (
                    <div className="space-y-7">
                        {/* Summary Banner */}
                        <div className={`p-4 rounded-xl border ${selectedLog.action === 'login'
                            ? 'bg-cyan-500/[0.06] border-cyan-500/15'
                            : 'bg-zinc-500/[0.06] border-zinc-500/15'
                            }`}>
                            <p className="text-[14px] text-[var(--text-primary)] font-medium">
                                {selectedLog.action === 'login'
                                    ? `${selectedLog.actor_name} signed in to the admin panel`
                                    : `${selectedLog.actor_name} signed out of the admin panel`
                                }
                            </p>
                            <p className="text-[12px] text-[var(--text-muted)] mt-1">
                                {formatDistanceToNow(new Date(selectedLog.created_at), { addSuffix: true })}
                            </p>
                        </div>

                        {/* User */}
                        <section>
                            <AdminFieldLabel>Who</AdminFieldLabel>
                            <div className="mt-2 flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                <div className="w-12 h-12 rounded-full bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)] flex-shrink-0 overflow-hidden">
                                    {selectedUser?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[15px] font-bold text-[var(--accent-gold)] uppercase">
                                            {selectedLog.actor_name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                                        {selectedLog.actor_name}
                                    </p>
                                    {selectedLog.resource_label && (
                                        <p className="text-[12px] text-[var(--text-muted)] truncate">
                                            {selectedLog.resource_label}
                                        </p>
                                    )}
                                    {selectedLog.actor_id && (
                                        <p className="text-[11px] text-[var(--text-muted)]/60 truncate font-mono mt-0.5">
                                            {selectedLog.actor_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Event */}
                        <section>
                            <AdminFieldLabel>Event</AdminFieldLabel>
                            <div className="mt-2 flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] ${selectedLog.action === 'login'
                                    ? 'text-cyan-400 bg-cyan-500/10'
                                    : 'text-zinc-400 bg-zinc-500/10'
                                    }`}>
                                    {selectedLog.action === 'login' ? (
                                        <LogIn size={18} />
                                    ) : (
                                        <LogOut size={18} />
                                    )}
                                </div>
                                <span className={`text-[15px] font-semibold ${selectedLog.action === 'login' ? 'text-cyan-400' : 'text-zinc-400'}`}>
                                    {selectedLog.action === 'login' ? 'Sign In' : 'Sign Out'}
                                </span>
                            </div>
                        </section>

                        {/* Device */}
                        {parsedDevice && (
                            <section>
                                <AdminFieldLabel>Device</AdminFieldLabel>
                                <div className="mt-2 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)]">
                                            <Monitor size={18} className="text-[var(--text-secondary)]" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-medium text-[var(--text-primary)]">
                                                {parsedDevice.browser} on {parsedDevice.os}
                                            </p>
                                            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[350px]" title={selectedUa}>
                                                {(selectedUa ?? '').slice(0, 80)}…
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* When */}
                        <section>
                            <AdminFieldLabel>When</AdminFieldLabel>
                            <div className="mt-2 flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                <Clock size={18} className="text-[var(--accent-gold)] flex-shrink-0" />
                                <div>
                                    <p className="text-[15px] font-medium text-[var(--text-primary)]">
                                        {format(new Date(selectedLog.created_at), "EEEE, MMMM d, yyyy")}
                                    </p>
                                    <p className="text-[13px] text-[var(--text-secondary)]">
                                        {format(new Date(selectedLog.created_at), "h:mm:ss a")} · {formatDistanceToNow(new Date(selectedLog.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* IP */}
                        {selectedLog.ip_address && (
                            <section>
                                <AdminFieldLabel>Network</AdminFieldLabel>
                                <div className="mt-2 flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                    <Globe size={18} className="text-[var(--text-secondary)] flex-shrink-0" />
                                    <div>
                                        <p className="text-[13px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">IP Address</p>
                                        <p className="text-[14px] font-mono text-[var(--text-primary)]">{selectedLog.ip_address}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Log ID */}
                        <div className="pt-2 border-t border-[var(--border-subtle)]">
                            <p className="text-[10px] text-[var(--text-muted)]/40 font-mono text-center">
                                Log ID: {selectedLog.id}
                            </p>
                        </div>
                    </div>
                )}
            </AdminDrawer>
        </div>
    );
}
