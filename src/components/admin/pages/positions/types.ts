// Positions Module Type Definitions

export type { SortDirection, DrawerMode } from '@/types';

export interface Position {
    id: string;
    title: string;
    code: string;
    segment: string;
    description: string;
    requirements: string[];
    contact_email: string;
    status: PositionStatus;
    created_at: string;
    updated_at: string;
}

export interface PositionForm {
    title: string;
    code: string;
    segment: string;
    description: string;
    requirements: string;
    contact_email: string;
    status: PositionStatus;
}

export type PositionStatus = 'active' | 'draft' | 'archived';

export type SortField = 'title' | 'created_at' | 'code' | 'status';
