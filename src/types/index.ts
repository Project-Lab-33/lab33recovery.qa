// Cross-cutting types used across multiple modules. Module-specific
// types stay colocated in their respective /pages/<module>/types.ts files.

/** Universal sort direction used by all list/table views */
export type SortDirection = 'asc' | 'desc';

/** Universal drawer mode for create/view/edit drawers */
export type DrawerMode = 'create' | 'view' | 'edit' | null;

/** Standard date range presets used across analytics & filters */
export type DateRangeFilter =
    | 'today'
    | 'week'
    | 'month'
    | 'lastMonth'
    | 'lastYear'
    | 'all'
    | 'custom';

/** Fields present on every database row (auto-generated) */
export interface BaseRow {
    id: string;
    created_at: string;
}

/** Fields present on every mutable database row */
export interface MutableRow extends BaseRow {
    updated_at: string;
}

/** Standard paginated response envelope */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

/** Standard API error shape */
export interface ApiError {
    error: string;
    status?: number;
    details?: string;
}
