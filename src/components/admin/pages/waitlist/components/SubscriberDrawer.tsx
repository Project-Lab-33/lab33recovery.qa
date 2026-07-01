"use client";

import { useState, useEffect } from "react";
import { COUNTRIES, Country } from "@/lib/countries";
import { AdminPhoneInput, parseStoredPhone } from "@/components/admin/shared/AdminPhoneInput";
import { AdminNationalityInput } from "@/components/admin/shared/AdminNationalityInput";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { ActivityTimeline } from "@/components/admin/shared/ActivityTimeline";
import { ResourceActivityDrawer } from "@/components/admin/shared/ResourceActivityDrawer";
import { History } from "lucide-react";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import { GenderIcon } from "@/components/admin/shared/GenderIcon";

import type { Subscriber } from "../types";

interface SubscriberDrawerProps {
    drawerMode: 'create' | 'view' | 'edit' | null;
    setDrawerMode: (mode: 'create' | 'view' | 'edit' | null) => void;
    selectedSubscriber: Subscriber | null;
    addForm: {
        first_name: string; last_name: string; email: string;
        phone: string; gender: string; birthdate: string; nationality: string;
    };
    setAddForm: React.Dispatch<React.SetStateAction<SubscriberDrawerProps['addForm']>>;
    addSaving: boolean;
    addAttempted: boolean;
    closeDrawer: () => void;
    handleAddSubmit: () => void;
    openDeleteModal: (ids: string[]) => void;
}

export function SubscriberDrawer({
    drawerMode, setDrawerMode, selectedSubscriber,
    addForm, setAddForm, addSaving, addAttempted,
    closeDrawer, handleAddSubmit, openDeleteModal,
}: SubscriberDrawerProps) {
    const isViewMode = drawerMode === 'view';
    const isEditMode = drawerMode === 'edit';
    const isCreateMode = drawerMode === 'create';

    const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES.find(c => c.code === '+974') || COUNTRIES[0]);
    const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);

    // Sync phone country when drawer opens with subscriber data
    useEffect(() => {
        if (addForm.phone) {
            const parsed = parseStoredPhone(addForm.phone);
             
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPhoneCountry(parsed.country);
        }
    }, [addForm.phone]);

    return (
        <>
            <AdminDrawer
                isOpen={!!drawerMode}
                onClose={closeDrawer}
                subtitle={isCreateMode ? 'New Contact' : isViewMode ? 'Contact Details' : 'Edit Contact'}
                title={isCreateMode ? 'Add Subscriber' : selectedSubscriber ? `${addForm.first_name} ${addForm.last_name}`.trim() || 'Subscriber' : 'Subscriber'}
                width="680px"
                viewMode={isViewMode}
                onEditClick={selectedSubscriber ? () => setDrawerMode('edit') : undefined}
                onDeleteClick={selectedSubscriber ? () => openDeleteModal([selectedSubscriber.id]) : undefined}
                onSave={handleAddSubmit}
                saveLabel={isEditMode ? 'Save Changes' : 'Add Contact'}
                isSaving={addSaving}
                preventCloseWhileSaving={false}
                headerActions={isViewMode && selectedSubscriber ? (
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
                {/* Gender Select */}
                <div>
                    <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g} type="button" disabled={isViewMode}
                                onClick={() => setAddForm(prev => ({ ...prev, gender: g }))}
                                className={`h-12 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors border ${addForm.gender === g
                                    ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                                    : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    } ${isViewMode ? 'pointer-events-none' : ''}`}
                            >
                                <GenderIcon gender={g} selected={addForm.gender === g} />
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />First Name</label>
                        <input type="text" value={addForm.first_name} disabled={isViewMode}
                            onChange={(e) => setAddForm(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="First name"
                            className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border text-[var(--text-primary)] text-sm focus:outline-none placeholder:text-[var(--text-muted)] transition-colors disabled:opacity-70 disabled:cursor-default ${addAttempted && !addForm.first_name ? 'border-red-500/50' : 'border-[var(--border-medium)] focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)]'}`}
                        />
                        {addAttempted && !addForm.first_name && (
                            <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                <span className="text-[12px] text-red-400/90 font-medium tracking-wide">First name is required</span>
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Last Name</label>
                        <input type="text" value={addForm.last_name} disabled={isViewMode}
                            onChange={(e) => setAddForm(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Last name"
                            className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border text-[var(--text-primary)] text-sm focus:outline-none placeholder:text-[var(--text-muted)] transition-colors disabled:opacity-70 disabled:cursor-default ${addAttempted && !addForm.last_name ? 'border-red-500/50' : 'border-[var(--border-medium)] focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)]'}`}
                        />
                        {addAttempted && !addForm.last_name && (
                            <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                <span className="text-[12px] text-red-400/90 font-medium tracking-wide">Last name is required</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Email</label>
                    <input type="email" value={addForm.email} disabled={isViewMode}
                        onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@email.com"
                        className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border text-[var(--text-primary)] text-sm focus:outline-none placeholder:text-[var(--text-muted)] transition-colors disabled:opacity-70 disabled:cursor-default ${addAttempted && !addForm.email ? 'border-red-500/50' : 'border-[var(--border-medium)] focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)]'}`}
                    />
                    {addAttempted && !addForm.email && (
                        <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                            <span className="text-[12px] text-red-400/90 font-medium tracking-wide">Email address is required</span>
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Phone</label>
                    <AdminPhoneInput
                        country={phoneCountry}
                        onCountryChange={(c) => {
                            setPhoneCountry(c);
                            // Update phone value with new country code
                            const local = addForm.phone.replace(/^\+\d+/, '').replace(/\D/g, '');
                            setAddForm(prev => ({ ...prev, phone: `${c.code}${local}` }));
                        }}
                        value={addForm.phone ? parseStoredPhone(addForm.phone).localNumber : ''}
                        onChange={(val) => setAddForm(prev => ({ ...prev, phone: `${phoneCountry.code}${val}` }))}
                        disabled={isViewMode}
                        displayValue={addForm.phone}
                    />
                </div>

                {/* Birthdate */}
                <div>
                    <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Birthdate</label>
                    <DateTimePicker
                        value={addForm.birthdate ? `${addForm.birthdate}T00:00` : null}
                        onChange={(val) => {
                            const dateOnly = val ? val.split('T')[0] : '';
                            setAddForm(prev => ({ ...prev, birthdate: dateOnly }));
                        }}
                        dateOnly
                        readOnly={isViewMode}
                    />
                </div>

                {/* Nationality */}
                <div>
                    <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Nationality</label>
                    <AdminNationalityInput
                        value={addForm.nationality}
                        onChange={(val) => setAddForm(prev => ({ ...prev, nationality: val }))}
                        disabled={isViewMode}
                    />
                </div>
                {/* Activity Timeline — view mode only */}
                {isViewMode && selectedSubscriber && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-medium)]/50">
                        <ActivityTimeline resourceType="waitlist" resourceId={selectedSubscriber.id} />
                    </div>
                )}
            </AdminDrawer>

            {/* Full Activity Logs Drawer */}
            {
                selectedSubscriber && (
                    <ResourceActivityDrawer
                        isOpen={activityDrawerOpen}
                        onClose={() => setActivityDrawerOpen(false)}
                        resourceType="waitlist"
                        resourceId={selectedSubscriber.id}
                        resourceLabel={`${selectedSubscriber.first_name} ${selectedSubscriber.last_name}`}
                        width="680px"
                    />
                )
            }
        </>
    );
}
