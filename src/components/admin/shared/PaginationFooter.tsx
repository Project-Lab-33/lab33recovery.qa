'use client';

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PaginationFooterProps {
    /** Total number of records (shown in the "X Records" label) */
    totalRecords: number;
    /** Current page (1-indexed) */
    currentPage: number;
    /** Total page count */
    totalPages: number;
    /** Callback when user changes page */
    onPageChange: (page: number) => void;
    /** Whether data is loading — disables buttons */
    isLoading?: boolean;

    /** Number of selected rows. When > 0, the selection bar is shown instead of pagination. */
    selectedCount?: number;
    /** Callback for bulk-delete action in the selection bar */
    onDeleteSelected?: () => void;
    /** Label for the delete action (e.g. "Delete 3 Records"). Auto-generated if omitted. */
    deleteLabel?: string;
    /** Extra content to render on the right side of the selection bar (alongside or instead of delete). */
    selectionActions?: ReactNode;
}

export function PaginationFooter({
    totalRecords,
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    selectedCount = 0,
    onDeleteSelected,
    deleteLabel,
    selectionActions,
}: PaginationFooterProps) {
    const safeTotalPages = Math.max(1, totalPages);

    if (selectedCount > 0) {
        return (
            <div className="relative h-[76px] px-8 flex items-center justify-between shrink-0">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.25em] font-medium">
                    <span className="text-[var(--accent-gold)]">{selectedCount}</span> Selected
                </p>
                <div className="flex items-center gap-3">
                    {selectionActions}
                    {onDeleteSelected && (
                        <button
                            onClick={onDeleteSelected}
                            className="text-xs uppercase tracking-[0.25em] font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={14} />
                            {deleteLabel || `Delete ${selectedCount} ${selectedCount === 1 ? 'Record' : 'Records'}`}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[76px] px-8 flex items-center justify-between shrink-0">
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.35em] font-medium">
                <span className="text-[var(--accent-gold)]">{totalRecords}</span> Records • Page <span className="text-[var(--accent-gold)]">{currentPage}</span> of <span className="text-[var(--accent-gold)]">{safeTotalPages}</span>
            </p>

            <div className="flex items-center gap-2">
                {/* Prev */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border-subtle)]/50 bg-[var(--surface-high)]/50 text-[var(--text-secondary)]/30 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: safeTotalPages }, (_, i) => i + 1)
                        .filter(page => {
                            if (safeTotalPages <= 5) return true;
                            return page === 1 || page === safeTotalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => (
                            <div key={page} className="flex items-center">
                                {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="text-[10px] text-[var(--text-muted)]/30 mx-1">•••</span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[11px] font-bold transition-colors ${currentPage === page
                                        ? "bg-[var(--accent-gold)] text-black shadow-[0_4px_12px_rgba(212,175,119,0.25)]"
                                        : "text-[var(--text-secondary)]/30 hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)]"
                                        }`}
                                >
                                    {page}
                                </button>
                            </div>
                        ))}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
                    disabled={currentPage === safeTotalPages || safeTotalPages === 0 || isLoading}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border-subtle)]/50 bg-[var(--surface-high)]/50 text-[var(--text-secondary)]/30 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
