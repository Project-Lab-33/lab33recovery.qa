'use client';

import { ReactNode, useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { PaginationFooter } from './PaginationFooter';
import { AdminLoader } from './AdminLoader';
import { EmptyState } from './EmptyState';

export interface AdminCardViewProps<T> {
    /** Filtered + sorted data array. Pagination is handled internally. */
    data: T[];
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Extract unique ID from each item */
    getItemId: (item: T) => string;

    /** Render function for each card. Receives the item and its index. */
    renderCard: (item: T, index: number) => ReactNode;

    /** Grid columns class. Default: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' */
    gridClassName?: string;

    emptyIcon?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;

    /** Loading message displayed below spinner. Default: 'Retrieving Secure Records...' */
    loadingMessage?: string;

    /** Items per page. Default: 12 */
    itemsPerPage?: number;
}

export function AdminCardView<T>({
    // Data
    data,
    isLoading,
    getItemId,
    // Rendering
    renderCard,
    // Grid
    gridClassName = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    // Empty
    emptyIcon,
    emptyTitle = 'No Records Found',
    emptyDescription,
    // Loading
    loadingMessage = 'Retrieving Secure Records...',
    // Pagination
    itemsPerPage = 12,
}: AdminCardViewProps<T>) {

    const [currentPage, setCurrentPage] = useState(1);

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

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <AdminLoader title="Secure Records" subtitle={loadingMessage} />
                        </div>
                    ) : data.length === 0 ? (
                        <EmptyState
                            icon={emptyIcon || <Search size={36} className="text-[var(--text-secondary)]/20" />}
                            title={emptyTitle}
                            description={emptyDescription}
                        />
                    ) : (
                        <div className={`grid ${gridClassName} gap-5`}>
                            {paginatedData.map((item, index) => (
                                <div key={getItemId(item)}>
                                    {renderCard(item, index)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <PaginationFooter
                    totalRecords={data.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
