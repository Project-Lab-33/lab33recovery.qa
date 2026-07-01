// Used by both waitlist and applications analytics hooks
export type TimeRange = '7d' | '30d' | '90d' | 'all' | 'custom';

export interface AgeData {
    range: string;
    count: number;
    percentage: number;
}

export interface NationalityData {
    nationality: string;
    count: number;
    percentage: number;
    flag?: string;
}

export interface DayOfWeekData {
    day: string;
    shortDay: string;
    count: number;
}

export interface HourOfDayData {
    hour: number;
    label: string;
    count: number;
}

export interface MonthlyData {
    month: string;
    count: number;
    growth: number;
}
