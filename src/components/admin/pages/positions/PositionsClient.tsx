"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Briefcase, Trash2, Eye, Pencil,
    CheckCircle, Clock, Archive, Tag, Type, CalendarDays,
} from "lucide-react";
import { useAdminUser, usePermission } from "@/hooks/useAdminUser";
import { AdminLoader } from "@/components/admin/shared";
import { createClient } from "@/lib/supabase/client";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    format, startOfDay, endOfDay, startOfMonth, endOfMonth,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    subMonths, subYears, startOfWeek, endOfWeek, isWithinInterval,
} from "date-fns";
import { toast } from "sonner";
import { DeleteModal } from "@/components/admin/shared/DeleteModal";
import { AdminListView, type Column, type SortOption } from "@/components/admin/shared/AdminListView";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import type { Position } from "./types";
import { ExportOverlay, PermissionGate } from "@/components/admin/shared";

import { motion, AnimatePresence } from "framer-motion";

type DateRangeFilter = '7d' | '30d' | '90d' | 'today' | 'week' | 'month' | 'lastMonth' | 'lastYear' | 'all' | 'custom';
type SortField = 'created_at' | 'title' | 'code' | 'status';
type SortDirection = 'asc' | 'desc';

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; border: string; label: string }> = {
    active: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Active' },
    draft: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Draft' },
    archived: { icon: Archive, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', label: 'Archived' },
};

const SORT_OPTIONS: SortOption[] = [
    { field: 'title', label: 'Title', icon: Type, defaultDirection: 'asc' },
    { field: 'created_at', label: 'Date Created', icon: CalendarDays, defaultDirection: 'desc' },
    { field: 'code', label: 'Code', icon: Tag, defaultDirection: 'asc' },
    { field: 'status', label: 'Status', icon: CheckCircle, defaultDirection: 'asc' },
];

export default function PositionsClient() {
    const supabase = useMemo(() => createClient(), []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user: currentUser } = useAdminUser();
    const canCreate = usePermission('applications', 'create');
    const canUpdate = usePermission('applications', 'update');
    const canDelete = usePermission('applications', 'delete');
    const canExport = usePermission('applications', 'export');

    // Data
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
    const [customDateRange, setCustomDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    // Custom date states — for DateTimePicker
    const [tempStart, setTempStart] = useState(customDateRange.start || '');
    const [tempEnd, setTempEnd] = useState(customDateRange.end || '');

    const handleApplyCustomRange = () => {
        if (tempStart && tempEnd) {
            setCustomDateRange({ start: tempStart.split('T')[0], end: tempEnd.split('T')[0] });
            setDateFilter('custom');
        }
    };

    const handleClearCustomRange = () => {
        setTempStart('');
        setTempEnd('');
        setCustomDateRange({ start: null, end: null });
        if (dateFilter === 'custom') setDateFilter('all');
    };

    // Sort
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Selection
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Delete
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [posViewMode, setPosViewMode] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    const [formData, setFormData] = useState({ title: '', code: '', segment: '', description: '', requirements: '', contact_email: 'admin@thelab33recovery.com', status: 'active' as Position['status'] });
    const [isSaving, setIsSaving] = useState(false);
    const [attemptedSave, setAttemptedSave] = useState(false);

    const fetchPositions = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from("positions").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setPositions(data || []);
        } catch (err) { console.error("Error fetching positions:", err); toast.error("Failed to load positions"); }
        finally { setIsLoading(false); }
    }, [supabase]);

    useEffect(() => {
        fetchPositions();
        const channel = supabase.channel('positions_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, () => fetchPositions()).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchPositions, supabase]);

    const filteredPositions = useMemo(() => {
        let filtered = positions.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.segment.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (statusFilter.length > 0) filtered = filtered.filter(p => statusFilter.includes(p.status));
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate: Date, endDate: Date = endOfDay(now);
            switch (dateFilter) {
                case '7d': startDate = startOfDay(subMonths(now, 0)); startDate.setDate(now.getDate() - 7); break;
                case '30d': startDate = startOfDay(subMonths(now, 1)); break;
                case '90d': startDate = startOfDay(subMonths(now, 3)); break;
                case 'custom':
                    if (customDateRange.start && customDateRange.end) { startDate = startOfDay(new Date(customDateRange.start)); endDate = endOfDay(new Date(customDateRange.end)); }
                    else return filtered;
                    break;
                default: return filtered;
            }
            filtered = filtered.filter(p => isWithinInterval(new Date(p.created_at), { start: startDate!, end: endDate }));
        }
        const STATUS_ORDER = ['active', 'draft', 'archived'];
        filtered.sort((a, b) => {
            const dir = sortDirection === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'title': return dir * a.title.localeCompare(b.title);
                case 'created_at': return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                case 'code': return dir * a.code.localeCompare(b.code);
                case 'status': return dir * (STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
                default: return 0;
            }
        });
        return filtered;
    }, [positions, searchQuery, dateFilter, customDateRange, statusFilter, sortField, sortDirection]);

    const activeFilterCount = (dateFilter !== 'all' ? 1 : 0) + statusFilter.length;

    const confirmDelete = async () => {
        if (bulkDeleteIds.length > 0) {
            setIsDeleting(true);
            try {
                const { error } = await supabase.from('positions').delete().in('id', bulkDeleteIds);
                if (error) throw error;
                setPositions(prev => prev.filter(p => !bulkDeleteIds.includes(p.id)));
                setSelectedRows([]);
                toast.success(`${bulkDeleteIds.length} position${bulkDeleteIds.length === 1 ? '' : 's'} deleted`);
            } catch (err) { console.error('Bulk delete error:', err); toast.error('Failed to delete positions'); }
            finally { setIsDeleting(false); setDeleteModalOpen(false); setBulkDeleteIds([]); }
            return;
        }
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from("positions").delete().eq("id", deleteId);
            if (error) throw error;
            setPositions(prev => prev.filter(p => p.id !== deleteId));
            toast.success("Position deleted");
        } catch (err) { console.error("Error deleting:", err); toast.error("Failed to delete position"); }
        finally { setIsDeleting(false); setDeleteModalOpen(false); setDeleteId(null); }
    };

    const openDeleteModal = (id: string) => { setDeleteId(id); setBulkDeleteIds([]); setDeleteModalOpen(true); };
    const openBulkDeleteModal = (ids: string[]) => { setBulkDeleteIds(ids); setDeleteId(null); setDeleteModalOpen(true); };

    const populateForm = (position: Position) => {
        setEditingPosition(position);
        setFormData({ title: position.title, code: position.code, segment: position.segment, description: position.description, requirements: position.requirements.join('\n'), contact_email: position.contact_email, status: position.status });
    };

    const openViewDrawer = (position: Position) => {
        populateForm(position);
        setPosViewMode(true);
        setDrawerOpen(true);
        setAttemptedSave(false);
    };

    const openEditDrawer = (position?: Position) => {
        if (position) {
            populateForm(position);
        } else {
            setEditingPosition(null);
            setFormData({ title: '', code: '', segment: '', description: '', requirements: '', contact_email: 'admin@thelab33recovery.com', status: 'active' });
        }
        setPosViewMode(false);
        setDrawerOpen(true);
        setAttemptedSave(false);
    };

    const savePosition = async () => {
        setAttemptedSave(true);
        if (!formData.title.trim() || !formData.code.trim()) { return; }
        setIsSaving(true);
        const payload = { title: formData.title.trim(), code: formData.code.trim(), segment: formData.segment.trim(), description: formData.description.trim(), requirements: formData.requirements.split('\n').map(r => r.trim()).filter(Boolean), contact_email: formData.contact_email.trim(), status: formData.status };
        try {
            if (editingPosition) {
                const { error } = await supabase.from("positions").update(payload).eq("id", editingPosition.id);
                if (error) throw error;
                toast.success("Position updated");
            } else {
                const { error } = await supabase.from("positions").insert(payload);
                if (error) throw error;
                toast.success("Position created");
            }
            setDrawerOpen(false);
            fetchPositions();
        } catch (err) { console.error("Error saving:", err); toast.error("Failed to save position"); }
        finally { setIsSaving(false); }
    };

    const [isExporting, setIsExporting] = useState(false);
    const exportToPDF = async () => {
        const exportData = selectedRows.length > 0 ? filteredPositions.filter(p => selectedRows.includes(p.id)) : filteredPositions;
        if (exportData.length === 0) { toast.error("No data to export"); return; }
        setIsExporting(true);
        try {
            const { createBrandedPDF } = await import("@/components/admin/shared/utils/exportPDF");
            const tableData = exportData.map(p => [p.title, p.code, p.segment, p.status.charAt(0).toUpperCase() + p.status.slice(1), p.requirements.length.toString(), format(new Date(p.created_at), 'MMM dd, yyyy')]);
            await createBrandedPDF({
                category: 'WORKFORCE',
                title: 'Positions Export',
                head: [['TITLE', 'CODE', 'SEGMENT', 'STATUS', 'REQUIREMENTS', 'CREATED']],
                body: tableData,
                filename: 'lab33-positions-export',
            });
            toast.success(`Exported ${exportData.length} position${exportData.length === 1 ? '' : 's'} to PDF`);
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<Position>[] = useMemo(() => [
        {
            key: 'title',
            label: 'Title',
            initialWidth: 220,
            primary: true,
            render: (p) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-medium)]">
                        <Briefcase size={14} className="text-[var(--accent-gold)]" />
                    </div>
                    <p className="text-[15px] text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-gold)] transition-colors truncate">{p.title}</p>
                </div>
            ),
        },
        {
            key: 'code',
            label: 'Code',
            initialWidth: 140,
            render: (p) => (
                <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[var(--text-secondary)]/40" />
                    <span className="text-[13px] text-[var(--text-secondary)] truncate font-mono">{p.code}</span>
                </div>
            ),
        },
        {
            key: 'segment',
            label: 'Segment',
            initialWidth: 180,
            render: (p) => (
                <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-medium truncate block">{p.segment || '—'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            initialWidth: 130,
            render: (p) => {
                const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.active;
                const StatusIcon = statusConfig.icon;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <StatusIcon size={12} className={statusConfig.color} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${statusConfig.color}`}>{statusConfig.label}</span>
                    </div>
                );
            },
        },
        {
            key: 'date',
            label: 'Created',
            initialWidth: 140,
            render: (p) => (
                <div className="space-y-0.5">
                    <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">{new Date(p.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            ),
        },
    ], []);

    const filterDrawerContent = (
        <div className="flex flex-col gap-8 w-full">
            {/* Time Period */}
            <FilterSection title="Time Period">
                <div className="grid grid-cols-5 gap-3">
                    {[
                        { value: '7d', label: '7D' },
                        { value: '30d', label: '30D' },
                        { value: '90d', label: '90D' },
                        { value: 'all', label: 'All' },
                    ].map((option) => (
                        <button key={option.value} type="button"
                            onClick={() => { setDateFilter(option.value as DateRangeFilter); handleClearCustomRange(); }}
                            className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors border ${dateFilter === option.value
                                ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                                : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                }`}>
                            {option.label}
                        </button>
                    ))}
                    <button type="button"
                        onClick={() => {
                            if (dateFilter === 'custom') { handleClearCustomRange(); }
                            else { setDateFilter('custom'); }
                        }}
                        className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${dateFilter === 'custom'
                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                            : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                            }`}>
                        <CalendarDays size={13} />
                        Custom
                    </button>
                </div>

                <AnimatePresence>
                    {dateFilter === 'custom' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">From</label>
                                        <DateTimePicker value={tempStart || null} onChange={setTempStart} dateOnly />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">To</label>
                                        <DateTimePicker value={tempEnd || null} onChange={setTempEnd} dateOnly />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <button type="button" onClick={handleApplyCustomRange} disabled={!tempStart || !tempEnd}
                                        className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-gold)]/20 hover:shadow-[var(--accent-gold)]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-colors">
                                        Apply Range
                                    </button>
                                    {customDateRange.start && customDateRange.end && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[var(--accent-gold)] font-medium italic">
                                                {customDateRange.start} — {customDateRange.end}
                                            </span>
                                            <button type="button" onClick={handleClearCustomRange}
                                                className="text-[11px] font-bold uppercase tracking-wider text-rose-500/60 hover:text-rose-400 transition-colors">
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </FilterSection>
            {/* Status */}
            <FilterSection title="Status" columns={3}>
                {[{ id: 'active', label: 'Active', icon: CheckCircle }, { id: 'draft', label: 'Draft', icon: Clock }, { id: 'archived', label: 'Archived', icon: Archive }].map((s) => (
                    <FilterPill
                        key={s.id}
                        label={s.label}
                        icon={s.icon}
                        isSelected={statusFilter.includes(s.id)}
                        onClick={() => setStatusFilter(prev => statusFilter.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                    />
                ))}
            </FilterSection>
        </div>
    );

    if (isLoading && positions.length === 0) {
        return (
            <PermissionGate resource="applications" action="read">
                <AdminLoader page title="Positions" subtitle="Loading open positions..." />
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="applications" action="read">
            <div className="w-full flex flex-col flex-1 min-h-0">
                <AdminListView<Position>
                    headerLabel="Workforce"
                    title="Positions"
                    data={filteredPositions}
                    isLoading={isLoading}
                    columns={columns}
                    getRowId={(p) => p.id}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search positions..."
                    sortOptions={SORT_OPTIONS}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortFieldChange={(f) => setSortField(f as SortField)}
                    onSortDirectionChange={(d) => setSortDirection(d as SortDirection)}
                    defaultSortField="created_at"
                    defaultSortDirection="desc"
                    filterDrawerContent={filterDrawerContent}
                    activeFilterCount={activeFilterCount}
                    onClearFilters={() => { setDateFilter('all'); setStatusFilter([]); }}
                    filterDrawerTitle="Filter Positions"
                    onExportPDF={canExport ? exportToPDF : undefined}
                    onAdd={canCreate ? () => openEditDrawer() : undefined}
                    addTooltip="Add Position"
                    onRowClick={(p) => openViewDrawer(p)}
                    renderRowActions={(p) => (
                        <div className="flex items-center gap-1">
                            <button title="View" onClick={(e) => { e.stopPropagation(); openViewDrawer(p); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"><Eye size={14} /></button>
                            {canUpdate && (
                                <button title="Edit" onClick={(e) => { e.stopPropagation(); openEditDrawer(p); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"><Pencil size={14} /></button>
                            )}
                            {canDelete && (
                                <button title="Delete" onClick={(e) => { e.stopPropagation(); openDeleteModal(p.id); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
                            )}
                        </div>
                    )}
                    actionsWidth={140}
                    enableSelection={true}
                    selectedRows={selectedRows}
                    onSelectedRowsChange={setSelectedRows}
                    onDeleteSelected={canDelete ? (ids) => openBulkDeleteModal(ids) : undefined}
                    emptyIcon={<Briefcase size={36} className="text-[var(--text-secondary)]/20" />}
                    emptyTitle="No Positions Found"
                    emptyDescription="Create your first position to get started"
                    itemsPerPage={10}
                />



                {/* Add/Edit Drawer */}
                <AdminDrawer
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    subtitle={posViewMode ? 'Position Details' : editingPosition ? 'Edit Position' : 'New Position'}
                    title={editingPosition ? formData.title || 'Untitled' : 'Create Position'}
                    onSave={savePosition}
                    saveLabel={editingPosition ? 'Update' : 'Create'}
                    isSaving={isSaving}
                    preventCloseWhileSaving={false}
                    width="680px"
                    viewMode={posViewMode}
                    onEditClick={editingPosition && canUpdate ? () => setPosViewMode(false) : undefined}
                    onDeleteClick={editingPosition && canDelete ? () => openDeleteModal(editingPosition.id) : undefined}
                >
                    {[
                        { label: 'Position Title', key: 'title', placeholder: 'e.g. RECOVERY COACH', required: true },
                        { label: 'Position Code', key: 'code', placeholder: 'e.g. L33-BIO-RC', required: true },
                        { label: 'Segment', key: 'segment', placeholder: 'e.g. BIOCHEMICAL PERFORMANCE' },
                        { label: 'Contact Email', key: 'contact_email', placeholder: 'admin@thelab33recovery.com' },
                    ].map(field => {
                        const value = formData[field.key as keyof typeof formData].toString().trim();
                        const showError = attemptedSave && field.required && !value;
                        return (
                            <div key={field.key}>
                                <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />{field.label}</label>
                                <input type="text" value={formData[field.key as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} readOnly={posViewMode} disabled={posViewMode}
                                    className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)] placeholder:text-[var(--text-muted)] ${posViewMode ? 'opacity-80 cursor-default' : ''} ${showError ? 'border-red-500/50' : 'border-[var(--border-medium)]'}`} />
                                {showError && (
                                    <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                        <span className="text-[11px] text-red-400/90 font-medium tracking-wide">{field.label} is required</span>
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    <div>
                        <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Position description..." readOnly={posViewMode} disabled={posViewMode}
                            className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)] placeholder:text-[var(--text-muted)] resize-none ${posViewMode ? 'opacity-80 cursor-default' : ''}`} />
                    </div>
                    <div>
                        <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Requirements (one per line)</label>
                        <textarea value={formData.requirements} onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))} rows={5} placeholder={"Background in recovery\nExperience guiding clients..."} readOnly={posViewMode} disabled={posViewMode}
                            className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)] placeholder:text-[var(--text-muted)] resize-none ${posViewMode ? 'opacity-80 cursor-default' : ''}`} />
                    </div>
                    <div>
                        <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Status</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['active', 'draft', 'archived'] as const).map(s => {
                                const cfg = STATUS_CONFIG[s]; const SIcon = cfg.icon;
                                return (<button key={s} type="button" disabled={posViewMode} onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors border ${posViewMode ? 'cursor-default' : ''} ${formData.status === s ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[#C4A265] text-[#0F0E0D] border-[var(--accent-gold)]' : 'bg-[var(--surface-high)]/60 border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--surface-high)]'}`}>
                                    <SIcon size={14} />{cfg.label}</button>);
                            })}
                        </div>
                    </div>
                </AdminDrawer>

                <DeleteModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteId(null); setBulkDeleteIds([]); }} onConfirm={confirmDelete} isDeleting={isDeleting} title={bulkDeleteIds.length > 0 ? `Delete ${bulkDeleteIds.length} Position${bulkDeleteIds.length === 1 ? '' : 's'}` : 'Delete Position'} description={bulkDeleteIds.length > 0 ? `Are you sure you want to delete ${bulkDeleteIds.length} selected position${bulkDeleteIds.length === 1 ? '' : 's'}? This action cannot be undone.` : 'Are you sure you want to delete this position? This action cannot be undone.'} />

                {/* Export Loading Overlay */}
                <ExportOverlay isVisible={isExporting} title="Generating PDF" subtitle="Preparing positions export…" />
            </div>
        </PermissionGate>
    );
}
