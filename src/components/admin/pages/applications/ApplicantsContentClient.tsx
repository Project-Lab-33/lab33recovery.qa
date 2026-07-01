"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Users, Trash2, Eye, Pencil, FileText, Download,
    CheckCircle, Clock, Archive, Type, CalendarDays, Briefcase,
    XCircle, Star, Search, List, LayoutGrid, CheckCircle2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SlidersHorizontal, Share2, RefreshCcw, X, UserPlus, Plus,
} from "lucide-react";
import { useAdminUser, usePermission } from "@/hooks/useAdminUser";
import { createClient } from "@/lib/supabase/client";
import {
    format, startOfDay, endOfDay, startOfMonth, endOfMonth,
    subMonths, subYears, startOfWeek, endOfWeek, isWithinInterval,
} from "date-fns";
import { toast } from "sonner";
import { DeleteModal } from "@/components/admin/shared/DeleteModal";
import { AdminListView, type Column, type SortOption } from "@/components/admin/shared/AdminListView";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { PersonDetailDrawer, type PersonData } from "@/components/admin/shared/PersonDetailDrawer";
import { PersonEditDrawer, type StatusConfig } from "@/components/admin/shared/PersonEditDrawer";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import { ViewToggle } from "@/components/admin/shared/ViewToggle";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import { ExportOverlay, PermissionGate, AdminLoader } from "@/components/admin/shared";
import { GenderIcon } from "@/components/admin/shared/GenderIcon";
import { getCountryByName, formatNationality, calculateAge } from "@/components/admin/shared/utils/helpers";
import { ApplicationsCardView, ApplicationsApprovalView } from "./views";
import type { Applicant, ApplicantStatus, DateRangeFilter, SortField, SortDirection } from "./types";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
    reviewed: { icon: Search, color: 'text-blue-400', label: 'Reviewed' },
    shortlisted: { icon: CheckCircle, color: 'text-emerald-400', label: 'Shortlisted' },
    rejected: { icon: XCircle, color: 'text-rose-400', label: 'Rejected' },
    archived: { icon: Archive, color: 'text-zinc-400', label: 'Archived' },
    hired: { icon: Star, color: 'text-[var(--accent-gold)]', label: 'Hired' },
};

const STATUS_CONFIGS_LIST: StatusConfig[] = [
    { value: 'pending', ...STATUS_CONFIG.pending },
    { value: 'reviewed', ...STATUS_CONFIG.reviewed },
    { value: 'shortlisted', ...STATUS_CONFIG.shortlisted },
    { value: 'hired', ...STATUS_CONFIG.hired },
    { value: 'rejected', ...STATUS_CONFIG.rejected },
    { value: 'archived', ...STATUS_CONFIG.archived },
];

const SORT_OPTIONS: SortOption[] = [
    { field: 'first_name', label: 'Name', icon: Type, defaultDirection: 'asc' },
    { field: 'created_at', label: 'Date Applied', icon: CalendarDays, defaultDirection: 'desc' },
    { field: 'position_title', label: 'Position', icon: Briefcase, defaultDirection: 'asc' },
    { field: 'status', label: 'Status', icon: CheckCircle2, defaultDirection: 'asc' },
];

const STATUS_ORDER = ['pending', 'reviewed', 'shortlisted', 'hired', 'rejected', 'archived'];

type LayoutView = 'list' | 'cards' | 'approval';

const VIEW_OPTIONS: { view: LayoutView; icon: typeof List; label: string }[] = [
    { view: 'list', icon: List, label: 'List' },
    { view: 'cards', icon: LayoutGrid, label: 'Cards' },
    { view: 'approval', icon: CheckCircle2, label: 'Pipeline' },
];

export default function ApplicantsContentClient() {
    const supabase = useMemo(() => createClient(), []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user: currentUser } = useAdminUser();
    const canCreate = usePermission('applications', 'create');
    const canUpdate = usePermission('applications', 'update');
    const canDelete = usePermission('applications', 'delete');
    const canExport = usePermission('applications', 'export');

    // Data
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Layout
    const [layoutView, setLayoutView] = useState<LayoutView>('list');

    // Filters
    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
    const [customDateRange, setCustomDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [positionFilter, setPositionFilter] = useState<string[]>([]);
    const [genderFilter, setGenderFilter] = useState<string[]>([]);

    // Custom date states
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

    // Drawer — view / edit / create mode
    type DrawerMode = 'view' | 'edit' | 'create' | null;
    const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
    const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
    const [editForm, setEditForm] = useState<{
        first_name: string; last_name: string; email: string; phone: string; gender: string;
        status: ApplicantStatus; nationality: string; linkedin_url: string; birthdate: string; notes: string;
    }>({ first_name: '', last_name: '', email: '', phone: '', gender: '', status: 'pending', nationality: '', linkedin_url: '', birthdate: '', notes: '' });
    const [editSaving, setEditSaving] = useState(false);

    // Edit-mode document state
    const [editCvFile, setEditCvFile] = useState<File | null>(null);
    const [editCoverLetterFile, setEditCoverLetterFile] = useState<File | null>(null);
    const [editDeleteCv, setEditDeleteCv] = useState(false);
    const [editDeleteCoverLetter, setEditDeleteCoverLetter] = useState(false);

    // Create form state
    const [createForm, setCreateForm] = useState({
        first_name: '', last_name: '', email: '', phone: '', gender: '', position_title: '',
        status: 'pending' as ApplicantStatus, nationality: '', linkedin_url: '', birthdate: '', notes: '',
    });
    const [createSaving, setCreateSaving] = useState(false);
    const [createAttempted, setCreateAttempted] = useState(false);
    const [positions, setPositions] = useState<string[]>([]);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

    const [personDrawerOpen, setPersonDrawerOpen] = useState(false);
    const isEditMode = drawerMode === 'edit';
    const isCreateMode = drawerMode === 'create';

    const fetchApplicants = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from("job_applications").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setApplicants(data || []);
        } catch (err) { console.error("Error fetching applicants:", err); toast.error("Failed to load applicants"); }
        finally { setIsLoading(false); }
    }, [supabase]);

    const fetchPositions = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('positions').select('title').order('title', { ascending: true });
            if (error) throw error;
            setPositions((data || []).map(p => p.title));
        } catch (err) { console.error('Error fetching positions:', err); }
    }, [supabase]);

    useEffect(() => {
        fetchApplicants();
        fetchPositions();
        const channel = supabase.channel('job_applications_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => fetchApplicants()).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchApplicants, fetchPositions, supabase]);

    const updateStatus = useCallback(async (id: string, newStatus: ApplicantStatus) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const oldApplicant = applicants.find(a => a.id === id);
            const { error } = await supabase.from("job_applications").update({ status: newStatus }).eq("id", id);
            if (error) throw error;
            setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        } catch (err) { console.error("Error updating status:", err); toast.error("Failed to update status"); }
    }, [supabase, applicants]);

    const updateApplicant = async () => {
        if (!viewingApplicant) return;
        if (!editForm.first_name.trim() || !editForm.last_name.trim() || !editForm.email.trim()) {
            toast.error('First name, last name, and email are required');
            return;
        }
        setEditSaving(true);
        try {
            const timestamp = Date.now();
            const sanitizedName = `${editForm.first_name.trim()}_${editForm.last_name.trim()}`.replace(/\s+/g, '_');
            const sanitizedPosition = viewingApplicant.position_title.replace(/\s+/g, '_');

            let newCvPath = viewingApplicant.cv_filename;
            let newCoverLetterPath = viewingApplicant.cover_letter_filename ?? null;
            const pathsToRemove: string[] = [];

            // Handle CV: delete existing if flagged or replaced
            if (editDeleteCv || editCvFile) {
                if (viewingApplicant.cv_filename) pathsToRemove.push(viewingApplicant.cv_filename);
                newCvPath = null;
            }
            // Upload new CV
            if (editCvFile) {
                const ext = editCvFile.name.split('.').pop();
                const path = `${sanitizedPosition}/${sanitizedName}_CV_${timestamp}.${ext}`;
                const { data, error: uploadError } = await supabase.storage.from('job-documents').upload(path, editCvFile, { upsert: true });
                if (uploadError) throw new Error(`CV upload failed: ${uploadError.message}`);
                newCvPath = data?.path || null;
            }

            // Handle Cover Letter: delete existing if flagged or replaced
            if (editDeleteCoverLetter || editCoverLetterFile) {
                if (viewingApplicant.cover_letter_filename) pathsToRemove.push(viewingApplicant.cover_letter_filename);
                newCoverLetterPath = null;
            }
            // Upload new Cover Letter
            if (editCoverLetterFile) {
                const ext = editCoverLetterFile.name.split('.').pop();
                const path = `${sanitizedPosition}/${sanitizedName}_CL_${timestamp}.${ext}`;
                const { data, error: uploadError } = await supabase.storage.from('job-documents').upload(path, editCoverLetterFile, { upsert: true });
                if (uploadError) console.error('Cover letter upload error:', uploadError.message);
                newCoverLetterPath = data?.path || null;
            }

            // Remove old files from storage (best-effort)
            if (pathsToRemove.length > 0) {
                await supabase.storage.from('job-documents').remove(pathsToRemove).catch(() => { });
            }

            const updates: Record<string, unknown> = {
                first_name: editForm.first_name.trim(),
                last_name: editForm.last_name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone,
                gender: editForm.gender || null,
                status: editForm.status,
                nationality: editForm.nationality.trim() || null,
                linkedin_url: editForm.linkedin_url.trim() || null,
                birthdate: editForm.birthdate || null,
                notes: editForm.notes.trim() || null,
                cv_filename: newCvPath,
                cover_letter_filename: newCoverLetterPath,
            };
            const { error } = await supabase.from("job_applications").update(updates).eq("id", viewingApplicant.id);
            if (error) throw error;
            setApplicants(prev => prev.map(a => a.id === viewingApplicant.id ? { ...a, ...updates } as Applicant : a));
            setViewingApplicant(prev => prev ? { ...prev, ...updates } as Applicant : prev);
            toast.success('Applicant updated');
            setDrawerMode('view');
        } catch (err) { console.error('Error updating applicant:', err); toast.error('Failed to update applicant'); }
        finally { setEditSaving(false); }
    };

    const confirmDelete = async () => {
        if (bulkDeleteIds.length > 0) {
            await bulkDelete(bulkDeleteIds);
            setDeleteModalOpen(false);
            setBulkDeleteIds([]);
            return;
        }
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            // Collect storage paths to clean up
            const target = applicants.find(a => a.id === deleteId);
            const storagePaths: string[] = [];
            if (target?.cv_filename) storagePaths.push(target.cv_filename);
            if (target?.cover_letter_filename) storagePaths.push(target.cover_letter_filename);

            const { error } = await supabase.from("job_applications").delete().eq("id", deleteId);
            if (error) throw error;

            // Clean up storage files (best-effort)
            if (storagePaths.length > 0) {
                await supabase.storage.from('job-documents').remove(storagePaths).catch(() => { });
            }

            setApplicants(prev => prev.filter(a => a.id !== deleteId));
            toast.success("Applicant deleted");
        } catch (err) { console.error("Error deleting:", err); toast.error("Failed to delete applicant"); }
        finally { setIsDeleting(false); setDeleteModalOpen(false); setDeleteId(null); }
    };

    const openDeleteModal = useCallback((id: string) => { setDeleteId(id); setBulkDeleteIds([]); setDeleteModalOpen(true); }, []);
    const openBulkDeleteModal = useCallback((ids: string[]) => { setBulkDeleteIds(ids); setDeleteId(null); setDeleteModalOpen(true); }, []);

    const bulkDelete = async (ids: string[]) => {
        if (ids.length === 0) return;
        setIsDeleting(true);
        try {
            // Collect storage paths to clean up
            const toDelete = applicants.filter(a => ids.includes(a.id));
            const storagePaths: string[] = [];
            toDelete.forEach(a => {
                if (a.cv_filename) storagePaths.push(a.cv_filename);
                if (a.cover_letter_filename) storagePaths.push(a.cover_letter_filename);
            });

            // Delete DB rows
            const { error } = await supabase.from('job_applications').delete().in('id', ids);
            if (error) throw error;

            // Clean up storage files (best-effort)
            if (storagePaths.length > 0) {
                await supabase.storage.from('job-documents').remove(storagePaths).catch(() => { });
            }

            setApplicants(prev => prev.filter(a => !ids.includes(a.id)));
            setSelectedRows([]);
            toast.success(`${ids.length} applicant${ids.length === 1 ? '' : 's'} deleted`);
        } catch (err) {
            console.error('Bulk delete error:', err);
            toast.error('Failed to delete applicants');
        } finally {
            setIsDeleting(false);
        }
    };

    const createApplicant = async () => {
        setCreateAttempted(true);
        if (!createForm.first_name.trim() || !createForm.last_name.trim() || !createForm.email.trim() || !createForm.position_title) {
            toast.error('First name, last name, email, and position are required');
            return;
        }
        setCreateSaving(true);
        try {
            const timestamp = Date.now();
            const sanitizedName = `${createForm.first_name.trim()}_${createForm.last_name.trim()}`.replace(/\s+/g, '_');
            const sanitizedPosition = createForm.position_title.replace(/\s+/g, '_');

            // Upload CV
            let cvPath: string | null = null;
            if (cvFile) {
                const ext = cvFile.name.split('.').pop();
                const path = `${sanitizedPosition}/${sanitizedName}_CV_${timestamp}.${ext}`;
                const { data, error: uploadError } = await supabase.storage.from('job-documents').upload(path, cvFile, { upsert: true });
                if (uploadError) throw new Error(`CV upload failed: ${uploadError.message}`);
                cvPath = data?.path || null;
            }

            // Upload Cover Letter
            let coverPath: string | null = null;
            if (coverLetterFile) {
                const ext = coverLetterFile.name.split('.').pop();
                const path = `${sanitizedPosition}/${sanitizedName}_CL_${timestamp}.${ext}`;
                const { data, error: uploadError } = await supabase.storage.from('job-documents').upload(path, coverLetterFile, { upsert: true });
                if (uploadError) console.error('Cover letter upload error:', uploadError.message);
                coverPath = data?.path || null;
            }

            const newApp = {
                first_name: createForm.first_name.trim(),
                last_name: createForm.last_name.trim(),
                email: createForm.email.trim(),
                phone: createForm.phone,
                gender: createForm.gender || null,
                position_title: createForm.position_title,
                status: createForm.status,
                nationality: createForm.nationality.trim() || null,
                linkedin_url: createForm.linkedin_url.trim() || null,
                birthdate: createForm.birthdate || null,
                notes: createForm.notes.trim() || null,
                cv_filename: cvPath,
                cover_letter_filename: coverPath,
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { data: inserted, error } = await supabase.from('job_applications').insert(newApp).select('id').single();
            if (error) throw error;
            toast.success('Applicant added successfully');
            closeDrawer();
        } catch (err) { console.error('Error creating applicant:', err); toast.error('Failed to add applicant'); }
        finally { setCreateSaving(false); }
    };

    const populateEditForm = (applicant: Applicant) => {
        setEditForm({
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            email: applicant.email,
            phone: applicant.phone || '',
            gender: applicant.gender || '',
            status: applicant.status,
            nationality: applicant.nationality || '',
            linkedin_url: applicant.linkedin_url || '',
            birthdate: applicant.birthdate || '',
            notes: applicant.notes || '',
        });
    };

    const openViewDrawer = useCallback((applicant: Applicant) => {
        setViewingApplicant(applicant);
        populateEditForm(applicant);
        setPersonDrawerOpen(true);
    }, []);

    // Deep-link: auto-open drawer from notification
    const searchParams = useSearchParams();
    const highlightHandled = useRef(false);
    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (highlightId && !isLoading && applicants.length > 0 && !highlightHandled.current) {
            const target = applicants.find(a => a.id === highlightId);
            if (target) {
                openViewDrawer(target);
                highlightHandled.current = true;
            }
        }
    }, [searchParams, applicants, isLoading, openViewDrawer]);

    const openEditDrawer = (applicant: Applicant) => {
        setViewingApplicant(applicant);
        populateEditForm(applicant);
        setEditCvFile(null);
        setEditCoverLetterFile(null);
        setEditDeleteCv(false);
        setEditDeleteCoverLetter(false);
        setDrawerMode('edit');
    };

    const openCreateDrawer = () => {
        setViewingApplicant(null);
        setCreateForm({ first_name: '', last_name: '', email: '', phone: '', gender: '', position_title: '', status: 'pending', nationality: '', linkedin_url: '', birthdate: '', notes: '' });
        setCreateAttempted(false);
        setCvFile(null);
        setCoverLetterFile(null);
        setDrawerMode('create');
    };

    const closeDrawer = () => {
        setDrawerMode(null);
        setViewingApplicant(null);
    };

    const uniquePositions = useMemo(() => [...new Set(applicants.map(a => a.position_title))].sort(), [applicants]);

    const filteredApplicants = useMemo(() => {
        let filtered = applicants.filter(a =>
            `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.position_title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (statusFilter.length > 0) filtered = filtered.filter(a => statusFilter.includes(a.status));
        if (positionFilter.length > 0) filtered = filtered.filter(a => positionFilter.includes(a.position_title));
        if (genderFilter.length > 0) filtered = filtered.filter(a => a.gender && genderFilter.includes(a.gender));

        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate: Date, endDate: Date = endOfDay(now);
            switch (dateFilter) {
                case 'today': startDate = startOfDay(now); break;
                case 'week': startDate = startOfWeek(now); endDate = endOfWeek(now); break;
                case 'month': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
                case 'lastMonth': { const lm = subMonths(now, 1); startDate = startOfMonth(lm); endDate = endOfMonth(lm); break; }
                case 'lastYear': { const ly = subYears(now, 1); startDate = startOfDay(new Date(ly.getFullYear(), 0, 1)); endDate = endOfDay(new Date(ly.getFullYear(), 11, 31)); break; }
                case 'custom':
                    if (customDateRange.start && customDateRange.end) { startDate = startOfDay(new Date(customDateRange.start)); endDate = endOfDay(new Date(customDateRange.end)); }
                    else return filtered;
                    break;
                default: return filtered;
            }
            filtered = filtered.filter(a => isWithinInterval(new Date(a.created_at), { start: startDate!, end: endDate }));
        }

        filtered.sort((a, b) => {
            const dir = sortDirection === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'first_name': return dir * `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
                case 'created_at': return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                case 'position_title': return dir * a.position_title.localeCompare(b.position_title);
                case 'status': return dir * (STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
                default: return 0;
            }
        });
        return filtered;
    }, [applicants, searchQuery, dateFilter, customDateRange, statusFilter, positionFilter, genderFilter, sortField, sortDirection]);

    const activeFilterCount = (dateFilter !== 'all' ? 1 : 0) + statusFilter.length + positionFilter.length + genderFilter.length;

    const [isExporting, setIsExporting] = useState(false);
    const exportToPDF = async () => {
        const exportData = selectedRows.length > 0 ? filteredApplicants.filter(a => selectedRows.includes(a.id)) : filteredApplicants;
        if (exportData.length === 0) { toast.error("No data to export"); return; }
        setIsExporting(true);
        try {
            const { createBrandedPDF } = await import("@/components/admin/shared/utils/exportPDF");
            const tableData = exportData.map(a => [`${a.first_name} ${a.last_name}`, a.gender ? a.gender.charAt(0).toUpperCase() + a.gender.slice(1) : '—', a.position_title, a.email, a.nationality || '—', a.birthdate ? `${calculateAge(a.birthdate)}` : '—', a.status.charAt(0).toUpperCase() + a.status.slice(1)]);
            await createBrandedPDF({
                category: 'TALENT PIPELINE',
                title: 'Applications Export',
                head: [['NAME', 'GENDER', 'POSITION', 'EMAIL', 'NATIONALITY', 'AGE', 'STATUS']],
                body: tableData,
                filename: 'lab33-applicants-export',
            });
            toast.success(`Exported ${exportData.length} applicant${exportData.length === 1 ? '' : 's'} to PDF`);
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<Applicant>[] = useMemo(() => [
        {
            key: 'name',
            label: 'Full Name',
            initialWidth: 220,
            primary: true,
            render: (a) => (
                <div className="flex items-center gap-2.5">
                    <GenderIcon gender={a.gender || ''} />
                    <p className="text-[15px] text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-gold)] transition-colors truncate">
                        {a.first_name} {a.last_name}
                    </p>
                </div>
            ),
        },
        {
            key: 'position',
            label: 'Position',
            initialWidth: 160,
            render: (a) => (
                <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-[var(--text-secondary)]/40" />
                    <span className="text-[13px] text-[var(--text-secondary)] truncate">{a.position_title}</span>
                </div>
            ),
        },
        {
            key: 'nationality',
            label: 'Nationality',
            initialWidth: 140,
            render: (a) => {
                const country = a.nationality ? getCountryByName(a.nationality) : null;
                return (
                    <div className="flex items-center gap-2">
                        {country && <Image src={country.flag} alt="" width={20} height={14} className="w-5 h-3.5 object-cover rounded-sm border border-[var(--border-subtle)]" />}
                        <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-medium truncate">{a.nationality ? formatNationality(a.nationality) : '—'}</span>
                    </div>
                );
            },
        },
        {
            key: 'dob',
            label: 'DOB / Age',
            initialWidth: 120,
            render: (a) => (
                <div className="space-y-0.5">
                    <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">
                        {a.birthdate ? format(new Date(a.birthdate), 'MMM d, yyyy') : '—'}
                    </p>
                    {a.birthdate && (
                        <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">{calculateAge(a.birthdate)} yrs old</p>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            initialWidth: 130,
            render: (a) => {
                const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
                const SIcon = sc.icon;
                return (
                    <div className="inline-flex items-center gap-1.5">
                        <SIcon size={12} className={sc.color} />
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${sc.color}`}>{sc.label}</span>
                    </div>
                );
            },
        },
        {
            key: 'docs',
            label: 'Docs',
            initialWidth: 90,
            render: (a) => (
                <div className="flex items-center gap-1.5">
                    {a.cv_filename ? (
                        <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-documents/${a.cv_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="View CV"
                            className="flex items-center gap-1 h-7 px-2 rounded-lg bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)]/10 hover:border-[var(--accent-gold)]/30 transition-colors"
                        >
                            <FileText size={12} className="text-[var(--accent-gold)]" />
                            <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-wider">CV</span>
                        </a>
                    ) : (
                        <span className="text-[10px] text-[var(--text-secondary)]/20 uppercase tracking-wider">—</span>
                    )}
                    {a.cover_letter_filename && (
                        <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-documents/${a.cover_letter_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="View Cover Letter"
                            className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)]/10 hover:border-[var(--accent-gold)]/30 transition-colors"
                        >
                            <FileText size={12} className="text-[var(--accent-gold)]/60" />
                        </a>
                    )}
                </div>
            ),
        },
        {
            key: 'date',
            label: 'Applied',
            initialWidth: 140,
            render: (a) => (
                <div className="space-y-0.5">
                    <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">{new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            ),
        },
    ], []);

    const filterDrawerContent = (
        <div className="flex flex-col gap-8 w-full">
            {/* Time Period */}
            <FilterSection title="Time Period">
                <div className="grid grid-cols-5 gap-3">
                    {[{ value: 'today', label: 'Today' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'all', label: 'All' }].map((option) => (
                        <button key={option.value} type="button"
                            onClick={() => { setDateFilter(option.value as DateRangeFilter); handleClearCustomRange(); }}
                            className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors border ${dateFilter === option.value
                                ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                                : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                }`}>{option.label}</button>
                    ))}
                    {/* Custom — 5th button in the grid */}
                    <button type="button"
                        onClick={() => {
                            if (dateFilter === 'custom') { handleClearCustomRange(); }
                            else { setDateFilter('custom' as DateRangeFilter); }
                        }}
                        className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${dateFilter === 'custom'
                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                            : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                            }`}>
                        <CalendarDays size={13} />
                        Custom
                    </button>
                </div>

                {/* Custom Date Range — revealed with animation */}
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
                                    <button type="button" onClick={handleApplyCustomRange}
                                        disabled={!tempStart || !tempEnd}
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
            {/* Status */}
            <FilterSection title="Status" columns={3}>
                {[{ id: 'pending', label: 'Pending', icon: Clock }, { id: 'reviewed', label: 'Reviewed', icon: Search }, { id: 'shortlisted', label: 'Shortlisted', icon: CheckCircle }, { id: 'rejected', label: 'Rejected', icon: XCircle }, { id: 'archived', label: 'Archived', icon: Archive }, { id: 'hired', label: 'Hired', icon: Star }].map((s) => (
                    <FilterPill
                        key={s.id}
                        label={s.label}
                        icon={s.icon}
                        isSelected={statusFilter.includes(s.id)}
                        onClick={() => setStatusFilter(prev => statusFilter.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                    />
                ))}
            </FilterSection>
            {/* Position */}
            <FilterSection title="Position" columns={2}>
                {uniquePositions.map((pos) => (
                    <FilterPill
                        key={pos}
                        label={pos}
                        icon={Briefcase}
                        isSelected={positionFilter.includes(pos)}
                        onClick={() => setPositionFilter(prev => positionFilter.includes(pos) ? prev.filter(x => x !== pos) : [...prev, pos])}
                    />
                ))}
            </FilterSection>
        </div>
    );

    const viewToggle = (
        <ViewToggle<LayoutView>
            options={VIEW_OPTIONS}
            activeView={layoutView}
            onViewChange={(v) => { setLayoutView(v); }}
        />
    );

    if (isLoading && applicants.length === 0) {
        return (
            <PermissionGate resource="applications" action="read">
                <AdminLoader page title="Talent Pipeline" subtitle="Retrieving candidate records from secure storage..." />
            </PermissionGate>
        );
    }

    return (
        <PermissionGate resource="applications" action="read">
            <div className="w-full flex flex-col pt-0 flex-1 min-h-0">
                {layoutView === 'list' ? (
                    <AdminListView<Applicant>
                        headerLabel="Talent Pipeline"
                        title="Applicants"
                        data={filteredApplicants}
                        isLoading={isLoading}
                        columns={columns}
                        getRowId={(a) => a.id}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="Search applicants..."
                        sortOptions={SORT_OPTIONS}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSortFieldChange={(f) => setSortField(f as SortField)}
                        onSortDirectionChange={(d) => setSortDirection(d as SortDirection)}
                        defaultSortField="created_at"
                        defaultSortDirection="desc"
                        filterDrawerContent={filterDrawerContent}
                        activeFilterCount={activeFilterCount}
                        onClearFilters={() => { setDateFilter('all'); setStatusFilter([]); setPositionFilter([]); handleClearCustomRange(); }}
                        filterDrawerTitle="Filter Applicants"
                        viewToggle={viewToggle}
                        onExportPDF={exportToPDF}
                        onRowClick={(a) => openViewDrawer(a)}
                        renderRowActions={(a) => (
                            <>
                                <button title="View" onClick={(e) => { e.stopPropagation(); openViewDrawer(a); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"><Eye size={14} /></button>
                                {a.cv_filename && (
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-documents/${a.cv_filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        title="View CV"
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                                    >
                                        <FileText size={14} />
                                    </a>
                                )}
                                {canUpdate && (
                                    <button title="Edit" onClick={(e) => { e.stopPropagation(); openEditDrawer(a); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"><Pencil size={14} /></button>
                                )}
                                {canDelete && (
                                    <button title="Delete" onClick={(e) => { e.stopPropagation(); openDeleteModal(a.id); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
                                )}
                            </>
                        )}
                        actionsWidth={160}
                        enableSelection={true}
                        selectedRows={selectedRows}
                        onSelectedRowsChange={setSelectedRows}
                        onDeleteSelected={canDelete ? (ids) => openBulkDeleteModal(ids) : undefined}
                        onAdd={canCreate ? openCreateDrawer : undefined}
                        addTooltip="Add Applicant"
                        emptyIcon={<Users size={36} className="text-[var(--text-secondary)]/20" />}
                        emptyTitle="No Applicants Found"
                        emptyDescription="Applications will appear here"
                        itemsPerPage={10}
                    />
                ) : (
                    <>
                        {/* Header — same level as content, matching Marketing Hub pattern */}
                        <NonListHeader
                            count={filteredApplicants.length}
                            layoutView={layoutView}
                            setLayoutView={setLayoutView}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            activeFilterCount={activeFilterCount}
                            onOpenFilters={() => setFiltersDrawerOpen(true)}
                            onExport={canExport ? exportToPDF : undefined}
                            onRefresh={fetchApplicants}
                            isLoading={isLoading}
                            viewToggle={viewToggle}
                            onAdd={canCreate ? openCreateDrawer : undefined}
                        />


                        {/* Content wrapper */}
                        <div className="flex-1 min-h-0 flex flex-col mt-10 overflow-hidden">
                            {layoutView === 'cards' ? (
                                <ApplicationsCardView applicants={filteredApplicants} onView={openViewDrawer} onStatusChange={updateStatus} onDelete={openDeleteModal} isLoading={isLoading} canDelete={canDelete} canUpdate={canUpdate} />
                            ) : (
                                <ApplicationsApprovalView applicants={filteredApplicants} onView={openViewDrawer} onStatusChange={updateStatus} onDelete={openDeleteModal} canDelete={canDelete} canUpdate={canUpdate} />
                            )}
                        </div>

                        {/* Filter Drawer (for non-list modes) */}
                        <AdminDrawer
                            isOpen={filtersDrawerOpen}
                            onClose={() => setFiltersDrawerOpen(false)}
                            subtitle={`${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''} applied`}
                            title="Filter Applicants"
                            width="680px"
                            footer={
                                <div className="px-8 py-6 border-t border-[var(--border-strong)]/60 flex items-center justify-between shrink-0">
                                    <button type="button" onClick={() => { setDateFilter('all'); setStatusFilter([]); setPositionFilter([]); handleClearCustomRange(); }}
                                        className="h-12 px-7 rounded-2xl text-[13px] font-bold uppercase tracking-[0.12em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-colors">
                                        Clear All
                                    </button>
                                    <button type="button" onClick={() => setFiltersDrawerOpen(false)}
                                        className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[13px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-[var(--accent-gold)]/25 hover:shadow-[var(--accent-gold)]/45 hover:scale-[1.02] active:scale-[0.98] transition-colors">
                                        Apply Filters
                                    </button>
                                </div>
                            }
                            bodyClassName="space-y-8"
                        >
                            {filterDrawerContent}
                        </AdminDrawer>
                    </>
                )}

                {/* ── PersonDetailDrawer for view mode ── */}
                <PersonDetailDrawer
                    isOpen={personDrawerOpen && !!viewingApplicant}
                    onClose={() => { setPersonDrawerOpen(false); setViewingApplicant(null); }}
                    person={viewingApplicant as PersonData | null}
                    variant="applicant"
                    onEdit={viewingApplicant ? () => {
                        setPersonDrawerOpen(false);
                        if (viewingApplicant) openEditDrawer(viewingApplicant);
                    } : undefined}
                    onDelete={viewingApplicant ? () => {
                        setPersonDrawerOpen(false);
                        if (viewingApplicant) { openDeleteModal(viewingApplicant.id); }
                    } : undefined}
                />

                {/* ── PersonEditDrawer for CREATE mode ── */}
                {isCreateMode && (
                    <PersonEditDrawer
                        isOpen
                        onClose={closeDrawer}
                        mode="create"
                        variant="applicant"
                        form={createForm}
                        setForm={setCreateForm}
                        onSave={createApplicant}
                        isSaving={createSaving}
                        attempted={createAttempted}
                        statusConfigs={STATUS_CONFIGS_LIST}
                        positionOptions={{ positions }}
                        documents={{
                            cvFile, setCvFile,
                            coverLetterFile, setCoverLetterFile,
                        }}
                    />
                )}

                {/* ── PersonEditDrawer for EDIT mode ── */}
                {isEditMode && viewingApplicant && (
                    <PersonEditDrawer
                        isOpen
                        onClose={closeDrawer}
                        mode="edit"
                        variant="applicant"
                        form={editForm}
                        setForm={setEditForm}
                        onSave={updateApplicant}
                        isSaving={editSaving}
                        recordId={viewingApplicant.id}
                        recordCreatedAt={viewingApplicant.created_at}
                        statusConfigs={STATUS_CONFIGS_LIST}
                        documents={{
                            cvFile: editCvFile, setCvFile: setEditCvFile,
                            coverLetterFile: editCoverLetterFile, setCoverLetterFile: setEditCoverLetterFile,
                            existingCvFilename: viewingApplicant.cv_filename,
                            existingCoverLetterFilename: viewingApplicant.cover_letter_filename,
                            deleteCv: editDeleteCv, setDeleteCv: setEditDeleteCv,
                            deleteCoverLetter: editDeleteCoverLetter, setDeleteCoverLetter: setEditDeleteCoverLetter,
                        }}
                    />
                )}


                <DeleteModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteId(null); setBulkDeleteIds([]); }} onConfirm={confirmDelete} isDeleting={isDeleting} title={bulkDeleteIds.length > 0 ? `Delete ${bulkDeleteIds.length} Applicant${bulkDeleteIds.length === 1 ? '' : 's'}` : 'Delete Applicant'} description={bulkDeleteIds.length > 0 ? `Are you sure you want to delete ${bulkDeleteIds.length} selected applicant${bulkDeleteIds.length === 1 ? '' : 's'}? This action cannot be undone.` : 'Are you sure you want to delete this applicant? This action cannot be undone.'} />
                <ExportOverlay isVisible={isExporting} title="Generating PDF" subtitle="Preparing applicants export…" />
            </div>
        </PermissionGate>
    );
}

// Non-List Header (for Cards / Pipeline modes)
function NonListHeader({ count, searchQuery, setSearchQuery, activeFilterCount, onOpenFilters, onExport, onRefresh, isLoading, viewToggle, onAdd }: {
    count: number;
    layoutView: LayoutView;
    setLayoutView: (v: LayoutView) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    activeFilterCount: number;
    onOpenFilters: () => void;
    onExport?: () => void;
    onRefresh: () => void;
    isLoading: boolean;
    viewToggle?: React.ReactNode;
    onAdd?: () => void;
}) {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <span className="text-[var(--accent-gold)] text-[10px] uppercase tracking-[0.4em] font-bold">Talent Pipeline</span>
                </div>
                <div className="flex items-baseline gap-4">
                    <h1 className="text-4xl font-serif text-[var(--text-primary)]">Applicants</h1>
                    <span className="text-lg font-mono text-[var(--accent-gold)]/40">{count}</span>
                </div>
            </div>

            {/* Center: Expandable Search */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} transition={{ duration: 0.2 }} className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[var(--accent-gold)]/10 rounded-2xl blur-xl" />
                            <div className="relative flex items-center gap-2 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                <Search className="ml-4 text-[var(--accent-gold)]" size={18} />
                                <input type="text" placeholder="Search applicants..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="bg-transparent py-3.5 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none min-w-[320px]" />
                                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="mr-2 p-2 rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)] transition-colors"><X size={16} /></button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Center: View Toggle (absolutely positioned like Marketing Hub) */}
            {viewToggle && !searchOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
                    {viewToggle}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <button onClick={() => setSearchOpen(!searchOpen)} title="Search"
                    className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${searchOpen
                        ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                        : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"}`}>
                    <Search size={20} className="absolute inset-0 m-auto" />
                </button>
                {/* Filters */}
                <div className="relative">
                    <button onClick={onOpenFilters} title="Filters"
                        className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${activeFilterCount > 0
                            ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                            : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"}`}>
                        <SlidersHorizontal size={20} className="absolute inset-0 m-auto" />
                        {activeFilterCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-gold)] border-2 border-[var(--background)] flex items-center justify-center text-[9px] font-bold text-black">{activeFilterCount}</div>}
                    </button>
                </div>
                {/* Export */}
                {onExport && (
                    <button onClick={onExport} title="Export Data"
                        className="group relative w-12 h-12 rounded-2xl border transition-colors duration-200 bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5">
                        <Share2 size={20} className="absolute inset-0 m-auto" />
                    </button>
                )}
                {/* Refresh */}
                <button onClick={onRefresh} title="Refresh"
                    className="group relative w-12 h-12 rounded-2xl border transition-colors duration-200 bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5">
                    <RefreshCcw size={20} className={`absolute inset-0 m-auto ${!isLoading ? 'group-hover:rotate-180 transition-transform duration-500' : ''}`} />
                </button>
                {/* Add Button — gold circle */}
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="group relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] via-[var(--accent-gold)] to-[#B8860B] shadow-[0_4px_20px_rgba(212,175,119,0.25)] hover:shadow-[0_8px_32px_rgba(212,175,119,0.4)] hover:scale-105 active:scale-95 transition-colors duration-200"
                        title="Add Applicant"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-[var(--accent-gold)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                        <div className="absolute inset-[1px] rounded-[14px] bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                        <Plus size={22} strokeWidth={2.5} className="absolute inset-0 m-auto text-black" />
                    </button>
                )}
            </div>
        </div>
    );
}
