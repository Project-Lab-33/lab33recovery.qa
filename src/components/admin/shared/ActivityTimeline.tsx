"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
    Plus, Pencil, Trash2, ArrowRightLeft,
    type LucideIcon,
} from "lucide-react";

// ── Types ──
interface TimelineEntry {
    id: string;
    actor_name: string;
    action: string;
    details: Record<string, unknown>;
    created_at: string;
}

interface ActivityTimelineProps {
    resourceType: string;
    resourceId: string;
}

// ── Action display config ──
const TIMELINE_ACTIONS: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    create: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Created" },
    update: { icon: Pencil, color: "text-blue-400", bg: "bg-blue-500/10", label: "Updated" },
    delete: { icon: Trash2, color: "text-rose-400", bg: "bg-rose-500/10", label: "Deleted" },
    status_change: { icon: ArrowRightLeft, color: "text-amber-400", bg: "bg-amber-500/10", label: "Status Changed" },
};

export function ActivityTimeline({ resourceType, resourceId }: ActivityTimelineProps) {
    const [latest, setLatest] = useState<TimelineEntry | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLatest = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("admin_activity_logs")
            .select("id, actor_name, action, details, created_at")
            .eq("resource_type", resourceType)
            .eq("resource_id", resourceId)
            .order("created_at", { ascending: false })
            .limit(1);
        setLatest(data?.[0] as TimelineEntry || null);
        setLoading(false);
    }, [resourceType, resourceId]);

    useEffect(() => {
         
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLatest();
    }, [fetchLatest]);

    // Loading
    if (loading) {
        return (
            <div className="py-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent-gold)]">Last Activity</span>
                </div>
                <div className="h-8 rounded-lg bg-[var(--surface-high)]/40 animate-pulse" />
            </div>
        );
    }

    // No logs
    if (!latest) {
        return (
            <div className="py-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent-gold)]">Last Activity</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] italic">No activity recorded yet</p>
            </div>
        );
    }

    const cfg = TIMELINE_ACTIONS[latest.action] || TIMELINE_ACTIONS.update;
    const Icon = cfg.icon;

    return (
        <div className="py-3">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent-gold)]">Last Activity</span>
            </div>

            {/* Minimal single-line entry */}
            <div className="flex items-center gap-2.5">
                <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--border-medium)] bg-[var(--surface-low)]">
                    <Icon size={10} className={cfg.color} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.color} ${cfg.bg}`}>
                    {cfg.label}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                    by {latest.actor_name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]/60 ml-auto flex-shrink-0">
                    {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
                </span>
            </div>
        </div>
    );
}
