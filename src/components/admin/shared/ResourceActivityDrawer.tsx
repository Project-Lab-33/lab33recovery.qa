"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { AdminFieldLabel } from "@/components/admin/shared/AdminFieldLabel";
import {
    Plus, Pencil, Trash2, ArrowRightLeft, ArrowRight,
    UserCircle, Clock, type LucideIcon,
} from "lucide-react";

interface LogEntry {
    id: string;
    actor_name: string;
    actor_id: string | null;
    action: string;
    details: Record<string, unknown>;
    created_at: string;
    resource_label: string | null;
}

interface ResourceActivityDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    resourceType: string;
    resourceId: string;
    resourceLabel?: string;
    width?: string;
    maxWidth?: string;
}

// Action display config
const ACTION_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    create: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Created" },
    update: { icon: Pencil, color: "text-blue-400", bg: "bg-blue-500/10", label: "Updated" },
    delete: { icon: Trash2, color: "text-rose-400", bg: "bg-rose-500/10", label: "Deleted" },
    status_change: { icon: ArrowRightLeft, color: "text-amber-400", bg: "bg-amber-500/10", label: "Status Changed" },
};

function humanize(key: string): string {
    return key.replace(/_/g, " ").replace(/\bid\b/gi, "ID").replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined || val === "") return "(empty)";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
}

export function ResourceActivityDrawer({
    isOpen,
    onClose,
    resourceType,
    resourceId,
    resourceLabel,
    width = "600px",
    maxWidth,
}: ResourceActivityDrawerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from("admin_activity_logs")
            .select("id, actor_name, actor_id, action, details, created_at, resource_label")
            .eq("resource_type", resourceType)
            .eq("resource_id", resourceId)
            .order("created_at", { ascending: false })
            .limit(100);
        setLogs((data as LogEntry[]) || []);
        setLoading(false);
    }, [resourceType, resourceId]);

    useEffect(() => {
         
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isOpen) fetchLogs();
    }, [isOpen, fetchLogs]);

    return (
        <AdminDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Activity History"
            subtitle={resourceLabel || `${resourceType} logs`}
            viewMode
            width={width}
            maxWidth={maxWidth}
        >
            <div className="space-y-2">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 rounded-xl bg-[var(--surface-high)]/40 animate-pulse" />
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16">
                        <Clock size={32} className="text-[var(--text-muted)]/30 mx-auto mb-3" />
                        <p className="text-[14px] text-[var(--text-muted)]">No activity recorded yet</p>
                    </div>
                ) : (
                    <>
                        {/* Count */}
                        <p className="text-[11px] font-mono text-[var(--text-muted)] mb-4">
                            {logs.length} event{logs.length !== 1 ? "s" : ""}
                        </p>

                        {/* Timeline */}
                        <div className="relative ml-2">
                            {/* Vertical line */}
                            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[var(--border-medium)]" />

                            <div className="space-y-1">
                                {logs.map((entry) => {
                                    const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.update;
                                    const Icon = cfg.icon;
                                    const isExpanded = expandedId === entry.id;
                                    const changedFields = Object.entries(entry.details).filter(([k]) => k !== "id");
                                    const hasDiff = (entry.action === "update" || entry.action === "status_change") && changedFields.length > 0;
                                    const hasSnapshot = entry.action === "create" || entry.action === "delete";

                                    return (
                                        <div key={entry.id}>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                                className={`w-full text-left flex items-start gap-4 py-3 pl-0 pr-3 rounded-xl transition-colors ${isExpanded
                                                        ? "bg-[var(--surface-high)]/60"
                                                        : "hover:bg-[var(--surface-high)]/30"
                                                    } cursor-pointer`}
                                            >
                                                {/* Dot */}
                                                <div className="relative z-10 mt-0.5 w-[23px] h-[23px] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--border-medium)] bg-[var(--surface-low)]">
                                                    <Icon size={11} className={cfg.color} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <UserCircle size={12} className="text-[var(--text-muted)] flex-shrink-0" />
                                                        <span className="text-[12px] text-[var(--text-primary)] font-medium">{entry.actor_name}</span>
                                                        <span className="text-[10px] text-[var(--text-muted)]">·</span>
                                                        <span className="text-[11px] text-[var(--text-muted)]">
                                                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Expanded detail */}
                                            {isExpanded && (
                                                <div className="ml-[39px] mb-3 space-y-4 pr-3">
                                                    {/* Timestamp */}
                                                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                                                        <Clock size={11} />
                                                        {format(new Date(entry.created_at), "MMM d, yyyy · h:mm:ss a")}
                                                    </div>

                                                    {/* Diffs for update/status_change */}
                                                    {hasDiff && (
                                                        <div>
                                                            <AdminFieldLabel>Changes</AdminFieldLabel>
                                                            <div className="mt-2 space-y-2">
                                                                {changedFields.map(([field, diff]) => {
                                                                    const d = diff as { old: unknown; new: unknown };
                                                                    return (
                                                                        <div key={field} className="p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1.5">
                                                                                {humanize(field)}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[12px] font-medium max-w-[200px] truncate">
                                                                                    {formatValue(d?.old)}
                                                                                </span>
                                                                                <ArrowRight size={12} className="text-[var(--accent-gold)] flex-shrink-0" />
                                                                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[12px] font-medium max-w-[200px] truncate">
                                                                                    {formatValue(d?.new)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Snapshot for create/delete */}
                                                    {hasSnapshot && changedFields.length > 0 && (
                                                        <div>
                                                            <AdminFieldLabel>{entry.action === "delete" ? "Deleted Data" : "Initial Data"}</AdminFieldLabel>
                                                            <div className="mt-2 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] space-y-2">
                                                                {changedFields.map(([key, value]) => (
                                                                    <div key={key} className="flex items-start gap-3">
                                                                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold min-w-[90px] pt-0.5">
                                                                            {humanize(key)}
                                                                        </span>
                                                                        <span className="text-[12px] text-[var(--text-primary)] break-words">
                                                                            {formatValue(value)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminDrawer>
    );
}
