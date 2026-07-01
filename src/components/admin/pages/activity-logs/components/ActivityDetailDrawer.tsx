"use client";

import { AdminDrawer, AdminFieldLabel } from "@/components/admin/shared";
import { ACTION_CONFIG, RESOURCE_CONFIG } from "../constants";
import {
    Clock, Globe, ArrowRight, Monitor,
    Hash, Tag, Undo2, FileText, Mail, Phone, MapPin,
    Calendar, Briefcase, Flag, Link2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { ActivityLog, ActivityActor } from "../types";

interface ActivityDetailDrawerProps {
    log: ActivityLog | null;
    isOpen: boolean;
    onClose: () => void;
    actors?: ActivityActor[];
    onRevert?: (log: ActivityLog) => void;
}

// Pretty field label mapping
const FIELD_LABELS: Record<string, string> = {
    status: 'Status',
    is_read: 'Read',
    is_hidden: 'Hidden',
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    birthdate: 'Birth Date',
    nationality: 'Nationality',
    gender: 'Gender',
    position_title: 'Position',
    cv_filename: 'CV File',
    cover_letter_filename: 'Cover Letter',
    linkedin_url: 'LinkedIn',
    professional_statement: 'Statement',
    notes: 'Notes',
    title: 'Title',
    content: 'Content',
    hook: 'Hook',
    content_type: 'Content Type',
    phone_iso: 'Phone Country',
};

// Pretty value formatting
function formatValue(key: string, val: unknown): string {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (key === 'birthdate' && typeof val === 'string') {
        try { return format(new Date(val), 'MMM d, yyyy'); } catch { return String(val); }
    }
    if (key === 'created_at' && typeof val === 'string') {
        try { return format(new Date(val), 'MMM d, yyyy h:mm a'); } catch { return String(val); }
    }
    if (key.includes('filename') && typeof val === 'string') {
        const parts = val.split('/');
        return parts[parts.length - 1] || val;
    }
    return String(val);
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    shortlisted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    archived: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
    hired: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    interviewed: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    draft: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
    scheduled: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    saved: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

function StatusBadge({ status }: { status: string }) {
    const colors = STATUS_COLORS[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    return (
        <span className={`inline-flex px-3 py-1 rounded-lg text-[13px] font-semibold capitalize border ${colors}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

// Fields to hide from snapshots (noisy/internal)
const HIDDEN_SNAPSHOT_KEYS = new Set([
    'id', 'created_at', 'updated_at', 'actor_id', 'actor_name',
    'is_read', 'cv_filename', 'cover_letter_filename', 'phone_iso',
]);

// Field icon mapping
function getFieldIcon(key: string) {
    if (key.includes('email')) return Mail;
    if (key.includes('phone')) return Phone;
    if (key.includes('birth') || key.includes('date')) return Calendar;
    if (key.includes('nation') || key.includes('country')) return Flag;
    if (key.includes('position') || key.includes('title')) return Briefcase;
    if (key.includes('linkedin') || key.includes('url')) return Link2;
    if (key.includes('address') || key.includes('location')) return MapPin;
    if (key.includes('file') || key.includes('cv') || key.includes('cover')) return FileText;
    return Tag;
}

// Field-level diffs
function Changes({ details }: { details: Record<string, unknown> }) {
    if (!details || typeof details !== 'object') return null;

    const changeEntries: [string, { old: unknown; new: unknown }][] = [];
    for (const [key, value] of Object.entries(details)) {
        if (
            value && typeof value === 'object' && !Array.isArray(value) &&
            'old' in value && 'new' in value
        ) {
            changeEntries.push([key, value as { old: unknown; new: unknown }]);
        }
    }

    if (changeEntries.length === 0) return null;

    return (
        <section>
            <AdminFieldLabel>Changes</AdminFieldLabel>
            <div className="mt-2 space-y-2">
                {changeEntries.map(([field, change]) => (
                    <div
                        key={field}
                        className="p-3.5 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]"
                    >
                        <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2.5">
                            {FIELD_LABELS[field] || field.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {field === 'status' ? (
                                <>
                                    <StatusBadge status={String(change.old ?? '')} />
                                    <ArrowRight size={14} className="text-[var(--accent-gold)] flex-shrink-0" />
                                    <StatusBadge status={String(change.new ?? '')} />
                                </>
                            ) : (
                                <>
                                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[13px] font-medium max-w-[200px] truncate border border-rose-500/15">
                                        {formatValue(field, change.old)}
                                    </span>
                                    <ArrowRight size={14} className="text-[var(--accent-gold)] flex-shrink-0" />
                                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[13px] font-medium max-w-[200px] truncate border border-emerald-500/15">
                                        {formatValue(field, change.new)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Create snapshot
function CreateSnapshot({ details, action }: { details: Record<string, unknown>; action: string }) {
    if (!details || typeof details !== 'object' || action !== 'create') return null;

    // For creates, the entire details IS the snapshot (minus the diff-looking entries)
    const entries: [string, string][] = Object.entries(details)
        .filter(
            ([key, value]) =>
                !HIDDEN_SNAPSHOT_KEYS.has(key) &&
                value !== null &&
                value !== '' &&
                !(typeof value === 'object' && value !== null && 'old' in (value as Record<string, unknown>))
        )
        .map(([key, value]) => [key, String(value)] as [string, string]);

    if (entries.length === 0) return null;

    return (
        <section>
            <AdminFieldLabel>Created Data</AdminFieldLabel>
            <div className="mt-2 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {entries.map(([key, value]) => {
                    const FieldIcon = getFieldIcon(key);
                    return (
                        <div key={key} className="flex items-start gap-3 px-4 py-3">
                            <FieldIcon size={14} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold min-w-[80px] pt-0.5">
                                {FIELD_LABELS[key] || key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[13px] text-[var(--text-primary)] break-words flex-1">
                                {key === 'status' ? <StatusBadge status={value} /> : formatValue(key, value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// Context metadata (non-diff, non-snapshot entries)
function ContextMetadata({ details, action }: { details: Record<string, unknown>; action: string }) {
    if (!details || typeof details !== 'object') return null;

    const contextEntries = Object.entries(details).filter(([key, value]) => {
        if (HIDDEN_SNAPSHOT_KEYS.has(key)) return false;
        if (value === null || value === '') return false;
        if (typeof value === 'object' && !Array.isArray(value) && value !== null && 'old' in (value as Record<string, unknown>)) return false;
        if (action === 'create') return false;
        if (['user_agent', 'updatedKeys'].includes(key)) return false;
        return true;
    });

    if (contextEntries.length === 0) return null;

    return (
        <section>
            <AdminFieldLabel>Additional Context</AdminFieldLabel>
            <div className="mt-2 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {contextEntries.map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 px-4 py-3">
                        <Tag size={14} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold min-w-[80px] pt-0.5">
                            {FIELD_LABELS[key] || key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[13px] text-[var(--text-primary)] break-words flex-1">
                            {typeof value === 'object' ? JSON.stringify(value) : formatValue(key, String(value))}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Login/logout device info
function DeviceInfo({ details }: { details: Record<string, unknown> }) {
    const ua = details?.user_agent as string | undefined;
    if (!ua) return null;

    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Edge/')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return (
        <section>
            <AdminFieldLabel>Device</AdminFieldLabel>
            <div className="mt-2 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)]">
                        <Monitor size={18} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                        <p className="text-[14px] font-medium text-[var(--text-primary)]">
                            {browser} on {os}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[350px]" title={ua}>
                            {ua.slice(0, 80)}…
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function ActivityDetailDrawer({ log, isOpen, onClose, actors, onRevert }: ActivityDetailDrawerProps) {
    if (!log) return null;

    const actionCfg = ACTION_CONFIG[log.action];
    const resourceCfg = RESOURCE_CONFIG[log.resource_type];
    const ActionIcon = actionCfg.icon;
    const ResourceIcon = resourceCfg.icon;

    // Find actor avatar from actors list
    const actor = actors?.find(a => a.id === log.actor_id);

    // Check if revertable (status_change with old value present)
    const isRevertable = Boolean(
        log.action === 'status_change' && log.details?.status &&
        typeof log.details.status === 'object' && 'old' in (log.details.status as Record<string, unknown>)
    );


    // Build human-readable summary
    let summary = '';
    if (log.action === 'status_change' && log.details?.status) {
        const s = log.details.status as { old: string; new: string };
        summary = `Changed status from "${s.old}" to "${s.new}"`;
    } else if (log.action === 'create') {
        summary = `Created new ${resourceCfg.label.toLowerCase()}${log.resource_label ? `: ${log.resource_label}` : ''}`;
    } else if (log.action === 'delete') {
        summary = `Deleted ${resourceCfg.label.toLowerCase()}${log.resource_label ? `: ${log.resource_label}` : ''}`;
    } else if (log.action === 'update') {
        const diffs = Object.entries(log.details || {}).filter(([, v]) =>
            v && typeof v === 'object' && !Array.isArray(v) && 'old' in (v as Record<string, unknown>)
        );
        summary = `Updated ${diffs.length} field${diffs.length !== 1 ? 's' : ''} on ${resourceCfg.label.toLowerCase()}`;
    } else if (log.action === 'login') {
        summary = 'Signed in to the admin panel';
    } else if (log.action === 'logout') {
        summary = 'Signed out of the admin panel';
    } else {
        summary = `${actionCfg.label} on ${resourceCfg.label.toLowerCase()}`;
    }

    return (
        <AdminDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Activity Detail"
            subtitle={format(new Date(log.created_at), "MMM d, yyyy · h:mm a")}
            viewMode
            width="540px"
        >
            <div className="space-y-7">
                {/* Summary Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/[0.06] to-transparent border border-[var(--accent-gold)]/15">
                    <p className="text-[14px] text-[var(--text-primary)] font-medium leading-relaxed">
                        {summary}
                    </p>
                    <p className="text-[12px] text-[var(--text-muted)] mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                </div>

                {/* Who */}
                <section>
                    <AdminFieldLabel>Who</AdminFieldLabel>
                    <div className="mt-2 flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)] overflow-hidden flex-shrink-0">
                            {actor?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[15px] font-bold text-[var(--accent-gold)] uppercase">
                                    {log.actor_name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                                {log.actor_name}
                            </p>
                            {log.resource_label && (log.action === 'login' || log.action === 'logout') && (
                                <p className="text-[12px] text-[var(--text-muted)] truncate">
                                    {log.resource_label}
                                </p>
                            )}
                            {log.actor_id && (
                                <p className="text-[11px] text-[var(--text-muted)]/60 truncate font-mono mt-0.5">
                                    {log.actor_id}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* What */}
                <section>
                    <AdminFieldLabel>What</AdminFieldLabel>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        {/* Action */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${actionCfg.color} bg-[var(--surface-high)] border border-[var(--border-subtle)]`}>
                                <ActionIcon size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Action</p>
                                <p className={`text-[14px] font-semibold ${actionCfg.color}`}>
                                    {actionCfg.label}
                                </p>
                            </div>
                        </div>

                        {/* Module */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--accent-gold)] bg-[var(--surface-high)] border border-[var(--border-subtle)]">
                                <ResourceIcon size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Module</p>
                                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                                    {resourceCfg.label}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resource */}
                    {log.resource_label && log.action !== 'login' && log.action !== 'logout' && (
                        <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] bg-[var(--surface-high)] border border-[var(--border-subtle)]">
                                <Hash size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Resource</p>
                                <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                                    {log.resource_label}
                                </p>
                            </div>
                            {log.resource_id && (
                                <span className="text-[10px] text-[var(--text-muted)]/50 font-mono truncate max-w-[120px]">
                                    {log.resource_id.slice(0, 8)}…
                                </span>
                            )}
                        </div>
                    )}
                </section>

                {/* Changes (status change / update diffs) */}
                <Changes details={log.details} />

                {/* Create Snapshot */}
                <CreateSnapshot details={log.details} action={log.action} />

                {/* Additional Context */}
                <ContextMetadata details={log.details} action={log.action} />

                {/* Device Info (login/logout) */}
                <DeviceInfo details={log.details} />

                {/* When */}
                <section>
                    <AdminFieldLabel>When</AdminFieldLabel>
                    <div className="mt-2 flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                        <Clock size={18} className="text-[var(--accent-gold)] flex-shrink-0" />
                        <div>
                            <p className="text-[15px] font-medium text-[var(--text-primary)]">
                                {format(new Date(log.created_at), "EEEE, MMMM d, yyyy")}
                            </p>
                            <p className="text-[13px] text-[var(--text-secondary)]">
                                {format(new Date(log.created_at), "h:mm:ss a")} · {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Network (IP) */}
                {log.ip_address && (
                    <section>
                        <AdminFieldLabel>Network</AdminFieldLabel>
                        <div className="mt-2 flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                            <Globe size={18} className="text-[var(--text-secondary)] flex-shrink-0" />
                            <div>
                                <p className="text-[13px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">IP Address</p>
                                <p className="text-[14px] font-mono text-[var(--text-primary)]">{log.ip_address}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Revert Button */}
                {isRevertable && onRevert && (
                    <section>
                        <button
                            onClick={() => onRevert(log)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 transition-colors cursor-pointer"
                        >
                            <Undo2 size={16} />
                            <span className="text-[13px] font-semibold">Revert This Change</span>
                        </button>
                    </section>
                )}

                {/* Raw Log ID */}
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <p className="text-[10px] text-[var(--text-muted)]/40 font-mono text-center">
                        Log ID: {log.id}
                    </p>
                </div>
            </div>
        </AdminDrawer>
    );
}
