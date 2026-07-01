"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import {
    FileText, X, Upload, Trash2, History,
} from "lucide-react";
import { format } from "date-fns";
import { COUNTRIES, Country } from "@/lib/countries";
import { AdminPhoneInput, parseStoredPhone } from "@/components/admin/shared/AdminPhoneInput";
import { AdminNationalityInput } from "@/components/admin/shared/AdminNationalityInput";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { AdminFieldLabel } from "@/components/admin/shared/AdminFieldLabel";
import { AdminInput } from "@/components/admin/shared/AdminInput";
import { ActivityTimeline } from "@/components/admin/shared/ActivityTimeline";
import { ResourceActivityDrawer } from "@/components/admin/shared/ResourceActivityDrawer";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import { GenderIcon } from "@/components/admin/shared/GenderIcon";
import { calculateAge } from "@/components/admin/shared/utils/helpers";

/** Common form fields shared by both applicant and subscriber */
export interface PersonFormBase {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    birthdate: string;
    nationality: string;
}

/** Extra applicant fields */
export interface ApplicantFormExtras {
    status: string;
    position_title?: string;
    linkedin_url: string;
    notes: string;
}

/** Status pill config (must be provided by the applicant page) */
export interface StatusConfig {
    value: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
}

/** Document state for applicant file uploads */
export interface DocumentState {
    cvFile: File | null;
    setCvFile: (f: File | null) => void;
    coverLetterFile: File | null;
    setCoverLetterFile: (f: File | null) => void;
    /** Edit mode: existing doc filenames */
    existingCvFilename?: string | null;
    existingCoverLetterFilename?: string | null;
    /** Edit mode: mark-for-delete flags */
    deleteCv?: boolean;
    setDeleteCv?: (v: boolean) => void;
    deleteCoverLetter?: boolean;
    setDeleteCoverLetter?: (v: boolean) => void;
}

/** Position options for applicant create mode */
export interface PositionOptions {
    positions: string[];
}

interface PersonEditDrawerProps<F extends PersonFormBase> {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    variant: 'applicant' | 'subscriber';
    form: F;
    setForm: React.Dispatch<React.SetStateAction<F>>;
    onSave: () => void;
    isSaving: boolean;
    /** Validation attempted — show errors on required fields */
    attempted?: boolean;
    /** Title / subtitle overrides */
    title?: string;
    subtitle?: string;
    /** Save button label */
    saveLabel?: string;
    /** For edit mode: the existing record's id + created_at for timeline + timestamps */
    recordId?: string;
    recordCreatedAt?: string;
    /** Applicant-specific status config */
    statusConfigs?: StatusConfig[];
    /** Applicant-specific documents */
    documents?: DocumentState;
    /** Applicant-specific positions (create-mode select) */
    positionOptions?: PositionOptions;
}

export function PersonEditDrawer<F extends PersonFormBase>({
    isOpen, onClose, mode, variant, form, setForm,
    onSave, isSaving, attempted,
    title, subtitle, saveLabel,
    recordId, recordCreatedAt,
    statusConfigs, documents, positionOptions,
}: PersonEditDrawerProps<F>) {
    const isCreate = mode === 'create';
    const isEdit = mode === 'edit';
    const isApplicant = variant === 'applicant';
    const resourceType = isApplicant ? 'applicant' : 'waitlist';

    const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES.find(c => c.code === '+974') || COUNTRIES[0]);
    const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);

    // Sync phone country when form phone changes
    useEffect(() => {
        if (form.phone) {
            const parsed = parseStoredPhone(form.phone);
             
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPhoneCountry(parsed.country);
        }
    }, [form.phone]);

    // Cast form for applicant extras
    const applicantForm = form as unknown as PersonFormBase & ApplicantFormExtras;
    const updateField = <K extends keyof F>(key: K, value: F[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const fullName = `${form.first_name} ${form.last_name}`.trim();
    const displayTitle = title || (isCreate
        ? (isApplicant ? 'Add Applicant' : 'Add Subscriber')
        : (fullName || (isApplicant ? 'Applicant' : 'Subscriber')));
    const displaySubtitle = subtitle || (isCreate
        ? (isApplicant ? 'New Applicant' : 'New Contact')
        : (isApplicant ? 'Edit Applicant' : 'Edit Contact'));
    const displaySaveLabel = saveLabel || (isCreate
        ? (isApplicant ? 'Add Applicant' : 'Add Contact')
        : 'Save Changes');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return (
        <>
            <AdminDrawer
                isOpen={isOpen}
                onClose={onClose}
                title={displayTitle}
                subtitle={displaySubtitle}
                width="780px"
                onSave={onSave}
                saveLabel={displaySaveLabel}
                isSaving={isSaving}
                bodyClassName="space-y-4"
                compact
                headerActions={isEdit && recordId ? (
                    <button
                        type="button"
                        onClick={() => setActivityDrawerOpen(true)}
                        className="p-3 rounded-xl bg-[var(--surface-high)] hover:bg-[var(--accent-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors border border-[var(--border-medium)]"
                        title="Activity Logs"
                    >
                        <History size={18} />
                    </button>
                ) : undefined}
            >
                {/* Gender */}
                <div>
                    <AdminFieldLabel>Gender</AdminFieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g} type="button"
                                onClick={() => updateField('gender' as keyof F, g as F[keyof F])}
                                className={`h-12 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors border ${form.gender === g
                                    ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                                    : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    }`}
                            >
                                <GenderIcon gender={g} selected={form.gender === g} />
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applicant: status pills */}
                {isApplicant && statusConfigs && statusConfigs.length > 0 && (
                    <div>
                        <AdminFieldLabel>Status</AdminFieldLabel>
                        <div className="grid grid-cols-6 gap-2">
                            {statusConfigs.map(({ value, label, icon: Icon, color }) => {
                                const isActive = applicantForm.status === value;
                                return (
                                    <button key={value} type="button"
                                        onClick={() => updateField('status' as keyof F, value as F[keyof F])}
                                        className={`h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${isActive
                                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_4px_12px_rgba(212,175,119,0.3)]'
                                            : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)] cursor-pointer'
                                            }`}>
                                        <Icon size={12} className={isActive ? 'text-white' : color} />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Applicant create: position select */}
                {isApplicant && isCreate && positionOptions && (
                    <div>
                        <AdminFieldLabel>Position *</AdminFieldLabel>
                        <select
                            value={applicantForm.position_title || ''}
                            onChange={(e) => updateField('position_title' as keyof F, e.target.value as F[keyof F])}
                            className={`w-full px-4 py-2.5 rounded-xl bg-[var(--surface-mid)] border text-[var(--text-primary)] text-sm focus:outline-none transition-colors appearance-none cursor-pointer ${attempted && !applicantForm.position_title ? 'border-red-500/50' : 'border-[var(--border-medium)] focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)]'}`}
                        >
                            <option value="" className="bg-[var(--surface-mid)] text-[var(--text-muted)]">Select a position…</option>
                            {positionOptions.positions.map(p => (
                                <option key={p} value={p} className="bg-[var(--surface-mid)] text-[var(--text-primary)]">{p}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Applicant edit: position (read-only) */}
                {isApplicant && isEdit && applicantForm.position_title && (
                    <div>
                        <AdminFieldLabel>Position</AdminFieldLabel>
                        <AdminInput type="text" value={applicantForm.position_title} disabled />
                    </div>
                )}

                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <AdminFieldLabel>First Name {isCreate ? '*' : ''}</AdminFieldLabel>
                        <AdminInput
                            type="text"
                            value={form.first_name}
                            onChange={(e) => updateField('first_name' as keyof F, e.target.value as F[keyof F])}
                            placeholder="First name"
                            hasError={attempted && !form.first_name.trim()}
                        />
                        {attempted && !form.first_name.trim() && <FieldError>First name is required</FieldError>}
                    </div>
                    <div>
                        <AdminFieldLabel>Last Name {isCreate ? '*' : ''}</AdminFieldLabel>
                        <AdminInput
                            type="text"
                            value={form.last_name}
                            onChange={(e) => updateField('last_name' as keyof F, e.target.value as F[keyof F])}
                            placeholder="Last name"
                            hasError={attempted && !form.last_name.trim()}
                        />
                        {attempted && !form.last_name.trim() && <FieldError>Last name is required</FieldError>}
                    </div>
                </div>

                {/* Email + phone */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <AdminFieldLabel>Email {isCreate ? '*' : ''}</AdminFieldLabel>
                        <AdminInput
                            type="email"
                            value={form.email}
                            onChange={(e) => updateField('email' as keyof F, e.target.value as F[keyof F])}
                            placeholder="email@example.com"
                            hasError={attempted && !form.email.trim()}
                        />
                        {attempted && !form.email.trim() && <FieldError>Email is required</FieldError>}
                    </div>
                    <div>
                        <AdminFieldLabel>Phone</AdminFieldLabel>
                        <AdminPhoneInput
                            country={phoneCountry}
                            onCountryChange={(c) => {
                                setPhoneCountry(c);
                                const local = form.phone.replace(/^\+\d+/, '').replace(/\D/g, '');
                                updateField('phone' as keyof F, `${c.code}${local}` as F[keyof F]);
                            }}
                            value={form.phone ? parseStoredPhone(form.phone).localNumber : ''}
                            onChange={(val) => updateField('phone' as keyof F, `${phoneCountry.code}${val}` as F[keyof F])}
                            displayValue={form.phone}
                        />
                    </div>
                </div>

                {/* Birthday + age */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <AdminFieldLabel>Date of Birth</AdminFieldLabel>
                        <DateTimePicker
                            value={form.birthdate ? `${form.birthdate}T00:00` : null}
                            onChange={(val) => {
                                const dateOnly = val ? val.split('T')[0] : '';
                                updateField('birthdate' as keyof F, dateOnly as F[keyof F]);
                            }}
                            dateOnly
                        />
                    </div>
                    <div>
                        <AdminFieldLabel>Age</AdminFieldLabel>
                        <AdminInput type="text" value={
                            form.birthdate ? `${calculateAge(form.birthdate)} years old` : '—'
                        } disabled />
                    </div>
                </div>

                {/* Nationality + LinkedIn */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <AdminFieldLabel>Nationality</AdminFieldLabel>
                        <AdminNationalityInput
                            value={form.nationality}
                            onChange={(val) => updateField('nationality' as keyof F, val as F[keyof F])}
                        />
                    </div>
                    {isApplicant && (
                        <div>
                            <AdminFieldLabel>LinkedIn URL</AdminFieldLabel>
                            <AdminInput
                                type="url"
                                value={applicantForm.linkedin_url || ''}
                                onChange={(e) => updateField('linkedin_url' as keyof F, e.target.value as F[keyof F])}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    )}
                </div>

                {/* Edit: applied date */}
                {isEdit && recordCreatedAt && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <AdminFieldLabel>{isApplicant ? 'Applied' : 'Signed Up'}</AdminFieldLabel>
                            <AdminInput type="text" value={format(new Date(recordCreatedAt), 'MMM dd, yyyy • HH:mm')} disabled />
                        </div>
                    </div>
                )}

                {/* Documents (Applicant only) */}
                {isApplicant && documents && (
                    <div className="grid grid-cols-2 gap-4">
                        {/* CV */}
                        <div>
                            <AdminFieldLabel>CV / Resume</AdminFieldLabel>
                            <DocumentField
                                file={documents.cvFile}
                                setFile={documents.setCvFile}
                                existingFilename={isEdit ? documents.existingCvFilename : undefined}
                                markedForDelete={documents.deleteCv}
                                setMarkedForDelete={documents.setDeleteCv}
                                supabaseUrl={supabaseUrl}
                                uploadLabel="Upload CV (PDF, DOC)"
                                replaceLabel="Upload new CV"
                            />
                        </div>
                        {/* Cover Letter */}
                        <div>
                            <AdminFieldLabel>Cover Letter</AdminFieldLabel>
                            <DocumentField
                                file={documents.coverLetterFile}
                                setFile={documents.setCoverLetterFile}
                                existingFilename={isEdit ? documents.existingCoverLetterFilename : undefined}
                                markedForDelete={documents.deleteCoverLetter}
                                setMarkedForDelete={documents.setDeleteCoverLetter}
                                supabaseUrl={supabaseUrl}
                                uploadLabel="Upload Cover Letter (PDF, DOC)"
                                replaceLabel="Upload new letter"
                            />
                        </div>
                    </div>
                )}

                {/* Notes (Applicant only) */}
                {isApplicant && (
                    <div>
                        <AdminFieldLabel>Notes</AdminFieldLabel>
                        <textarea
                            value={applicantForm.notes || ''}
                            onChange={(e) => updateField('notes' as keyof F, e.target.value as F[keyof F])}
                            placeholder="Add internal notes about this applicant..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:border-[var(--accent-gold)]/40 focus:ring-1 focus:ring-[var(--accent-gold)]/20 transition-colors resize-none"
                        />
                    </div>
                )}

                {/* Activity timeline (edit mode) */}
                {isEdit && recordId && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-medium)]/50">
                        <ActivityTimeline resourceType={resourceType} resourceId={recordId} />
                    </div>
                )}
            </AdminDrawer>

            {/* Full Activity Logs Drawer */}
            {isEdit && recordId && (
                <ResourceActivityDrawer
                    isOpen={activityDrawerOpen}
                    onClose={() => setActivityDrawerOpen(false)}
                    resourceType={resourceType}
                    resourceId={recordId}
                    resourceLabel={fullName}
                    width="780px"
                />
            )}
        </>
    );
}


function FieldError({ children }: { children: ReactNode }) {
    return (
        <p className="flex items-center gap-1.5 mt-1.5 pl-1">
            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
            <span className="text-[12px] text-red-400/90 font-medium tracking-wide">{children}</span>
        </p>
    );
}

function DocumentField({
    file, setFile, existingFilename, markedForDelete,
    setMarkedForDelete, supabaseUrl, uploadLabel, replaceLabel,
}: {
    file: File | null;
    setFile: (f: File | null) => void;
    existingFilename?: string | null;
    markedForDelete?: boolean;
    setMarkedForDelete?: (v: boolean) => void;
    supabaseUrl?: string;
    uploadLabel: string;
    replaceLabel: string;
}) {
    if (file) {
        return (
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20">
                <FileText size={14} className="text-[var(--accent-gold)] shrink-0" />
                <span className="text-xs text-[var(--text-primary)] truncate flex-1">{file.name}</span>
                <button type="button" onClick={() => setFile(null)}
                    className="text-[var(--text-muted)] hover:text-rose-400 transition-colors shrink-0">
                    <X size={14} />
                </button>
            </div>
        );
    }

    if (!markedForDelete && existingFilename) {
        const url = `${supabaseUrl}/storage/v1/object/public/job-documents/${existingFilename}`;
        return (
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20">
                <FileText size={14} className="text-[var(--accent-gold)] shrink-0" />
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--accent-gold)] font-medium truncate flex-1 hover:underline">
                    {existingFilename.split('/').pop()}
                </a>
                {setMarkedForDelete && (
                    <button type="button" onClick={() => setMarkedForDelete(true)}
                        className="text-[var(--text-muted)] hover:text-rose-400 transition-colors shrink-0" title="Remove">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[var(--surface-mid)] border border-dashed border-[var(--border-medium)] hover:border-[var(--accent-gold)]/40 hover:bg-[var(--surface-high)] transition-colors cursor-pointer">
            <Upload size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">{markedForDelete ? replaceLabel : uploadLabel}</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        if (setMarkedForDelete) setMarkedForDelete(false);
                    }
                }} />
        </label>
    );
}
