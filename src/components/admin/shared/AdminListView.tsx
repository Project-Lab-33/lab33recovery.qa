"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import {
    Plus,
    Search,
    X,
    SlidersHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Share2,
    FileText,
    FileSpreadsheet,
    Check,
} from "lucide-react";
import { AdminDrawer } from "./AdminDrawer";
import { AdminLoader } from "./AdminLoader";
import { useEffect, useState, useMemo, useRef, useCallback, type ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import { PaginationFooter } from "./PaginationFooter";
import type { SortOption } from "./SortDropdown";

export type { SortOption };

export interface Column<T> {
    /** Unique key used for column resizing state */
    key: string;
    /** Header label displayed in uppercase gold text */
    label: string;
    /** Initial width in pixels */
    initialWidth: number;
    /** If true, header text is full gold (first column). Otherwise gold/70 */
    primary?: boolean;
    /** Render function for each row's cell content */
    render: (row: T, index: number) => ReactNode;
}

export interface AdminListViewProps<T> {
    /** Small label above the title (e.g. "Consolidated Data", "Access Control") */
    headerLabel: string;
    /** Main title (e.g. "Subscribers", "Administrators") */
    title: string;
    /** When true, the entire header section is hidden (use when parent renders its own header) */
    hideHeader?: boolean;

    /** Filtered + sorted data array. Pagination is handled internally. */
    data: T[];
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Column definitions */
    columns: Column<T>[];
    /** Extract unique ID from each row */
    getRowId: (row: T) => string;

    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;

    sortOptions?: SortOption[];
    sortField?: string;
    sortDirection?: "asc" | "desc";
    onSortFieldChange?: (field: string) => void;
    onSortDirectionChange?: (direction: "asc" | "desc") => void;
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";

    /** Content rendered inside the filter drawer body (scrollable) */
    filterDrawerContent?: ReactNode;
    /** Number of active filters (shown as badge) */
    activeFilterCount?: number;
    /** Called when "Clear All" is clicked in the filter drawer */
    onClearFilters?: () => void;
    /** Filter drawer header title. Defaults to "Filter {title}" */
    filterDrawerTitle?: string;

    renderFilterChips?: () => ReactNode;

    /** ReactNode rendered absolutely centered at the bottom of the header row.
     *  Use the shared <ViewToggle> component here. */
    viewToggle?: ReactNode;

    onExportCSV?: () => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;

    /** Called when the gold "+" button is clicked */
    onAdd?: () => void;
    /** Tooltip for the add button */
    addTooltip?: string;

    /** Called when a row is clicked */
    onRowClick?: (row: T) => void;
    /** Additional className for each row */
    rowClassName?: (row: T) => string;

    /** Render action buttons for each row. Container has stopPropagation. */
    renderRowActions?: (row: T) => ReactNode;
    /** Width of the actions column in pixels. Default: 100 */
    actionsWidth?: number;

    enableSelection?: boolean;
    selectedRows?: string[];
    onSelectedRowsChange?: (rows: string[]) => void;
    /** Called when "Delete Selected" is clicked in the pagination bar */
    onDeleteSelected?: (ids: string[]) => void;

    emptyIcon?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;

    /** Error message to display instead of data */
    error?: string | null;
    /** Icon shown in the error state. Defaults to User icon */
    errorIcon?: ReactNode;

    /** Custom title for the in-table loading state */
    loaderTitle?: string;
    /** Custom subtitle for the in-table loading state */
    loaderSubtitle?: string;

    /** Items per page. Default: 10 */
    itemsPerPage?: number;
}

export function AdminListView<T>({
    // Header
    headerLabel,
    title,
    hideHeader = false,
    // Data
    data,
    isLoading,
    columns,
    getRowId,
    // Search
    searchQuery,
    onSearchChange,
    searchPlaceholder,
    // Sort
    sortOptions = [],
    sortField,
    sortDirection,
    onSortFieldChange,
    onSortDirectionChange,
    defaultSortField,
    defaultSortDirection = "desc",
    // Filters
    filterDrawerContent,
    activeFilterCount = 0,
    onClearFilters,
    filterDrawerTitle,
    // Filter Chips
    renderFilterChips,
    // View Toggle
    viewToggle,
    // Export
    onExportCSV,
    onExportExcel,
    onExportPDF,
    // Add
    onAdd,
    addTooltip = "Add New",
    // Row behavior
    onRowClick,
    rowClassName,
    // Row actions
    renderRowActions,
    actionsWidth = 100,
    // Selection
    enableSelection = false,
    selectedRows = [],
    onSelectedRowsChange,
    onDeleteSelected,
    // Empty
    emptyIcon,
    emptyTitle,
    emptyDescription,
    // Error
    error,
    errorIcon,
    // Loader
    loaderTitle,
    loaderSubtitle,
    // Pagination
    itemsPerPage = 10,
}: AdminListViewProps<T>) {

    const [searchOpen, setSearchOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const sortRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);

    // Column resizing
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        const widths: Record<string, number> = {};
        columns.forEach(col => { widths[col.key] = col.initialWidth; });
        return widths;
    });
    const [resizing, setResizing] = useState<string | null>(null);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);

    const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
        setResizing(columnKey);
        setStartX(e.clientX);
        setStartWidth(columnWidths[columnKey] || 120);
        e.preventDefault();
    }, [columnWidths]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!resizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(80, startWidth + diff);
        setColumnWidths(prev => ({ ...prev, [resizing]: newWidth }));
    }, [resizing, startX, startWidth]);

    const handleResizeEnd = useCallback(() => {
        setResizing(null);
    }, []);

    useEffect(() => {
        if (resizing) {
            document.addEventListener("mousemove", handleResizeMove);
            document.addEventListener("mouseup", handleResizeEnd);
            return () => {
                document.removeEventListener("mousemove", handleResizeMove);
                document.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [resizing, handleResizeMove, handleResizeEnd]);

    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    // Reset to page 1 when data changes

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setCurrentPage(1); }, [data.length]);

    // Clamp page if data shrinks

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const handleSelectAll = useCallback(() => {
        if (!onSelectedRowsChange) return;
        const pageIds = paginatedData.map(row => getRowId(row));
        const allSelected = pageIds.every(id => selectedRows.includes(id));
        if (allSelected) {
            onSelectedRowsChange(selectedRows.filter(id => !pageIds.includes(id)));
        } else {
            onSelectedRowsChange([...new Set([...selectedRows, ...pageIds])]);
        }
    }, [paginatedData, selectedRows, onSelectedRowsChange, getRowId]);

    const handleSelectRow = useCallback((id: string) => {
        if (!onSelectedRowsChange) return;
        if (selectedRows.includes(id)) {
            onSelectedRowsChange(selectedRows.filter(x => x !== id));
        } else {
            onSelectedRowsChange([...selectedRows, id]);
        }
    }, [selectedRows, onSelectedRowsChange]);

    // Indeterminate checkbox
    useEffect(() => {
        if (selectAllRef.current && enableSelection) {
            const pageIds = paginatedData.map(row => getRowId(row));
            const someOnPage = pageIds.some(id => selectedRows.includes(id));
            const allOnPage = pageIds.length > 0 && pageIds.every(id => selectedRows.includes(id));
            selectAllRef.current.indeterminate = someOnPage && !allOnPage;
        }
    }, [selectedRows, paginatedData, enableSelection, getRowId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
        };
        if (sortOpen || exportOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sortOpen, exportOpen]);

    const hasExport = !!(onExportCSV || onExportExcel || onExportPDF);
    const hasSort = sortOptions.length > 0;
    const hasFilters = !!filterDrawerContent;
    const totalColSpan = columns.length + (enableSelection ? 1 : 0) + (renderRowActions ? 1 : 0);

    // Export wrappers (with success flash)
    const wrapExport = useCallback((fn: (() => void) | undefined, id: string) => {
        if (!fn) return undefined;
        return () => {
            fn();
            setExportSuccess(id);
            setTimeout(() => { setExportSuccess(null); setExportOpen(false); }, 1200);
        };
    }, []);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            {!hideHeader && (
                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
                    {/* Left: Title */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[var(--accent-gold)] text-[10px] uppercase tracking-[0.4em] font-bold">{headerLabel}</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <h1 className="text-4xl font-serif text-[var(--text-primary)]">{title}</h1>
                            <span className="text-lg font-mono text-[var(--accent-gold)]/40">{data.length}</span>
                        </div>
                    </div>

                    {/* Center: Expandable Search */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10"
                            >
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[var(--accent-gold)]/10 rounded-2xl blur-xl" />
                                    <div className="relative flex items-center gap-2 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                        <Search className="ml-4 text-[var(--accent-gold)]" size={18} />
                                        <input
                                            type="text"
                                            placeholder={searchPlaceholder || `Search ${title.toLowerCase()}...`}
                                            value={searchQuery}
                                            onChange={(e) => onSearchChange(e.target.value)}
                                            autoFocus
                                            className="bg-transparent py-3.5 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none min-w-[320px]"
                                        />
                                        <button
                                            onClick={() => { setSearchOpen(false); onSearchChange(""); }}
                                            className="mr-2 p-2 rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)] transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
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

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${searchOpen
                                    ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                                    : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"
                                    }`}
                                title="Search"
                            >
                                <Search size={20} className="absolute inset-0 m-auto" />
                            </button>
                        </div>

                        {/* Filters Toggle */}
                        {hasFilters && (
                            <div className="relative">
                                <button
                                    onClick={() => setFiltersVisible(!filtersVisible)}
                                    className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${filtersVisible || activeFilterCount > 0
                                        ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                                        : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"
                                        }`}
                                    title="Filters"
                                >
                                    <SlidersHorizontal size={20} className="absolute inset-0 m-auto" />
                                    {activeFilterCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-gold)] border-2 border-[var(--background)] flex items-center justify-center text-[9px] font-bold text-black">
                                            {activeFilterCount}
                                        </div>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Sort Popover */}
                        {hasSort && (
                            <div className="relative" ref={sortRef}>
                                <button
                                    onClick={() => setSortOpen(!sortOpen)}
                                    className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${sortOpen || sortField !== defaultSortField || sortDirection !== defaultSortDirection
                                        ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                                        : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"
                                        }`}
                                    title="Sort"
                                >
                                    <ArrowUpDown size={20} className="absolute inset-0 m-auto" />
                                </button>
                                <AnimatePresence>
                                    {sortOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                                            className="absolute right-0 top-[calc(100%+8px)] w-[280px] z-[110] rounded-2xl overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] border border-[var(--accent-gold)]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(180,140,80,0.1)]" />
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 rounded-full blur-2xl pointer-events-none" />
                                            <div className="relative p-2">
                                                <div className="px-4 pt-3 pb-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--accent-gold)]/60">Sort By</span>
                                                </div>
                                                {sortOptions.map((option) => {
                                                    const Icon = option.icon;
                                                    const isActive = sortField === option.field;
                                                    return (
                                                        <button
                                                            key={option.field}
                                                            onClick={() => {
                                                                if (isActive) {
                                                                    onSortDirectionChange?.(sortDirection === "asc" ? "desc" : "asc");
                                                                } else {
                                                                    onSortFieldChange?.(option.field);
                                                                    const dir = option.defaultDirection || (option.field.includes("name") || option.field.includes("email") ? "asc" : "desc");
                                                                    onSortDirectionChange?.(dir);
                                                                }
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive
                                                                ? "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]"
                                                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-high)] hover:text-[var(--text-primary)]"
                                                                }`}
                                                        >
                                                            <Icon size={16} className={isActive ? "text-[var(--accent-gold)]" : "opacity-40"} />
                                                            <span className="flex-1 text-left text-[11px] font-bold uppercase tracking-[0.15em]">{option.label}</span>
                                                            {isActive && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="w-6 h-6 rounded-lg bg-[var(--accent-gold)]/20 flex items-center justify-center"
                                                                >
                                                                    {sortDirection === "asc"
                                                                        ? <ArrowUp size={12} className="text-[var(--accent-gold)]" />
                                                                        : <ArrowDown size={12} className="text-[var(--accent-gold)]" />
                                                                    }
                                                                </motion.div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                                {/* Reset */}
                                                {(sortField !== defaultSortField || sortDirection !== defaultSortDirection) && (
                                                    <div className="px-2 pt-2 mt-1 border-t border-[var(--border-subtle)]/30">
                                                        <button
                                                            onClick={() => {
                                                                onSortFieldChange?.(defaultSortField || "created_at");
                                                                onSortDirectionChange?.(defaultSortDirection);
                                                                setSortOpen(false);
                                                            }}
                                                            className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500/60 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/5"
                                                        >
                                                            Reset to Default
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Export Dropdown */}
                        {hasExport && (
                            <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setExportOpen(!exportOpen)}
                                    className={`group relative w-12 h-12 rounded-2xl border transition-colors duration-200 ${exportOpen
                                        ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]"
                                        : "bg-[var(--surface-high)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5"
                                        }`}
                                    title="Export Data"
                                >
                                    <Share2 size={20} className="absolute inset-0 m-auto" />
                                    {enableSelection && selectedRows.length > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-gold)] border-2 border-[var(--background)] flex items-center justify-center text-[9px] font-bold text-black">
                                            {selectedRows.length}
                                        </div>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {exportOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                                            className="absolute right-0 top-[calc(100%+8px)] w-[280px] z-[110] rounded-2xl overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] border border-[var(--accent-gold)]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(180,140,80,0.1)]" />
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 rounded-full blur-2xl pointer-events-none" />
                                            <div className="relative p-2">
                                                <div className="px-4 pt-3 pb-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--accent-gold)]/60">
                                                        Export {enableSelection && selectedRows.length > 0 ? `${selectedRows.length} Selected` : `All (${data.length})`}
                                                    </span>
                                                </div>
                                                {onExportCSV && (
                                                    <ExportButton
                                                        label="CSV Document"
                                                        desc="Comma-separated values"
                                                        icon={FileText}
                                                        isSuccess={exportSuccess === "csv"}
                                                        onClick={wrapExport(onExportCSV, "csv")!}
                                                    />
                                                )}
                                                {onExportExcel && (
                                                    <ExportButton
                                                        label="Excel Sheet"
                                                        desc="Spreadsheet format"
                                                        icon={FileSpreadsheet}
                                                        isSuccess={exportSuccess === "excel"}
                                                        onClick={wrapExport(onExportExcel, "excel")!}
                                                    />
                                                )}
                                                {onExportPDF && (
                                                    <ExportButton
                                                        label="Portable PDF"
                                                        desc="Print-ready document"
                                                        icon={FileText}
                                                        isSuccess={exportSuccess === "pdf"}
                                                        onClick={wrapExport(onExportPDF, "pdf")!}
                                                    />
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Filter Drawer */}
                        <AdminDrawer
                            isOpen={filtersVisible && hasFilters}
                            onClose={() => setFiltersVisible(false)}
                            subtitle={`${activeFilterCount} active filter${activeFilterCount !== 1 ? "s" : ""} applied`}
                            title={filterDrawerTitle || `Filter ${title}`}
                            width="680px"
                            footer={
                                <div className="px-8 py-6 border-t border-[var(--border-strong)]/60 flex items-center justify-between shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClearFilters}
                                        className="h-12 px-7 rounded-2xl text-[13px] font-bold uppercase tracking-[0.12em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFiltersVisible(false)}
                                        className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[13px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-[var(--accent-gold)]/25 hover:shadow-[var(--accent-gold)]/45 hover:scale-[1.02] active:scale-[0.98] transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            }
                            bodyClassName="space-y-8"
                        >
                            {filterDrawerContent}
                        </AdminDrawer>

                        {/* Add Button — gold circle */}
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="group relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] via-[var(--accent-gold)] to-[#B8860B] shadow-[0_4px_20px_rgba(212,175,119,0.25)] hover:shadow-[0_8px_32px_rgba(212,175,119,0.4)] hover:scale-105 active:scale-95 transition-colors duration-200"
                                title={addTooltip}
                            >
                                <div className="absolute inset-0 rounded-2xl bg-[var(--accent-gold)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                                <div className="absolute inset-[1px] rounded-[14px] bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                                <Plus size={22} strokeWidth={2.5} className="absolute inset-0 m-auto text-black" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Filter Chips */}
            {!viewToggle && renderFilterChips?.()}

            {/* Table Container */}
            <div className={`${hideHeader ? "" : "mt-10"} flex-1 min-h-0 flex flex-col`}>
                <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                    {/* Decorative gold accent line */}
                    <div className="absolute top-0 left-8 right-8 h-[1px] bg-[var(--accent-gold)]/10" />

                    <div className="flex-1 overflow-hidden">
                        <table className="w-full text-left" style={{ tableLayout: "fixed" }}>
                            <thead>
                                <tr className="border-b border-[var(--border-medium)]">
                                    {/* Checkbox Column */}
                                    {enableSelection && (
                                        <th className="px-6 py-5" style={{ width: 60 }}>
                                            <input
                                                ref={selectAllRef}
                                                type="checkbox"
                                                checked={paginatedData.length > 0 && paginatedData.every(r => selectedRows.includes(getRowId(r)))}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-2 border-[var(--accent-gold)]/30 bg-[var(--surface-high)] checked:bg-[var(--accent-gold)] checked:border-[var(--accent-gold)] cursor-pointer accent-[var(--accent-gold)]"
                                            />
                                        </th>
                                    )}

                                    {/* Data Columns with Resize Handles */}
                                    {columns.map((col, i) => (
                                        <th
                                            key={col.key}
                                            className="px-6 py-5 relative"
                                            style={{ width: `${columnWidths[col.key] || col.initialWidth}px` }}
                                        >
                                            <span className={`${col.primary || i === 0
                                                ? "text-[var(--accent-gold)]"
                                                : "text-[var(--accent-gold)]/70"
                                                } text-[9px] tracking-[0.25em] font-bold uppercase`}>
                                                {col.label}
                                            </span>
                                            {/* Resize Handle */}
                                            <div
                                                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group"
                                                onMouseDown={(e) => handleResizeStart(e, col.key)}
                                            >
                                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" />
                                            </div>
                                        </th>
                                    ))}

                                    {/* Actions Column (no resize handle) */}
                                    {renderRowActions && (
                                        <th className="px-8 py-5 text-right" style={{ width: `${actionsWidth}px` }}>
                                            <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Actions</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={totalColSpan} className="px-8 text-center">
                                            <div className="flex items-center justify-center py-32">
                                                <AdminLoader title={loaderTitle || "Retrieving Secure Records"} subtitle={loaderSubtitle || "Synchronizing administrative data pulse..."} />
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={totalColSpan} className="px-8 text-center">
                                            <div className="flex flex-col items-center justify-center gap-6 py-32">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--surface-high)] to-[var(--surface-mid)] flex items-center justify-center border border-[var(--border-medium)] shadow-inner">
                                                    {errorIcon || <User size={36} className="text-red-500/20" />}
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="text-sm text-red-400/80 font-medium">{error}</p>
                                                    <p className="text-[12px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">Click refresh to try again</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <EmptyState
                                        variant="table-row"
                                        colSpan={totalColSpan}
                                        icon={emptyIcon || <Search size={36} className="text-[var(--text-secondary)]/20" />}
                                        title={emptyTitle || `No ${title} Found`}
                                        description={emptyDescription || (searchQuery || activeFilterCount > 0 ? "Try adjusting your search or filters" : `${title} will appear here`)}
                                    />
                                ) : (
                                    <>
                                        {paginatedData.map((row, index) => {
                                            const rowId = getRowId(row);
                                            return (
                                                <tr
                                                    key={rowId}
                                                    onClick={() => onRowClick?.(row)}
                                                    className={`group transition-colors duration-200 h-[60px] hover:bg-[var(--accent-gold)]/[0.04] ${index % 2 === 1 ? "bg-[var(--surface-high)]/[0.3]" : ""} ${onRowClick ? "cursor-pointer" : ""} ${index !== paginatedData.length - 1 ? "border-b border-[var(--border-medium)]" : ""} ${rowClassName?.(row) || ""}`}
                                                >
                                                    {/* Checkbox */}
                                                    {enableSelection && (
                                                        <td className="px-6 align-middle" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(rowId)}
                                                                onChange={() => handleSelectRow(rowId)}
                                                                className="w-4 h-4 rounded border-2 border-[var(--accent-gold)]/30 bg-[var(--surface-high)] checked:bg-[var(--accent-gold)] checked:border-[var(--accent-gold)] cursor-pointer accent-[var(--accent-gold)]"
                                                            />
                                                        </td>
                                                    )}

                                                    {/* Data Cells */}
                                                    {columns.map((col) => (
                                                        <td key={col.key} className="px-6 align-middle">
                                                            {col.render(row, index)}
                                                        </td>
                                                    ))}

                                                    {/* Actions */}
                                                    {renderRowActions && (
                                                        <td className="px-8 align-middle" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-colors">
                                                                {renderRowActions(row)}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                        {/* Filler Rows */}
                                        {paginatedData.length < itemsPerPage && (
                                            Array.from({ length: itemsPerPage - paginatedData.length }).map((_, i) => (
                                                <tr key={`filler-${i}`} className="h-[60px]">
                                                    <td colSpan={totalColSpan} />
                                                </tr>
                                            ))
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <PaginationFooter
                        totalRecords={data.length}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        isLoading={isLoading}
                        selectedCount={enableSelection ? selectedRows.length : 0}
                        onDeleteSelected={onDeleteSelected ? () => onDeleteSelected([...selectedRows]) : undefined}
                    />
                </div>
            </div>
        </div>
    );
}

function ExportButton({
    label,
    desc,
    icon: Icon,
    isSuccess,
    onClick,
}: {
    label: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    isSuccess: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 text-[var(--text-secondary)] hover:bg-[var(--surface-high)] hover:text-[var(--text-primary)]"
        >
            {isSuccess
                ? <Check size={16} className="text-emerald-400" />
                : <Icon size={16} className="opacity-40" />
            }
            <div className="flex-1 text-left">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] block">{label}</span>
                <span className="text-[9px] text-[var(--text-muted)] tracking-wide">{desc}</span>
            </div>
            {isSuccess && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400"
                >
                    Done
                </motion.span>
            )}
        </button>
    );
}
