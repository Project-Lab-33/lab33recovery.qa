// Applications Module Type Definitions

export type { SortDirection, DateRangeFilter } from '@/types';

/** Status values for job applicants */
export type ApplicantStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'archived' | 'hired';

/** Canonical Applicant interface — single source of truth for all views/hooks */
export interface Applicant {
    id: string;
    first_name: string;
    last_name: string;
    position_title: string;
    email: string;
    phone: string;
    gender?: string | null;
    status: ApplicantStatus;
    cv_filename: string | null;
    cover_letter_filename?: string | null;
    created_at: string;
    birthdate?: string | null;
    nationality?: string | null;
    linkedin_url?: string | null;
    notes?: string | null;
}

/** Shared filter / sort utility types */
export type SortField = 'created_at' | 'first_name' | 'position_title' | 'status';

// Legacy Application types (kept for compatibility)

export interface Application {
    id: string;
    applicantName: string;
    email: string;
    phone?: string;
    position: string;
    department?: string;
    status: ApplicationStatus;
    resumeUrl?: string;
    coverLetterUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    experience: number; // years
    skills: string[];
    notes?: string;
    rating?: number; // 1-5
    interviewDate?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt?: string;
}

export type ApplicationStatus =
    | 'new'
    | 'screening'
    | 'interview_scheduled'
    | 'interviewed'
    | 'offer_sent'
    | 'hired'
    | 'rejected'
    | 'withdrawn';

export interface ApplicationFilters {
    status?: ApplicationStatus[];
    position?: string[];
    department?: string[];
    experienceRange?: {
        min: number;
        max: number;
    };
    dateRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
}

export interface ApplicationAnalytics {
    totalApplications: number;
    newThisWeek: number;
    averageTimeToHire: number; // days
    conversionRate: number;
    byStatus: Array<{
        status: ApplicationStatus;
        count: number;
        percentage: number;
    }>;
    byPosition: Array<{
        position: string;
        count: number;
    }>;
}
