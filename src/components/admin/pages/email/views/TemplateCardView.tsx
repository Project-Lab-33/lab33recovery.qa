'use client';

import { motion } from 'framer-motion';
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mail, Eye, Edit, Trash2, CheckCircle, XCircle, Clock,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FileText, Users, Megaphone, Bell, UserPlus, Code2, Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import type { EmailTemplate, EmailCategory } from '../types';
import { TEMPLATE_CATEGORIES } from '../constants';
import { AdminCardView } from '@/components/admin/shared/AdminCardView';

const CATEGORY_STYLE: Record<EmailCategory, { gradient: string; border: string; glow: string }> = {
    general: { gradient: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.08)]' },
    waitlist: { gradient: 'from-violet-500/15 to-violet-600/5', border: 'border-violet-500/20', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.08)]' },
    application: { gradient: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/20', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.08)]' },
    marketing: { gradient: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/20', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]' },
    onboarding: { gradient: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.08)]' },
    notification: { gradient: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/20', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.08)]' },
};

interface TemplateCardViewProps {
    templates: EmailTemplate[];
    onView: (template: EmailTemplate) => void;
    onEdit: (template: EmailTemplate) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
    canCreate: boolean;
    canDelete: boolean;
}

export default function TemplateCardView({
    templates,
    onView,
    onEdit,
    onDelete,
    isLoading,
    canCreate,
    canDelete,
}: TemplateCardViewProps) {
    return (
        <AdminCardView<EmailTemplate>
            data={templates}
            isLoading={isLoading}
            getItemId={(t) => t.id}
            gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            emptyIcon={<Mail size={36} className="text-[var(--accent-gold)]/20" />}
            emptyTitle="No Templates Found"
            emptyDescription="Create your first email template to get started"
            loadingMessage="Loading Email Templates..."
            itemsPerPage={12}
            renderCard={(template) => {
                const cat = TEMPLATE_CATEGORIES.find(c => c.value === template.category);
                const CatIcon = cat?.icon || Mail;
                const catStyle = CATEGORY_STYLE[template.category] || CATEGORY_STYLE.general;
                const varCount = template.variables?.length || 0;
                const hasStructuredEditor = !!template.sections_json;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative bg-transparent border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--accent-gold)]/40 transition-colors duration-300 flex flex-col h-[260px] ${catStyle.glow}`}
                    >
                        {/* Category Strip */}
                        <div className={`h-1 w-full bg-gradient-to-r ${catStyle.gradient}`} />

                        {/* Card Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]/20">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${catStyle.gradient} ${catStyle.border} border`}>
                                    <CatIcon size={14} className="text-[var(--accent-gold)]" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]/60">
                                    {cat?.label || template.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {template.is_active ? (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Inactive</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h3 className="font-serif text-[var(--text-primary)] text-base line-clamp-1 leading-snug group-hover:text-[var(--accent-gold)] transition-colors">
                                    {template.name}
                                </h3>
                                <p className="text-[12px] text-[var(--text-secondary)]/50 line-clamp-2 leading-relaxed">
                                    {template.subject}
                                </p>
                            </div>

                            {/* Footer Meta */}
                            <div className="flex items-center justify-between pt-3 mt-auto border-t border-[var(--border-subtle)]/10">
                                <div className="flex items-center gap-3">
                                    {/* Variables badge */}
                                    {varCount > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Code2 size={11} className="text-[var(--accent-gold)]/50" />
                                            <span className="text-[10px] font-mono text-[var(--text-muted)]">{varCount} var{varCount !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                    {/* Structured editor indicator */}
                                    {hasStructuredEditor && (
                                        <div className="flex items-center gap-1">
                                            <Layers size={11} className="text-[var(--accent-gold)]/50" />
                                            <span className="text-[10px] text-[var(--text-muted)]">Visual</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                    <Clock size={11} className="text-[var(--accent-gold)]/40" />
                                    <span className="text-[10px] font-mono">
                                        {format(new Date(template.updated_at), 'MMM d')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-colors duration-300 flex items-center justify-center gap-3">
                            <button
                                onClick={() => onView(template)}
                                className="w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors flex items-center justify-center"
                                title="View"
                            >
                                <Eye size={16} />
                            </button>
                            {canCreate && (
                                <button
                                    onClick={() => onEdit(template)}
                                    className="w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors flex items-center justify-center"
                                    title="Edit"
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(template.id)}
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
