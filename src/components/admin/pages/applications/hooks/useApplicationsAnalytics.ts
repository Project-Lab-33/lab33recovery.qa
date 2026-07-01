"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCountryByName, formatNationality, calculateAge, AGE_RANGES, ageMatchesRange } from "@/components/admin/shared/utils/helpers";
import type { Applicant } from "../types";
import type { TimeRange, AgeData, NationalityData, DayOfWeekData, HourOfDayData, MonthlyData } from "@/components/admin/shared/types";

export type { TimeRange, AgeData, NationalityData, DayOfWeekData, HourOfDayData, MonthlyData };

export interface KPIData {
    totalApplications: number;
    growthRate: number;
    thisWeek: number;
    lastWeek: number;
    today: number;
    avgDailyRate: number;
    avgDailyRatePrev: number;
    shortlistedCount: number;
    archivedCount: number;
    pendingCount: number;
    conversionRate: number;
}

export interface DailyApplication {
    date: string;
    count: number;
    cumulative: number;
}

export interface StatusData {
    name: string;
    value: number;
    percentage: number;
}

export interface PositionData {
    position: string;
    count: number;
    percentage: number;
}

export interface RecentApplication {
    id: string;
    name: string;
    email: string;
    position: string;
    status: string;
    hasCV: boolean;
    nationality?: string;
    nationalityFlag?: string;
    age?: number | null;
    created_at: string;
}

export interface FunnelData {
    stage: string;
    count: number;
    percentage: number;
}

export interface StatusPositionCell {
    status: string;
    position: string;
    count: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AGE_RANGES_LIST = ['18-24', '25-34', '35-44', '45-54', '55+', 'N/A'];

function getAgeRange(birthdate: string | null): string {
    if (!birthdate) return 'N/A';
    const age = calculateAge(birthdate);
    if (age === null) return 'N/A';
    for (const r of AGE_RANGES) {
        if (ageMatchesRange(age, r.id)) return r.id;
    }
    return 'N/A';
}

export function useApplicationsAnalytics() {
    const supabase = useMemo(() => createClient(), []);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);

    // Demographic / categorical filters
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [positionFilter, setPositionFilter] = useState<string[]>([]);
    const [nationalityFilter, setNationalityFilter] = useState<string[]>([]);
    const [ageRangeFilter, setAgeRangeFilter] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from("job_applications")
                .select("*")
                .order("created_at", { ascending: true });
            if (err) throw err;
            setApplicants(data || []);
        } catch (err: unknown) {
            console.error("Analytics fetch error:", err);
            setError("Failed to load analytics data.");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Real-time
    useEffect(() => {
        const channel = supabase
            .channel("applications_analytics")
            .on("postgres_changes", { event: "*", schema: "public", table: "job_applications" }, () => { fetchData(); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchData]);

    // Unique positions for filter UI
    const availablePositions = useMemo(() => {
        const set = new Set<string>();
        applicants.forEach(a => { if (a.position_title) set.add(a.position_title); });
        return Array.from(set).sort();
    }, [applicants]);

    const filteredApplicants = useMemo(() => {
        let filtered = applicants;

        // Time range filter
        if (timeRange === 'custom' && customRange) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(a => {
                const d = new Date(a.created_at);
                return d >= start && d <= end;
            });
        } else if (timeRange !== 'all') {
            const now = new Date();
            const cutoff = new Date();
            if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
            else if (timeRange === '30d') cutoff.setDate(now.getDate() - 30);
            else if (timeRange === '90d') cutoff.setDate(now.getDate() - 90);
            filtered = filtered.filter(a => new Date(a.created_at) >= cutoff);
        }

        // Status filter
        if (statusFilter.length > 0) {
            filtered = filtered.filter(a => statusFilter.includes(a.status));
        }

        // Position filter
        if (positionFilter.length > 0) {
            filtered = filtered.filter(a => a.position_title && positionFilter.includes(a.position_title));
        }

        // Nationality filter
        if (nationalityFilter.length > 0) {
            filtered = filtered.filter(a => a.nationality && nationalityFilter.map(n => n.toLowerCase()).includes(a.nationality!.toLowerCase()));
        }

        // Age range filter
        if (ageRangeFilter.length > 0) {
            filtered = filtered.filter(a => {
                if (!a.birthdate) return false;
                const range = getAgeRange(a.birthdate);
                return ageRangeFilter.includes(range);
            });
        }

        return filtered;
    }, [applicants, timeRange, customRange, statusFilter, positionFilter, nationalityFilter, ageRangeFilter]);

    const kpis: KPIData = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const thirtyDaysAgo = new Date(todayStart);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date(todayStart);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const total = applicants.length;
        const today = applicants.filter(a => new Date(a.created_at) >= todayStart).length;
        const thisWeek = applicants.filter(a => new Date(a.created_at) >= weekStart).length;
        const lastWeek = applicants.filter(a => {
            const d = new Date(a.created_at);
            return d >= lastWeekStart && d < weekStart;
        }).length;

        const last30 = applicants.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length;
        const prev30 = applicants.filter(a => {
            const d = new Date(a.created_at);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).length;

        const avgDaily = last30 / 30;
        const avgDailyPrev = prev30 / 30;
        const growthRate = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : (last30 > 0 ? 100 : 0);

        const shortlistedCount = applicants.filter(a => a.status === 'shortlisted').length;
        const archivedCount = applicants.filter(a => a.status === 'archived').length;
        const pendingCount = applicants.filter(a => a.status === 'pending').length;
        const conversionRate = total > 0 ? Math.round((shortlistedCount / total) * 100) : 0;

        return {
            totalApplications: total, growthRate, thisWeek, lastWeek, today,
            avgDailyRate: avgDaily, avgDailyRatePrev: avgDailyPrev,
            shortlistedCount, archivedCount, pendingCount, conversionRate
        };
    }, [applicants]);

    const dailyApplications: DailyApplication[] = useMemo(() => {
        if (filteredApplicants.length === 0) return [];
        const map = new Map<string, number>();
        filteredApplicants.forEach(a => {
            const day = new Date(a.created_at).toISOString().split('T')[0];
            map.set(day, (map.get(day) || 0) + 1);
        });
        const sorted = Array.from(map.keys()).sort();
        if (sorted.length === 0) return [];
        const start = new Date(sorted[0]);
        const end = new Date(sorted[sorted.length - 1]);
        const result: DailyApplication[] = [];
        let cumulative = 0;
        if (timeRange !== 'all') {
            cumulative = applicants.filter(a => new Date(a.created_at) < start).length;
        }
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            const count = map.get(key) || 0;
            cumulative += count;
            result.push({ date: key, count, cumulative });
        }
        return result;
    }, [filteredApplicants, applicants, timeRange]);

    const statusData: StatusData[] = useMemo(() => {
        const map = new Map<string, number>();
        filteredApplicants.forEach(a => {
            const s = a.status.charAt(0).toUpperCase() + a.status.slice(1);
            map.set(s, (map.get(s) || 0) + 1);
        });
        const total = filteredApplicants.length || 1;
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value, percentage: Math.round((value / total) * 100) }))
            .sort((a, b) => b.value - a.value);
    }, [filteredApplicants]);

    const positionData: PositionData[] = useMemo(() => {
        const map = new Map<string, number>();
        filteredApplicants.forEach(a => {
            const pos = a.position_title || 'Unspecified';
            map.set(pos, (map.get(pos) || 0) + 1);
        });
        const total = filteredApplicants.length || 1;
        return Array.from(map.entries())
            .map(([position, count]) => ({ position, count, percentage: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [filteredApplicants]);

    const nationalityData: NationalityData[] = useMemo(() => {
        const map = new Map<string, number>();
        filteredApplicants.forEach(a => {
            const nat = a.nationality ? formatNationality(a.nationality) : 'Unspecified';
            map.set(nat, (map.get(nat) || 0) + 1);
        });
        const total = filteredApplicants.length || 1;
        return Array.from(map.entries())
            .map(([nationality, count]) => {
                const country = getCountryByName(nationality);
                return { nationality, count, percentage: Math.round((count / total) * 100), flag: country?.flag };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [filteredApplicants]);

    const ageData: AgeData[] = useMemo(() => {
        const counts = new Map<string, number>();
        AGE_RANGES_LIST.forEach(r => counts.set(r, 0));
        filteredApplicants.forEach(a => {
            const range = getAgeRange(a.birthdate ?? null);
            counts.set(range, (counts.get(range) || 0) + 1);
        });
        const total = filteredApplicants.length || 1;
        return AGE_RANGES_LIST.map(range => ({
            range,
            count: counts.get(range) || 0,
            percentage: Math.round(((counts.get(range) || 0) / total) * 100)
        }));
    }, [filteredApplicants]);

    const averageAge = useMemo(() => {
        const ages = filteredApplicants
            .map(a => a.birthdate ? calculateAge(a.birthdate) : null)
            .filter((a): a is number => a !== null);
        if (ages.length === 0) return null;
        return Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length);
    }, [filteredApplicants]);

    const dayOfWeekData: DayOfWeekData[] = useMemo(() => {
        const counts = new Array(7).fill(0);
        filteredApplicants.forEach(a => {
            counts[new Date(a.created_at).getDay()]++;
        });
        return DAY_NAMES.map((day, i) => ({ day, shortDay: DAY_SHORT[i], count: counts[i] }));
    }, [filteredApplicants]);

    const hourOfDayData: HourOfDayData[] = useMemo(() => {
        const counts = new Array(24).fill(0);
        filteredApplicants.forEach(a => {
            counts[new Date(a.created_at).getHours()]++;
        });
        return counts.map((count, hour) => ({
            hour,
            label: `${hour.toString().padStart(2, '0')}:00`,
            count
        }));
    }, [filteredApplicants]);

    const monthlyData: MonthlyData[] = useMemo(() => {
        if (applicants.length === 0) return [];
        const map = new Map<string, number>();
        applicants.forEach(a => {
            const d = new Date(a.created_at);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            map.set(key, (map.get(key) || 0) + 1);
        });
        const sorted = Array.from(map.keys()).sort();
        return sorted.map((month, i) => {
            const count = map.get(month) || 0;
            const prev = i > 0 ? (map.get(sorted[i - 1]) || 0) : 0;
            const growth = prev > 0 ? Math.round(((count - prev) / prev) * 100) : 0;
            const [y, m] = month.split('-');
            return { month: `${MONTH_NAMES[parseInt(m) - 1]} ${y}`, count, growth };
        });
    }, [applicants]);

    const funnelData: FunnelData[] = useMemo(() => {
        const total = applicants.length || 1;
        const stages = [
            { stage: 'Applied', count: applicants.length },
            { stage: 'Pending Review', count: applicants.filter(a => a.status === 'pending').length },
            { stage: 'Shortlisted', count: applicants.filter(a => a.status === 'shortlisted').length },
            { stage: 'Archived', count: applicants.filter(a => a.status === 'archived').length },
        ];
        return stages.map(s => ({
            ...s,
            percentage: Math.round((s.count / total) * 100)
        }));
    }, [applicants]);

    const statusPositionHeatmap: StatusPositionCell[] = useMemo(() => {
        const cells: StatusPositionCell[] = [];
        const statuses = ['Pending', 'Shortlisted', 'Archived'];
        const positions = positionData.slice(0, 5).map(p => p.position);
        const map = new Map<string, number>();

        filteredApplicants.forEach(a => {
            const s = a.status.charAt(0).toUpperCase() + a.status.slice(1);
            const p = a.position_title || 'Unspecified';
            if (!positions.includes(p)) return;
            const key = `${s}|${p}`;
            map.set(key, (map.get(key) || 0) + 1);
        });

        statuses.forEach(status => {
            positions.forEach(position => {
                cells.push({ status, position, count: map.get(`${status}|${position}`) || 0 });
            });
        });
        return cells;
    }, [filteredApplicants, positionData]);

    const projectionData = useMemo(() => {
        if (dailyApplications.length < 7) return [];
        const recent = dailyApplications.slice(-30);
        const avgRate = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
        const lastCumulative = dailyApplications[dailyApplications.length - 1].cumulative;
        const lastDate = new Date(dailyApplications[dailyApplications.length - 1].date);

        const projection = [];
        projection.push({
            date: dailyApplications[dailyApplications.length - 1].date,
            count: null,
            cumulative: null,
            projected: lastCumulative,
        });
        for (let i = 1; i <= 30; i++) {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + i);
            projection.push({
                date: d.toISOString().split('T')[0],
                count: null,
                cumulative: null,
                projected: Math.round(lastCumulative + avgRate * i)
            });
        }
        return projection;
    }, [dailyApplications]);

    const recentApplications: RecentApplication[] = useMemo(() => {
        return [...applicants]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 15)
            .map(a => {
                const country = a.nationality ? getCountryByName(a.nationality) : null;
                return {
                    id: a.id,
                    name: `${a.first_name} ${a.last_name}`.trim() || 'N/A',
                    email: a.email || 'N/A',
                    position: a.position_title || 'N/A',
                    status: a.status,
                    hasCV: !!a.cv_filename,
                    nationality: a.nationality ? formatNationality(a.nationality) : undefined,
                    nationalityFlag: country?.flag,
                    age: a.birthdate ? calculateAge(a.birthdate) : null,
                    created_at: a.created_at,
                };
            });
    }, [applicants]);

    const documentStats = useMemo(() => {
        const withCV = applicants.filter(a => a.cv_filename).length;
        const withCL = applicants.filter(a => a.cover_letter_filename).length;
        const withLinkedIn = applicants.filter(a => a.linkedin_url).length;
        const total = applicants.length || 1;
        return {
            withCV, withCL, withLinkedIn,
            cvRate: Math.round((withCV / total) * 100),
            clRate: Math.round((withCL / total) * 100),
            linkedInRate: Math.round((withLinkedIn / total) * 100),
        };
    }, [applicants]);

    return {
        isLoading,
        error,
        timeRange,
        setTimeRange,
        customRange,
        setCustomRange,
        // Filter states + setters
        statusFilter,
        setStatusFilter,
        positionFilter,
        setPositionFilter,
        nationalityFilter,
        setNationalityFilter,
        ageRangeFilter,
        setAgeRangeFilter,
        availablePositions,
        fetchData,
        kpis,
        dailyApplications,
        statusData,
        positionData,
        nationalityData,
        ageData,
        averageAge,
        dayOfWeekData,
        hourOfDayData,
        monthlyData,
        funnelData,
        statusPositionHeatmap,
        projectionData,
        recentApplications,
        documentStats,
    };
}
