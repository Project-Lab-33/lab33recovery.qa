"use client";

import React, { useState } from "react";
import {
    Mail, Phone, Globe2, CalendarDays, Briefcase,
    FileText, Download, ExternalLink, History,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MapPin, Clock, Cake, Heart, LinkIcon,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StickyNote, Sparkles,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ActivityTimeline } from "./ActivityTimeline";
import { ResourceActivityDrawer } from "./ResourceActivityDrawer";
import { GenderIcon } from "./GenderIcon";
import { calculateAge, getCountryByName, formatNationality } from "./utils/helpers";
import { AdminDrawer } from "./AdminDrawer";
import Image from "next/image";

export interface PersonData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    gender?: string | null;
    birthdate?: string | null;
    nationality?: string | null;
    created_at: string;
    // Applicant-specific
    position_title?: string | null;
    status?: string | null;
    cv_filename?: string | null;
    cover_letter_filename?: string | null;
    linkedin_url?: string | null;
    notes?: string | null;
}

interface PersonDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    person: PersonData | null;
    variant: 'applicant' | 'subscriber';
    onEdit?: () => void;
    onDelete?: () => void;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-amber-500/8', text: 'text-amber-400', dot: 'bg-amber-400' },
    reviewed: { bg: 'bg-blue-500/8', text: 'text-blue-400', dot: 'bg-blue-400' },
    shortlisted: { bg: 'bg-violet-500/8', text: 'text-violet-400', dot: 'bg-violet-400' },
    hired: { bg: 'bg-emerald-500/8', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    rejected: { bg: 'bg-red-500/8', text: 'text-red-400', dot: 'bg-red-400' },
    archived: { bg: 'bg-zinc-500/8', text: 'text-zinc-400', dot: 'bg-zinc-400' },
};

export function PersonDetailDrawer({
    isOpen, onClose, person, variant, onEdit, onDelete,
}: PersonDetailDrawerProps) {
    const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);

    if (!person) return null;

    const fullName = `${person.first_name} ${person.last_name}`.trim();
    const age = person.birthdate ? calculateAge(person.birthdate) : null;
    const daysAgo = differenceInDays(new Date(), new Date(person.created_at));
    const statusStyle = person.status ? STATUS_STYLE[person.status] || STATUS_STYLE.pending : null;
    const resourceType = variant === 'applicant' ? 'applicant' : 'waitlist';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return (
        <>
            <AdminDrawer
                isOpen={isOpen}
                onClose={onClose}
                title={fullName || '—'}
                subtitle={variant === 'applicant' ? 'Applicant Details' : 'Subscriber Details'}
                width="680px"
                viewMode
                onEditClick={onEdit}
                onDeleteClick={onDelete}
                headerActions={
                    <IconAction
                        onClick={() => setActivityDrawerOpen(true)}
                        title="Activity Logs"
                        icon={History}
                    />
                }
                footer={
                    <div className="px-6 py-3 border-t border-[var(--border-subtle)]">
                        <ActivityTimeline resourceType={resourceType} resourceId={person.id} />
                    </div>
                }
            >
                {/* Status / meta row */}
                {(statusStyle || person.position_title) && (
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Status Badge */}
                        {statusStyle && person.status && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] ${statusStyle.bg} ${statusStyle.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                {person.status}
                            </span>
                        )}
                        {/* Position */}
                        {person.position_title && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                <Briefcase size={11} />
                                {person.position_title}
                            </span>
                        )}
                        {/* Days since signup */}
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                            <CalendarDays size={11} />
                            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                        </span>
                    </div>
                )}

                {/* Contact info */}
                <Section title="Contact">
                    <div className="grid grid-cols-2 gap-2.5">
                        <InfoRow icon={Mail} label="Email" value={person.email} />
                        <InfoRow icon={Phone} label="Phone" value={person.phone || '—'} />
                    </div>
                </Section>

                {/* Personal info */}
                <Section title="Personal">
                    <div className="grid grid-cols-2 gap-2.5">
                        {person.gender && (
                            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                <div className="w-8 h-8 rounded-lg bg-[var(--accent-gold)]/6 flex items-center justify-center shrink-0">
                                    <GenderIcon gender={person.gender} selected={false} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Gender</p>
                                    <p className="text-[12px] font-medium text-[var(--text-primary)] capitalize">{person.gender}</p>
                                </div>
                            </div>
                        )}
                        {(() => {
                            const country = person.nationality ? getCountryByName(person.nationality) : null;
                            return (
                                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-gold)]/6 flex items-center justify-center shrink-0">
                                        {country ? (
                                            <Image
                                                src={country.flag}
                                                alt={country.name}
                                                width={20}
                                                height={14}
                                                className="w-5 h-3.5 object-cover rounded-[2px]"
                                            />
                                        ) : (
                                            <Globe2 size={14} className="text-[var(--accent-gold)]/70" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Nationality</p>
                                        <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">
                                            {person.nationality ? formatNationality(person.nationality) : '—'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                        <InfoRow icon={Cake} label="Birthday" value={person.birthdate ? format(new Date(person.birthdate + 'T00:00'), 'MMM dd, yyyy') : '—'} />
                        <InfoRow icon={Heart} label="Age" value={age !== null ? `${age} years old` : '—'} />
                    </div>
                </Section>

                {/* Professional (applicants) */}
                {variant === 'applicant' && person.linkedin_url && (
                    <Section title="Professional">
                        <a
                            href={person.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] hover:border-blue-500/20 hover:bg-blue-500/[0.03] transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/8 flex items-center justify-center shrink-0">
                                <LinkIcon size={14} className="text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">LinkedIn</p>
                                <p className="text-[12px] font-medium text-blue-400 truncate group-hover:underline">{person.linkedin_url}</p>
                            </div>
                            <ExternalLink size={13} className="text-[var(--text-muted)] group-hover:text-blue-400 transition-colors shrink-0" />
                        </a>
                    </Section>
                )}

                {/* Documents (applicants) */}
                {variant === 'applicant' && (person.cv_filename || person.cover_letter_filename) && (
                    <Section title="Documents">
                        <div className="grid grid-cols-2 gap-2.5">
                            {person.cv_filename && (
                                <DocumentCard
                                    label="CV / Resume"
                                    filename={person.cv_filename}
                                    supabaseUrl={supabaseUrl}
                                />
                            )}
                            {person.cover_letter_filename && (
                                <DocumentCard
                                    label="Cover Letter"
                                    filename={person.cover_letter_filename}
                                    supabaseUrl={supabaseUrl}
                                />
                            )}
                        </div>
                    </Section>
                )}

                {/* Notes (applicants) */}
                {variant === 'applicant' && (
                    <Section title="Notes">
                        <div className="px-3.5 py-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] min-h-[48px]">
                            {person.notes ? (
                                <p className="text-[12px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{person.notes}</p>
                            ) : (
                                <p className="text-[12px] text-[var(--text-muted)]/40 italic flex items-center gap-1.5">
                                    <StickyNote size={12} /> No notes added
                                </p>
                            )}
                        </div>
                    </Section>
                )}

                {/* Timestamps */}
                <Section title="Record">
                    <div className="grid grid-cols-2 gap-2.5">
                        <InfoRow
                            icon={Clock}
                            label={variant === 'applicant' ? 'Applied' : 'Signed Up'}
                            value={format(new Date(person.created_at), 'MMM dd, yyyy • HH:mm')}
                        />
                        <InfoRow
                            icon={CalendarDays}
                            label="Days Ago"
                            value={daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
                        />
                    </div>
                </Section>

            </AdminDrawer>

            {/* Full Activity Logs Drawer */}
            {person && (
                <ResourceActivityDrawer
                    isOpen={activityDrawerOpen}
                    onClose={() => setActivityDrawerOpen(false)}
                    resourceType={resourceType}
                    resourceId={person.id}
                    resourceLabel={fullName}
                    width="680px"
                />
            )}
        </>
    );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--accent-gold)]/60" />
                {title}
            </h4>
            {children}
        </section>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-gold)]/6 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-[var(--accent-gold)]/70" />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{label}</p>
                <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">{value}</p>
            </div>
        </div>
    );
}

function DocumentCard({ label, filename, supabaseUrl }: { label: string; filename: string; supabaseUrl?: string }) {
    const url = `${supabaseUrl}/storage/v1/object/public/job-documents/${filename}`;
    const displayName = filename.split('/').pop() || filename;

    const handleDownload = async () => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = displayName;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch { /* silently fail */ }
    };

    return (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--accent-gold)]/[0.03] border border-[var(--accent-gold)]/15">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-gold)]/10 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-[var(--accent-gold)]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{label}</p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-medium text-[var(--accent-gold)] truncate block hover:underline">
                    {displayName}
                </a>
            </div>
            <button onClick={handleDownload}
                className="p-1.5 rounded-lg hover:bg-[var(--accent-gold)]/8 text-[var(--accent-gold)]/60 hover:text-[var(--accent-gold)] transition-colors shrink-0"
                title="Download">
                <Download size={13} />
            </button>
        </div>
    );
}

function IconAction({ onClick, title, icon: Icon }: { onClick: () => void; title: string; icon: typeof History }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/8 transition-all duration-150"
        >
            <Icon size={15} />
        </button>
    );
}
