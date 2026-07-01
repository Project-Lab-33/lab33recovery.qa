"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscriber, SortField, SortDirection, SubscriberForm, DrawerMode } from "../types";
import { calculateAge } from "@/components/admin/shared/utils/helpers";

const itemsPerPage = 10;

export function useSubscribers() {
    const supabase = useMemo(() => createClient(), []);

    // Core data state
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Selection
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    // Sort
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Filters
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [nationalityFilter, setNationalityFilter] = useState<string[]>([]);
    const [ageRangeFilter, setAgeRangeFilter] = useState<string[]>([]);
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    // Drawer / CRUD
    const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
    const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
    const [addSaving, setAddSaving] = useState(false);
    const [addAttempted, setAddAttempted] = useState(false);
    const [addForm, setAddForm] = useState<SubscriberForm>({
        first_name: '', last_name: '', email: '', phone: '',
        gender: '', birthdate: '', nationality: ''
    });

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Derived
    const isViewMode = drawerMode === 'view';
    const isEditMode = drawerMode === 'edit';
    const isCreateMode = drawerMode === 'create';

    const fetchSubscribers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("waitlist")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSubscribers(data || []);
            setCurrentPage(1);
        } catch (err: unknown) {
            console.error("Error fetching subscribers:", err);
            setError("Failed to load subscribers. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel("waitlist_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "waitlist" },
                () => { fetchSubscribers(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchSubscribers]);

    const filteredSubscribers = useMemo(() => {
        // eslint-disable-next-line prefer-const
        let filtered = subscribers.filter(s => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesSearch = (
                    s.first_name?.toLowerCase().includes(q) ||
                    s.last_name?.toLowerCase().includes(q) ||
                    s.email?.toLowerCase().includes(q) ||
                    s.phone?.includes(q) ||
                    s.nationality?.toLowerCase().includes(q)
                );
                if (!matchesSearch) return false;
            }

            if (genderFilter.length > 0) {
                if (!genderFilter.includes(s.gender?.toLowerCase())) return false;
            }

            if (nationalityFilter.length > 0) {
                const natFormatted = s.nationality ? s.nationality.charAt(0).toUpperCase() + s.nationality.slice(1).toLowerCase() : '';
                if (!nationalityFilter.includes(natFormatted)) return false;
            }

            if (ageRangeFilter.length > 0) {
                const age = calculateAge(s.birthdate);
                if (age === null) return false;
                const matchesAge = ageRangeFilter.some(range => {
                    if (range === '18-24') return age >= 18 && age <= 24;
                    if (range === '25-34') return age >= 25 && age <= 34;
                    if (range === '35-44') return age >= 35 && age <= 44;
                    if (range === '45-54') return age >= 45 && age <= 54;
                    if (range === '55+') return age >= 55;
                    return false;
                });
                if (!matchesAge) return false;
            }

            if (dateFromFilter) {
                if (new Date(s.created_at) < new Date(dateFromFilter)) return false;
            }
            if (dateToFilter) {
                const toDate = new Date(dateToFilter);
                toDate.setHours(23, 59, 59, 999);
                if (new Date(s.created_at) > toDate) return false;
            }

            return true;
        });

        filtered.sort((a, b) => {
            const dir = sortDirection === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'first_name':
                    return dir * (`${a.first_name} ${a.last_name}`).localeCompare(`${b.first_name} ${b.last_name}`);
                case 'created_at':
                    return dir * (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                case 'nationality':
                    return dir * (a.nationality || '').localeCompare(b.nationality || '');
                case 'email':
                    return dir * (a.email || '').localeCompare(b.email || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [subscribers, searchQuery, sortField, sortDirection, genderFilter, nationalityFilter, ageRangeFilter, dateFromFilter, dateToFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / itemsPerPage));
    const paginatedSubscribers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSubscribers.slice(start, start + itemsPerPage);
    }, [filteredSubscribers, currentPage]);

    const resetAddForm = () => {
        setAddForm({ first_name: '', last_name: '', email: '', phone: '', gender: '', birthdate: '', nationality: '' });
        setAddAttempted(false);
    };

    const closeDrawer = () => {
        setDrawerMode(null);
        setSelectedSubscriber(null);
        resetAddForm();
    };

    const openViewDrawer = (subscriber: Subscriber) => {
        setSelectedSubscriber(subscriber);
        setAddForm({
            first_name: subscriber.first_name || '',
            last_name: subscriber.last_name || '',
            email: subscriber.email || '',
            phone: subscriber.phone || '',
            gender: subscriber.gender || '',
            birthdate: subscriber.birthdate || '',
            nationality: subscriber.nationality || '',
        });
        setAddAttempted(false);
        setDrawerMode('view');
    };

    const openEditDrawer = (subscriber: Subscriber) => {
        setSelectedSubscriber(subscriber);
        setAddForm({
            first_name: subscriber.first_name || '',
            last_name: subscriber.last_name || '',
            email: subscriber.email || '',
            phone: subscriber.phone || '',
            gender: subscriber.gender || '',
            birthdate: subscriber.birthdate || '',
            nationality: subscriber.nationality || '',
        });
        setAddAttempted(false);
        setDrawerMode('edit');
    };

    const openCreateDrawer = () => {
        setSelectedSubscriber(null);
        resetAddForm();
        setDrawerMode('create');
    };

    const handleAddSubmit = async () => {
        setAddAttempted(true);
        if (!addForm.first_name || !addForm.last_name || !addForm.email) return;
        setAddSaving(true);
        try {
            if (isEditMode && selectedSubscriber) {
                const { error } = await supabase.from('waitlist').update({
                    first_name: addForm.first_name,
                    last_name: addForm.last_name,
                    email: addForm.email,
                    phone: addForm.phone || null,
                    gender: addForm.gender || null,
                    birthdate: addForm.birthdate || null,
                    nationality: addForm.nationality || null,
                }).eq('id', selectedSubscriber.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('waitlist').insert({
                    first_name: addForm.first_name,
                    last_name: addForm.last_name,
                    email: addForm.email,
                    phone: addForm.phone || null,
                    gender: addForm.gender || null,
                    birthdate: addForm.birthdate || null,
                    nationality: addForm.nationality || null,
                });
                if (error) throw error;
            }
            closeDrawer();
            fetchSubscribers();
        } catch (err) {
            console.error('Save subscriber error:', err);
        } finally {
            setAddSaving(false);
        }
    };

    const openDeleteModal = (ids: string[]) => {
        setDeleteTargetIds(ids);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetIds.length === 0) return;
        try {
            setIsDeleting(true);
            const { error } = await supabase.from('waitlist').delete().in('id', deleteTargetIds);
            if (error) throw error;
            if (selectedSubscriber && deleteTargetIds.includes(selectedSubscriber.id)) {
                closeDrawer();
            }
            setSelectedRows(prev => prev.filter(id => !deleteTargetIds.includes(id)));
            fetchSubscribers();
        } catch (err) {
            console.error('Delete subscriber error:', err);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setDeleteTargetIds([]);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSelectAll = () => {
        const isAllOnPageSelected = paginatedSubscribers.length > 0 && paginatedSubscribers.every(s => selectedRows.includes(s.id));
        if (isAllOnPageSelected) {
            const pageIds = new Set(paginatedSubscribers.map(s => s.id));
            setSelectedRows(prev => prev.filter(id => !pageIds.has(id)));
        } else {
            const pageIds = paginatedSubscribers.map(s => s.id);
            setSelectedRows(prev => {
                const newSelection = [...prev];
                pageIds.forEach(id => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id);
                    }
                });
                return newSelection;
            });
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    return {
        // Data
        subscribers,
        filteredSubscribers,
        paginatedSubscribers,
        isLoading,
        error,
        fetchSubscribers,

        // Pagination
        currentPage,
        totalPages,
        itemsPerPage,
        handlePageChange,

        // Selection
        selectedRows,
        setSelectedRows,
        handleSelectAll,
        handleSelectRow,

        // Search
        searchQuery,
        setSearchQuery,

        // Sort
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,

        // Filters
        genderFilter,
        setGenderFilter,
        nationalityFilter,
        setNationalityFilter,
        ageRangeFilter,
        setAgeRangeFilter,
        dateFromFilter,
        setDateFromFilter,
        dateToFilter,
        setDateToFilter,

        // Drawer
        drawerMode,
        setDrawerMode,
        selectedSubscriber,
        addForm,
        setAddForm,
        addSaving,
        addAttempted,
        isViewMode,
        isEditMode,
        isCreateMode,
        closeDrawer,
        openViewDrawer,
        openEditDrawer,
        openCreateDrawer,
        handleAddSubmit,
        resetAddForm,

        // Delete modal
        deleteModalOpen,
        deleteTargetIds,
        isDeleting,
        openDeleteModal,
        confirmDelete,
        setDeleteModalOpen,
        setDeleteTargetIds,

        supabase,
    };
}
