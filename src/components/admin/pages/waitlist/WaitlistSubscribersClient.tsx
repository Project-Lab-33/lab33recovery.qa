"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, Pencil, Trash2, User, Type, CalendarDays, Globe2, Mail, X } from "lucide-react";
import { motion } from "framer-motion";
import { usePermission } from "@/hooks/useAdminUser";
import { getCountryByIso, COUNTRIES, Country } from "@/lib/countries";
import { format } from "date-fns";
import { DeleteModal } from "@/components/admin/shared/DeleteModal";
import { useSubscribers } from "./hooks/useSubscribers";
import { useWaitlistExport } from "./hooks/useWaitlistExport";
import { GenderIcon } from "./components";
import { formatNationality, calculateAge, getCountryByName } from "@/components/admin/shared/utils/helpers";
import { AdminListView, ExportOverlay, AdminLoader, PermissionGate, FilterSection, FilterPill } from "@/components/admin/shared";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PersonDetailDrawer, type PersonData } from "@/components/admin/shared/PersonDetailDrawer";
import { PersonEditDrawer } from "@/components/admin/shared/PersonEditDrawer";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import type { Column, SortOption } from "@/components/admin/shared";
import type { SortField, Subscriber } from "./types";

const SORT_OPTIONS: SortOption[] = [
    { field: 'first_name' as SortField, label: 'Alphabetical', icon: Type, defaultDirection: 'asc' },
    { field: 'created_at' as SortField, label: 'Date Joined', icon: CalendarDays },
    { field: 'nationality' as SortField, label: 'Nationality', icon: Globe2, defaultDirection: 'asc' },
    { field: 'email' as SortField, label: 'Email', icon: Mail, defaultDirection: 'asc' },
];

const AGE_RANGES = [
    { id: '18-24', label: '18–24' },
    { id: '25-34', label: '25–34' },
    { id: '35-44', label: '35–44' },
    { id: '45-54', label: '45–54' },
    { id: '55+', label: '55+' },
];

export default function WaitlistSubscribers() {
    const {
        filteredSubscribers, subscribers, isLoading, error,
        selectedRows, setSelectedRows,
        searchQuery, setSearchQuery,
        sortField, setSortField, sortDirection, setSortDirection,
        genderFilter, setGenderFilter, nationalityFilter, setNationalityFilter,
        ageRangeFilter, setAgeRangeFilter, dateFromFilter, setDateFromFilter, dateToFilter, setDateToFilter,
        drawerMode, setDrawerMode, selectedSubscriber, addForm, setAddForm, addSaving, addAttempted,
        closeDrawer, openViewDrawer, openEditDrawer, openCreateDrawer, handleAddSubmit,
        deleteModalOpen, deleteTargetIds, isDeleting, openDeleteModal, confirmDelete, setDeleteModalOpen, setDeleteTargetIds,
    } = useSubscribers();

    const [personDrawerOpen, setPersonDrawerOpen] = useState(false);

    // Override view to open PersonDetailDrawer
    const handleViewSubscriber = (subscriber: Subscriber) => {
        openViewDrawer(subscriber); // sets selectedSubscriber + form
        setPersonDrawerOpen(true);
        setDrawerMode(null); // don't open SubscriberDrawer in view mode
    };

    // Deep-link: auto-open drawer from notification
    const searchParams = useSearchParams();
    const highlightHandled = useRef(false);
    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (highlightId && !isLoading && subscribers.length > 0 && !highlightHandled.current) {
            const target = subscribers.find(s => s.id === highlightId);
            if (target) {



                handleViewSubscriber(target);
                highlightHandled.current = true;
            }

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, subscribers, isLoading]);

    const canCreate = usePermission('waitlist', 'create');
    const canUpdate = usePermission('waitlist', 'update');
    const canDelete = usePermission('waitlist', 'delete');
    const canExport = usePermission('waitlist', 'export');

    const activeFilterCount = genderFilter.length + nationalityFilter.length + ageRangeFilter.length + (dateFromFilter ? 1 : 0) + (dateToFilter ? 1 : 0);

    // Export
    const { exportCSV, exportExcel, exportPDF, isExporting } = useWaitlistExport({
        filteredSubscribers, selectedRows,
    });

    // Nationality filter search (for autocomplete in filter drawer)
    const [natFilterSearch, setNatFilterSearch] = useState('');
    const natFilterSuggestion = useMemo(() => {
        if (!natFilterSearch) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(natFilterSearch.toLowerCase()) &&
            !nationalityFilter.includes(c.name)
        ) || null;
    }, [natFilterSearch, nationalityFilter]);

    const clearAllFilters = () => {
        setGenderFilter([]); setNationalityFilter([]); setAgeRangeFilter([]);
        setDateFromFilter(''); setDateToFilter(''); setNatFilterSearch('');
    };

    // Filter Drawer Content (passed into AdminListView)
    const filterContent = (
        <>
            {/* Gender */}
            <FilterSection title="Gender" columns={2}>
                {['male', 'female'].map((g) => {
                    const isSelected = genderFilter.includes(g);
                    return (
                        <FilterPill
                            key={g}
                            label={g.charAt(0).toUpperCase() + g.slice(1)}
                            iconNode={<GenderIcon gender={g} selected={isSelected} />}
                            isSelected={isSelected}
                            onClick={() => setGenderFilter(prev => isSelected ? prev.filter(x => x !== g) : [...prev, g])}
                        />
                    );
                })}
            </FilterSection>

            {/* Nationality */}
            <FilterSection title="Nationality">
                <div className="relative h-12 px-5 rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-medium)] focus-within:border-[var(--accent-gold)]/40 focus-within:bg-[var(--surface-high)]/60 transition-colors duration-300 flex items-center gap-3">
                    <Globe2 size={16} className="text-[var(--accent-gold)]/60 shrink-0" />
                    <div className="h-4 w-px bg-[var(--border-medium)]" />
                    <div className="relative flex-1">
                        {natFilterSuggestion && natFilterSearch && (
                            <div className="absolute inset-0 pointer-events-none flex items-center">
                                <span className="text-sm font-serif text-[var(--text-muted)]/50 whitespace-pre">
                                    {natFilterSearch}
                                    <span className="text-[var(--text-muted)]/50">{natFilterSuggestion.name.slice(natFilterSearch.length)}</span>
                                </span>
                            </div>
                        )}
                        <input type="text" value={natFilterSearch}
                            onChange={(e) => setNatFilterSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.key === 'Tab' || e.key === 'Enter') && natFilterSuggestion) {
                                    e.preventDefault();
                                    setNationalityFilter(prev => [...prev, natFilterSuggestion.name]);
                                    setNatFilterSearch('');
                                }
                            }}
                            placeholder="Type country name..."
                            className="w-full bg-transparent text-sm font-serif text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 focus:outline-none relative z-10" />
                    </div>
                    {natFilterSearch && (
                        <button type="button" onClick={() => setNatFilterSearch('')}
                            className="p-1 rounded-lg text-[var(--text-muted)]/50 hover:text-[var(--text-secondary)] transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
                {nationalityFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {nationalityFilter.map((nat) => {
                            const countryData = COUNTRIES.find(c => c.name === nat);
                            return (
                                <motion.div key={nat} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-lg bg-gradient-to-r from-[var(--accent-gold)]/15 to-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
                                    {countryData && <Image src={countryData.flag} alt="" width={16} height={12} className="w-4 h-3 object-cover rounded-sm" />}
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{nat}</span>
                                    <button type="button" onClick={() => setNationalityFilter(prev => prev.filter(x => x !== nat))}
                                        className="p-0.5 rounded hover:bg-[var(--surface-high)] transition-colors ml-1">
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </FilterSection>

            {/* Age Range */}
            <FilterSection title="Age Range" columns={3}>
                {AGE_RANGES.map((range) => (
                    <FilterPill
                        key={range.id}
                        label={range.label}
                        isSelected={ageRangeFilter.includes(range.id)}
                        onClick={() => setAgeRangeFilter(prev => ageRangeFilter.includes(range.id) ? prev.filter(x => x !== range.id) : [...prev, range.id])}
                    />
                ))}
            </FilterSection>

            {/* Date Joined */}
            <FilterSection title="Date Joined">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">From</label>
                        <DateTimePicker value={dateFromFilter || null} onChange={(v) => setDateFromFilter(v)} dateOnly />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">To</label>
                        <DateTimePicker value={dateToFilter || null} onChange={(v) => setDateToFilter(v)} dateOnly />
                    </div>
                </div>
            </FilterSection>
        </>
    );

    const columns: Column<Subscriber>[] = [
        {
            key: 'name',
            label: 'Full Name',
            initialWidth: 220,
            primary: true,
            render: (subscriber) => (
                <div className="flex items-center gap-2.5">
                    <GenderIcon gender={subscriber.gender} />
                    <p className="text-[15px] text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-gold)] transition-colors truncate">
                        {subscriber.first_name} {subscriber.last_name}
                    </p>
                </div>
            ),
        },
        {
            key: 'contact',
            label: 'Contact',
            initialWidth: 260,
            render: (subscriber) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Image src={getCountryByIso(subscriber.phone_iso).flag} alt={subscriber.phone_iso}
                            width={16} height={10} className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-medium)]" />
                        <p className="text-[13px] text-[var(--text-primary)]/80 font-mono tracking-tight">{subscriber.phone}</p>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)]/60 line-clamp-1 pl-6">{subscriber.email}</p>
                </div>
            ),
        },
        {
            key: 'birthdate',
            label: 'Birthdate',
            initialWidth: 160,
            render: (subscriber) => (
                <div className="space-y-0.5">
                    <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">
                        {subscriber.birthdate ? format(new Date(subscriber.birthdate), "MMM d, yyyy") : '—'}
                    </p>
                    {subscriber.birthdate && (
                        <p className="text-[12px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">
                            {calculateAge(subscriber.birthdate)} Years Old
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'nationality',
            label: 'Nationality',
            initialWidth: 160,
            render: (subscriber) => (
                <div className="flex items-center gap-2">
                    {getCountryByName(subscriber.nationality) && (
                        <Image src={getCountryByName(subscriber.nationality)?.flag || ''} alt=""
                            width={16} height={10} className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-medium)]" />
                    )}
                    <span className="text-[12px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-medium">
                        {formatNationality(subscriber.nationality)}
                    </span>
                </div>
            ),
        },
        {
            key: 'created',
            label: 'Joined',
            initialWidth: 160,
            render: (subscriber) => (
                <div className="space-y-0.5">
                    <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">{format(new Date(subscriber.created_at), "MMM d, yyyy")}</p>
                    <p className="text-[12px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">{format(new Date(subscriber.created_at), "HH:mm")}</p>
                </div>
            ),
        },
    ];

    const renderRowActions = (subscriber: Subscriber) => (
        <>
            <button title="View" onClick={(e) => { e.stopPropagation(); handleViewSubscriber(subscriber); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors">
                <Eye size={14} />
            </button>
            {canUpdate && (
                <button title="Edit" onClick={(e) => { e.stopPropagation(); openEditDrawer(subscriber); }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors">
                    <Pencil size={14} />
                </button>
            )}
            {canDelete && (
                <button title="Delete" onClick={(e) => { e.stopPropagation(); openDeleteModal([subscriber.id]); }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <Trash2 size={14} />
                </button>
            )}
        </>
    );

    if (isLoading && filteredSubscribers.length === 0) {
        return (
            <PermissionGate resource="waitlist" action="read">
                <AdminLoader page title="Retrieving Secure Records" subtitle="Synchronizing subscriber database pulse..." />
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="waitlist" action="read">
            <div className="w-full flex flex-col flex-1 min-h-0 overflow-hidden">
                <AdminListView<Subscriber>
                    headerLabel="Consolidated Data"
                    title="Subscribers"
                    data={filteredSubscribers}
                    isLoading={isLoading}
                    columns={columns}
                    getRowId={(s) => s.id}
                    error={error}
                    errorIcon={<User size={36} className="text-red-500/20" />}
                    loaderTitle="Retrieving Secure Records"
                    loaderSubtitle="Synchronizing subscriber database pulse..."
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search subscribers..."
                    sortOptions={SORT_OPTIONS}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortFieldChange={(f) => setSortField(f as SortField)}
                    onSortDirectionChange={setSortDirection}
                    defaultSortField="created_at"
                    defaultSortDirection="desc"
                    filterDrawerContent={filterContent}
                    filterDrawerTitle="Filter Subscribers"
                    activeFilterCount={activeFilterCount}
                    onClearFilters={clearAllFilters}
                    onExportCSV={canExport ? exportCSV : undefined}
                    onExportExcel={canExport ? exportExcel : undefined}
                    onExportPDF={canExport ? exportPDF : undefined}
                    onAdd={canCreate ? openCreateDrawer : undefined}
                    addTooltip="Add Contact"
                    onRowClick={handleViewSubscriber}
                    renderRowActions={renderRowActions}
                    actionsWidth={100}
                    enableSelection
                    selectedRows={selectedRows}
                    onSelectedRowsChange={setSelectedRows}
                    onDeleteSelected={canDelete ? openDeleteModal : undefined}
                    emptyIcon={<User size={36} className="text-[var(--text-secondary)]/20" />}
                    emptyTitle="No Subscribers Found"
                    emptyDescription={searchQuery || activeFilterCount > 0 ? "Try adjusting your search or filters" : "Subscribers will appear here"}
                />

                {/* PersonDetailDrawer for view mode */}
                <PersonDetailDrawer
                    isOpen={personDrawerOpen && !!selectedSubscriber}
                    onClose={() => { setPersonDrawerOpen(false); }}
                    person={selectedSubscriber ? {
                        id: selectedSubscriber.id,
                        first_name: selectedSubscriber.first_name,
                        last_name: selectedSubscriber.last_name,
                        email: selectedSubscriber.email,
                        phone: selectedSubscriber.phone,
                        gender: selectedSubscriber.gender,
                        birthdate: selectedSubscriber.birthdate,
                        nationality: selectedSubscriber.nationality,
                        created_at: selectedSubscriber.created_at,
                    } : null}
                    variant="subscriber"
                    onEdit={selectedSubscriber ? () => {
                        setPersonDrawerOpen(false);
                        if (selectedSubscriber) openEditDrawer(selectedSubscriber);
                    } : undefined}
                    onDelete={selectedSubscriber ? () => {
                        setPersonDrawerOpen(false);
                        if (selectedSubscriber) openDeleteModal([selectedSubscriber.id]);
                    } : undefined}
                />

                {/* PersonEditDrawer for create / edit modes */}
                {(drawerMode === 'create' || drawerMode === 'edit') && (
                    <PersonEditDrawer
                        isOpen={!!drawerMode}
                        onClose={closeDrawer}
                        mode={drawerMode as 'create' | 'edit'}
                        variant="subscriber"
                        form={addForm}
                        setForm={setAddForm}
                        onSave={handleAddSubmit}
                        isSaving={addSaving}
                        attempted={addAttempted}
                        recordId={selectedSubscriber?.id}
                        recordCreatedAt={selectedSubscriber?.created_at}
                    />
                )}

                {/* Delete Modal */}
                <DeleteModal isOpen={deleteModalOpen} isDeleting={isDeleting}
                    title={deleteTargetIds.length > 1 ? `Delete ${deleteTargetIds.length} Subscribers` : 'Delete Subscriber'}
                    description={deleteTargetIds.length > 1
                        ? `Are you sure you want to delete ${deleteTargetIds.length} subscribers? This action cannot be undone.`
                        : 'Are you sure you want to delete this subscriber? All associated data will be permanently removed.'}
                    onConfirm={confirmDelete}
                    onClose={() => { setDeleteModalOpen(false); setDeleteTargetIds([]); }}
                />

                {/* Export Loading Overlay */}
                <ExportOverlay isVisible={isExporting} title="Generating PDF" subtitle="Preparing subscriber export…" />
            </div>
        </PermissionGate>
    );
}
