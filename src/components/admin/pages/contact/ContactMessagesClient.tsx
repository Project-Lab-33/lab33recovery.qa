"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Mail, MessageSquare, Clock, CheckCheck, Archive,
    Send, RefreshCw, CalendarDays, Type, Inbox, Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    AdminListView, AdminDrawer, AdminLoader, DeleteModal,
    type Column, type SortOption
} from "@/components/admin/shared";
import { AdminFieldLabel } from "@/components/admin/shared/AdminFieldLabel";
import type { ContactMessage, ContactMessageStatus } from "./types";

const STATUS_CONFIG: Record<ContactMessageStatus, {
    icon: typeof Clock;
    color: string;
    label: string;
}> = {
    unread: { icon: Mail, color: "text-amber-400", label: "Unread" },
    read: { icon: MessageSquare, color: "text-blue-400", label: "Read" },
    replied: { icon: CheckCheck, color: "text-emerald-400", label: "Replied" },
    archived: { icon: Archive, color: "text-[var(--text-muted)]", label: "Archived" },
};

const SORT_OPTIONS: SortOption[] = [
    { field: "name", label: "Name", icon: Type, defaultDirection: "asc" },
    { field: "email", label: "Email", icon: Mail, defaultDirection: "asc" },
    { field: "created_at", label: "Date", icon: CalendarDays, defaultDirection: "desc" },
];

export default function ContactMessagesClient() {
    const supabase = useMemo(() => createClient(), []);

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "all">("all");
    const [selected, setSelected] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) toast.error("Failed to load messages");
        else setMessages(data || []);
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => { fetch(); }, [fetch]);

    const unreadCount = messages.filter(m => m.status === "unread").length;

    const displayed = useMemo(() => {
        let rows = [...messages];

        if (statusFilter !== "all") rows = rows.filter(m => m.status === statusFilter);

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            rows = rows.filter(m =>
                m.name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.message.toLowerCase().includes(q)
            );
        }

        rows.sort((a, b) => {
            const av = String(a[sortField as keyof ContactMessage] ?? "");
            const bv = String(b[sortField as keyof ContactMessage] ?? "");
            return sortDirection === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });

        return rows;
    }, [messages, statusFilter, searchQuery, sortField, sortDirection]);

    const openMessage = async (msg: ContactMessage) => {
        setSelected(msg.id);
        setReplyText("");
        setDrawerOpen(true);

        // Mark as read if unread
        if (msg.status === "unread") {
            await supabase
                .from("contact_messages")
                .update({ status: "read" })
                .eq("id", msg.id);
            setMessages(prev =>
                prev.map(m => m.id === msg.id ? { ...m, status: "read" as ContactMessageStatus } : m)
            );
        }
    };

    const selectedMsg = messages.find(m => m.id === selected) ?? null;

    const archiveMessage = async (id: string) => {
        await supabase.from("contact_messages").update({ status: "archived" }).eq("id", id);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "archived" as ContactMessageStatus } : m));
        setDrawerOpen(false);
        toast.success("Message archived");
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await window.fetch("/api/admin/contact/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({ message_id: deleteTargetId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            setMessages(prev => prev.filter(m => m.id !== deleteTargetId));
            setDrawerOpen(false);
            setDeleteTargetId(null);
            toast.success("Message permanently deleted");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to delete message");
        } finally {
            setIsDeleting(false);
        }
    };

    const sendReply = async () => {
        if (!selectedMsg || !replyText.trim()) return;
        setIsSending(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await window.fetch("/api/admin/contact/reply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({
                    message_id: selectedMsg.id,
                    reply_text: replyText.trim(),
                    to_name: selectedMsg.name,
                    to_email: selectedMsg.email,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Update local state
            const now = new Date().toISOString();
            setMessages(prev =>
                prev.map(m => m.id === selectedMsg.id
                    ? { ...m, status: "replied" as ContactMessageStatus, reply_text: replyText.trim(), replied_at: now }
                    : m
                )
            );
            toast.success(`Reply sent to ${selectedMsg.name}`);
            setReplyText("");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to send reply");
        } finally {
            setIsSending(false);
        }
    };

    const columns: Column<ContactMessage>[] = [
        {
            key: "name",
            label: "Sender",
            initialWidth: 200,
            primary: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-gold-soft)] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-[var(--accent-gold)] uppercase">
                            {row.name.charAt(0)}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className={`text-[14px] truncate group-hover:text-[var(--accent-gold)] transition-colors ${row.status === "unread" ? "font-semibold text-[var(--text-primary)]" : "font-medium text-[var(--text-primary)]"}`}>
                            {row.name}
                        </p>
                        {row.status === "unread" && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "email",
            label: "Email",
            initialWidth: 240,
            render: (row) => (
                <span className="text-[13px] text-[var(--text-secondary)]">{row.email}</span>
            ),
        },
        {
            key: "message",
            label: "Message",
            initialWidth: 320,
            render: (row) => (
                <p className="text-[13px] text-[var(--text-muted)] truncate max-w-[300px]">
                    {row.message}
                </p>
            ),
        },
        {
            key: "status",
            label: "Status",
            initialWidth: 130,
            render: (row) => {
                const s = STATUS_CONFIG[row.status];
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <s.icon size={12} className={s.color} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</span>
                    </div>
                );
            },
        },
        {
            key: "created_at",
            label: "Received",
            initialWidth: 160,
            render: (row) => (
                <span className="text-[13px] text-[var(--text-muted)]">
                    {new Date(row.created_at).toLocaleString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true,
                    })}
                </span>
            ),
        },
    ];

    const filterContent = (
        <div className="space-y-6">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                    Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {(["all", "unread", "read", "replied", "archived"] as const).map((s) => {
                        const isAll = s === "all";
                        const cfg = isAll ? null : STATUS_CONFIG[s];
                        const isActive = statusFilter === s;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`h-12 flex items-center justify-center gap-2 border rounded transition-all text-sm font-medium
                                    ${isActive
                                        ? "bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]"
                                        : "bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]"
                                    }`}
                            >
                                {cfg && <cfg.icon size={13} />}
                                {isAll ? "All" : cfg?.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <AdminLoader title="Contact Messages" subtitle="Loading inbox…" page />;
    }

    return (
        <div className="w-full flex flex-col flex-1 min-h-0 overflow-hidden">
            <AdminListView<ContactMessage>
                headerLabel={unreadCount > 0 ? `${unreadCount} unread` : "Inbox"}
                title="Contact Messages"
                data={displayed}
                isLoading={false}
                columns={columns}
                getRowId={(row) => row.id}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name, email or message…"
                sortOptions={SORT_OPTIONS}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortFieldChange={setSortField}
                onSortDirectionChange={setSortDirection}
                defaultSortField="created_at"
                defaultSortDirection="desc"
                filterDrawerContent={filterContent}
                activeFilterCount={statusFilter !== "all" ? 1 : 0}
                onClearFilters={() => setStatusFilter("all")}
                filterDrawerTitle="Filter Messages"
                onRowClick={openMessage}
                renderRowActions={(row) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); archiveMessage(row.id); }}
                            className="p-2 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all"
                            title="Archive"
                        >
                            <Archive size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTargetId(row.id); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all"
                            title="Delete permanently"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
                actionsWidth={96}
                emptyIcon={<Inbox size={36} className="text-[var(--text-secondary)]/20" />}
                emptyTitle="No messages yet"
                emptyDescription="Contact form submissions will appear here"
                itemsPerPage={15}
            />

            {/* Message Drawer */}
            <AdminDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={selectedMsg?.name ?? "Message"}
                subtitle={selectedMsg?.email ?? ""}
                width="520px"
                footer={
                    selectedMsg ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTargetId(selectedMsg.id)}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                                title="Delete permanently"
                            >
                                {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                            {selectedMsg.status !== "archived" && (
                                <button
                                    onClick={() => archiveMessage(selectedMsg.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all text-sm"
                                >
                                    <Archive size={14} />
                                    Archive
                                </button>
                            )}
                            {selectedMsg.status !== "archived" && (
                                <button
                                    onClick={sendReply}
                                    disabled={isSending || !replyText.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-gold)] text-black font-semibold text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {isSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                    {isSending ? "Sending…" : "Send Reply"}
                                </button>
                            )}
                        </div>
                    ) : undefined
                }
            >
                {selectedMsg && (
                    <div className="space-y-6">
                        {/* Status + Date */}
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5">
                                {(() => {
                                    const s = STATUS_CONFIG[selectedMsg.status];
                                    return (
                                        <>
                                            <s.icon size={13} className={s.color} />
                                            <span className={`text-[12px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</span>
                                        </>
                                    );
                                })()}
                            </div>
                            <span className="text-[12px] text-[var(--text-muted)]">
                                {new Date(selectedMsg.created_at).toLocaleString("en-US", {
                                    month: "long", day: "numeric", year: "numeric",
                                    hour: "2-digit", minute: "2-digit", hour12: true,
                                })}
                            </span>
                        </div>

                        {/* Message */}
                        <div>
                            <AdminFieldLabel>Message</AdminFieldLabel>
                            <div className="mt-2 p-4 bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-xl">
                                <p className="text-[14px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                                    {selectedMsg.message}
                                </p>
                            </div>
                        </div>

                        {/* Previous reply */}
                        <AnimatePresence>
                            {selectedMsg.reply_text && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                    <AdminFieldLabel>Previous Reply</AdminFieldLabel>
                                    <div className="mt-2 p-4 bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/20 rounded-xl">
                                        <p className="text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                                            {selectedMsg.reply_text}
                                        </p>
                                        {selectedMsg.replied_at && (
                                            <p className="text-[11px] text-[var(--text-muted)] mt-2">
                                                Sent {new Date(selectedMsg.replied_at).toLocaleString("en-US", {
                                                    month: "short", day: "numeric",
                                                    hour: "2-digit", minute: "2-digit", hour12: true,
                                                })}
                                                {selectedMsg.replied_by ? ` by ${selectedMsg.replied_by}` : ""}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Reply composer */}
                        {selectedMsg.status !== "archived" && (
                            <div>
                                <AdminFieldLabel>
                                    {selectedMsg.status === "replied" ? "Send Another Reply" : `Reply to ${selectedMsg.name}`}
                                </AdminFieldLabel>
                                <textarea
                                    rows={5}
                                    placeholder={`Write your reply to ${selectedMsg.name}…`}
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    className="mt-2 w-full px-4 py-3 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-all resize-none"
                                />
                                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                                    Sends via email directly to the visitor.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </AdminDrawer>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={!!deleteTargetId}
                isDeleting={isDeleting}
                title="Delete Message"
                description={`Permanently delete this message from ${messages.find(m => m.id === deleteTargetId)?.name ?? 'this sender'}? This cannot be undone.`}
                onConfirm={confirmDelete}
                onClose={() => { if (!isDeleting) setDeleteTargetId(null); }}
            />
        </div>
    );
}

