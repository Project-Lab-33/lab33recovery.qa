'use client';

import { motion } from 'framer-motion';
import {
    Zap, Eye, Edit, Trash2, Power, PowerOff, Clock,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FileText, Users, UserPlus, Star, XCircle, CheckCircle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Activity, Send, Mail, Hash,
} from 'lucide-react';
import { format } from 'date-fns';
import type { EmailAutomation, TriggerEvent } from '../types';
import { TRIGGER_EVENTS } from '../constants';
import { AdminCardView } from '@/components/admin/shared/AdminCardView';

const TRIGGER_STYLE: Record<TriggerEvent, { gradient: string; border: string; glow: string }> = {
    waitlist_signup: { gradient: 'from-violet-500/15 to-violet-600/5', border: 'border-violet-500/20', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.08)]' },
    application_received: { gradient: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/20', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.08)]' },
    application_status_change: { gradient: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.08)]' },
    application_shortlisted: { gradient: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.08)]' },
    application_rejected: { gradient: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/20', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.08)]' },
    application_hired: { gradient: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/20', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]' },
    waitlist_promotion: { gradient: 'from-fuchsia-500/15 to-fuchsia-600/5', border: 'border-fuchsia-500/20', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.08)]' },
    admin_invite: { gradient: 'from-sky-500/15 to-sky-600/5', border: 'border-sky-500/20', glow: 'shadow-[0_0_15px_rgba(14,165,233,0.08)]' },
    contact_message_reply: { gradient: 'from-teal-500/15 to-teal-600/5', border: 'border-teal-500/20', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.08)]' },
    manual: { gradient: 'from-zinc-500/15 to-zinc-600/5', border: 'border-zinc-500/20', glow: 'shadow-[0_0_15px_rgba(113,113,122,0.08)]' },
};

interface AutomationCardViewProps {
    automations: EmailAutomation[];
    onView: (automation: EmailAutomation) => void;
    onEdit: (automation: EmailAutomation) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, currentState: boolean) => void;
    isLoading: boolean;
    canCreate: boolean;
    canDelete: boolean;
}

export default function AutomationCardView({
    automations,
    onView,
    onEdit,
    onDelete,
    onToggle,
    isLoading,
    canCreate,
    canDelete,
}: AutomationCardViewProps) {
    return (
        <AdminCardView<EmailAutomation>
            data={automations}
            isLoading={isLoading}
            getItemId={(a) => a.id}
            gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            emptyIcon={<Zap size={36} className="text-[var(--accent-gold)]/20" />}
            emptyTitle="No Automations Found"
            emptyDescription="Create your first automation to start sending emails automatically"
            loadingMessage="Loading Automations..."
            itemsPerPage={12}
            renderCard={(automation) => {
                const trigger = TRIGGER_EVENTS.find(t => t.value === automation.trigger_event);
                const TrigIcon = trigger?.icon || Zap;
                const trigStyle = TRIGGER_STYLE[automation.trigger_event] || TRIGGER_STYLE.manual;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative bg-transparent border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--accent-gold)]/40 transition-colors duration-300 flex flex-col h-[260px] ${trigStyle.glow}`}
                    >
                        <div className={`h-1 w-full bg-gradient-to-r ${trigStyle.gradient}`} />

                        {/* Card Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]/20">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${trigStyle.gradient} ${trigStyle.border} border`}>
                                    <TrigIcon size={14} className="text-[var(--accent-gold)]" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]/60">
                                    {trigger?.label || automation.trigger_event}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {automation.is_active ? (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)] animate-pulse" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Paused</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h3 className="font-serif text-[var(--text-primary)] text-base line-clamp-1 leading-snug group-hover:text-[var(--accent-gold)] transition-colors">
                                    {automation.name}
                                </h3>
                                <p className="text-[12px] text-[var(--text-secondary)]/50 line-clamp-2 leading-relaxed">
                                    {automation.description || trigger?.description || 'No description'}
                                </p>
                            </div>

                            {/* Footer Meta */}
                            <div className="flex items-center justify-between pt-3 mt-auto border-t border-[var(--border-subtle)]/10">
                                <div className="flex items-center gap-3">
                                    {/* Trigger count */}
                                    <div className="flex items-center gap-1">
                                        <Activity size={11} className="text-[var(--accent-gold)]/50" />
                                        <span className="text-[10px] font-mono text-[var(--accent-gold)]">{automation.trigger_count}</span>
                                        <span className="text-[10px] text-[var(--text-muted)]">sent</span>
                                    </div>
                                    {/* Linked template */}
                                    {automation.template && (
                                        <div className="flex items-center gap-1" title={automation.template.name}>
                                            <Mail size={11} className="text-[var(--text-muted)]/40" />
                                            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[80px]">
                                                {automation.template.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                    <Clock size={11} className="text-[var(--accent-gold)]/40" />
                                    <span className="text-[10px] font-mono">
                                        {format(new Date(automation.updated_at), 'MMM d')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-colors duration-300 flex items-center justify-center gap-3">
                            <button
                                onClick={() => onView(automation)}
                                className="w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors flex items-center justify-center"
                                title="View"
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                onClick={() => onToggle(automation.id, automation.is_active)}
                                className={`w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] transition-colors flex items-center justify-center ${automation.is_active
                                    ? 'text-emerald-400 hover:text-rose-400 hover:border-rose-400'
                                    : 'text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-400'
                                    }`}
                                title={automation.is_active ? 'Pause' : 'Activate'}
                            >
                                {automation.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                            </button>
                            {canCreate && (
                                <button
                                    onClick={() => onEdit(automation)}
                                    className="w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors flex items-center justify-center"
                                    title="Edit"
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(automation.id)}
                                    className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                );
            }}
        />
    );
}
