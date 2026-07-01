'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    Archive,
    Eye,
    FileText,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    User,
    Trash2,
    XCircle,
    Star,
    Search,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Briefcase,
    Users,
} from 'lucide-react';
import { getCountryByName, formatNationality, calculateAge } from '@/components/admin/shared/utils/helpers';
import { GenderIcon } from '@/components/admin/shared/GenderIcon';
import { AdminCardView } from '@/components/admin/shared';
import type { Applicant } from '../types';

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
    reviewed: { icon: Search, color: 'text-blue-400', label: 'Reviewed' },
    shortlisted: { icon: CheckCircle, color: 'text-emerald-400', label: 'Shortlisted' },
    rejected: { icon: XCircle, color: 'text-rose-400', label: 'Rejected' },
    archived: { icon: Archive, color: 'text-zinc-400', label: 'Archived' },
    hired: { icon: Star, color: 'text-[var(--accent-gold)]', label: 'Hired' },
};

interface ApplicationsCardViewProps {
    applicants: Applicant[];
    onView: (applicant: Applicant) => void;
    onStatusChange: (id: string, newStatus: Applicant['status']) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
    canDelete?: boolean;
    canUpdate?: boolean;
}

export default function ApplicationsCardView({
    applicants,
    onView,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStatusChange,
    onDelete,
    isLoading,
    canDelete = true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    canUpdate = true,
}: ApplicationsCardViewProps) {
    return (
        <AdminCardView<Applicant>
            data={applicants}
            isLoading={isLoading}
            getItemId={(a) => a.id}
            emptyIcon={<Users size={36} className="text-[var(--text-secondary)]/20" />}
            emptyTitle="No Applicants Found"
            emptyDescription="Applications will appear here once candidates apply"
            loadingMessage="Retrieving candidate records..."
            itemsPerPage={12}
            renderCard={(applicant, index) => {
                const statusCfg = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group relative bg-transparent border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--accent-gold)]/40 transition-colors duration-300 flex flex-col h-[200px] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    >
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]/20">
                            <div className="flex items-center gap-0.5">
                                <div className="w-9 h-9 flex items-center justify-center">
                                    <GenderIcon gender={applicant.gender || ''} />
                                </div>
                                <span className="text-[11px] text-[var(--text-primary)]/80 font-medium uppercase tracking-wider truncate max-w-[140px]">
                                    {applicant.position_title}
                                </span>
                            </div>
                            <StatusIcon size={16} className={statusCfg.color} />
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h3
                                    className="font-serif text-[var(--text-primary)] text-base line-clamp-2 leading-snug group-hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                                    onClick={() => onView(applicant)}
                                >
                                    {applicant.first_name} {applicant.last_name}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)]/60 line-clamp-1 leading-relaxed">
                                    {applicant.email}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 mt-auto">
                                <div className="flex items-center gap-3">
                                    {applicant.nationality && (
                                        <div className="flex items-center gap-1.5">
                                            {getCountryByName(applicant.nationality) && (
                                                <Image
                                                    src={getCountryByName(applicant.nationality)?.flag || ''}
                                                    alt=""
                                                    width={16}
                                                    height={10}
                                                    className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-subtle)]"
                                                />
                                            )}
                                            <span className="text-[11px] text-[var(--text-secondary)]/40">
                                                {formatNationality(applicant.nationality)}
                                            </span>
                                        </div>
                                    )}
                                    {applicant.birthdate && (
                                        <span className="text-[11px] text-[var(--text-secondary)]/40">
                                            Age {calculateAge(applicant.birthdate)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]/60 font-mono">
                                    <Clock size={12} className="text-[var(--accent-gold)]/50" />
                                    <span>
                                        {new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-colors duration-300 flex items-center justify-center gap-3">
                            <button
                                onClick={() => onView(applicant)}
                                className="w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors flex items-center justify-center"
                                title="View"
                            >
                                <Eye size={16} />
                            </button>
                            {applicant.cv_filename && (
                                <a
                                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-documents/${applicant.cv_filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-xl bg-[var(--surface-high)]/90 border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors flex items-center justify-center"
                                    title="View CV"
                                >
                                    <FileText size={16} />
                                </a>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(applicant.id)}
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
