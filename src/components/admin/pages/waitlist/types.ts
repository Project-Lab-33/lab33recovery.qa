// Waitlist Module Type Definitions

export type { SortDirection, DrawerMode } from '@/types';

export interface Subscriber {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    phone_iso: string;
    gender: string;
    birthdate: string;
    nationality: string;
    created_at: string;
}

export interface SubscriberForm {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    birthdate: string;
    nationality: string;
}

export type SortField = 'first_name' | 'created_at' | 'nationality' | 'email';


export interface WaitlistAnalytics {
    totalSignups: number;
    todaySignups: number;
    weeklyGrowth: number;
    conversionRate: number;
    topSources: Array<{
        source: string;
        count: number;
        percentage: number;
    }>;
    signupsByDay: Array<{
        date: string;
        count: number;
    }>;
}

// Analytics Types (used by useWaitlistAnalytics hook)

export interface KPIData {
    totalSubscribers: number;
    growthRate: number;
    thisWeek: number;
    lastWeek: number;
    today: number;
    avgDailyRate: number;
    avgDailyRatePrev: number;
}

export interface DailySignup {
    date: string;
    count: number;
    cumulative: number;
}

export interface GenderData {
    name: string;
    value: number;
    percentage: number;
}

export interface EmailDomainData {
    domain: string;
    count: number;
    percentage: number;
}

export interface GenderAgeHeatmapCell {
    gender: string;
    ageRange: string;
    count: number;
}

export interface RecentSignup {
    id: string;
    name: string;
    email: string;
    nationality: string;
    gender: string;
    age: number | null;
    created_at: string;
}
