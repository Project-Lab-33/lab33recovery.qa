"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscriber, KPIData, DailySignup, GenderData, EmailDomainData, GenderAgeHeatmapCell, RecentSignup } from "../types";
import { calculateAge } from "@/components/admin/shared/utils/helpers";
import type { TimeRange, AgeData, NationalityData, DayOfWeekData, HourOfDayData, MonthlyData } from "@/components/admin/shared/types";

export type { TimeRange, AgeData, NationalityData, DayOfWeekData, HourOfDayData, MonthlyData };
export type { KPIData, DailySignup, GenderData, EmailDomainData, GenderAgeHeatmapCell, RecentSignup };


const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AGE_RANGES_LIST = ['18-24', '25-34', '35-44', '45-54', '55+', 'N/A'];

function getAgeRange(birthdate: string): string {
    const age = calculateAge(birthdate);
    if (age === null) return 'N/A';
    if (age < 18) return 'N/A';
    if (age <= 24) return '18-24';
    if (age <= 34) return '25-34';
    if (age <= 44) return '35-44';
    if (age <= 54) return '45-54';
    return '55+';
}

export function useWaitlistAnalytics() {
    const supabase = useMemo(() => createClient(), []);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);

    // Demographic filters
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [nationalityFilter, setNationalityFilter] = useState<string[]>([]);
    const [ageRangeFilter, setAgeRangeFilter] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from("waitlist")
                .select("*")
                .order("created_at", { ascending: true });
            if (err) throw err;
            setSubscribers(data || []);
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
            .channel("waitlist_analytics")
            .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => { fetchData(); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchData]);

    const filteredSubscribers = useMemo(() => {
        let filtered = subscribers;

        // Time range filter
        if (timeRange === 'custom' && customRange) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(s => {
                const d = new Date(s.created_at);
                return d >= start && d <= end;
            });
        } else if (timeRange !== 'all') {
            const now = new Date();
            const cutoff = new Date();
            if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
            else if (timeRange === '30d') cutoff.setDate(now.getDate() - 30);
            else if (timeRange === '90d') cutoff.setDate(now.getDate() - 90);
            filtered = filtered.filter(s => new Date(s.created_at) >= cutoff);
        }

        // Gender filter
        if (genderFilter.length > 0) {
            filtered = filtered.filter(s => s.gender && genderFilter.includes(s.gender.toLowerCase()));
        }

        // Nationality filter
        if (nationalityFilter.length > 0) {
            filtered = filtered.filter(s => s.nationality && nationalityFilter.includes(s.nationality));
        }

        // Age range filter
        if (ageRangeFilter.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.birthdate) return false;
                const range = getAgeRange(s.birthdate);
                return ageRangeFilter.includes(range);
            });
        }

        return filtered;
    }, [subscribers, timeRange, customRange, genderFilter, nationalityFilter, ageRangeFilter]);

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

        const total = subscribers.length;
        const today = subscribers.filter(s => new Date(s.created_at) >= todayStart).length;
        const thisWeek = subscribers.filter(s => new Date(s.created_at) >= weekStart).length;
        const lastWeek = subscribers.filter(s => {
            const d = new Date(s.created_at);
            return d >= lastWeekStart && d < weekStart;
        }).length;

        const last30 = subscribers.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length;
        const prev30 = subscribers.filter(s => {
            const d = new Date(s.created_at);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).length;

        const avgDaily = last30 / 30;
        const avgDailyPrev = prev30 / 30;
        const growthRate = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : (last30 > 0 ? 100 : 0);

        return { totalSubscribers: total, growthRate, thisWeek, lastWeek, today, avgDailyRate: avgDaily, avgDailyRatePrev: avgDailyPrev };
    }, [subscribers]);

    const dailySignups: DailySignup[] = useMemo(() => {
        if (filteredSubscribers.length === 0) return [];
        const map = new Map<string, number>();
        filteredSubscribers.forEach(s => {
            const day = new Date(s.created_at).toISOString().split('T')[0];
            map.set(day, (map.get(day) || 0) + 1);
        });
        // Fill gaps
        const sorted = Array.from(map.keys()).sort();
        if (sorted.length === 0) return [];
        const start = new Date(sorted[0]);
        const end = new Date(sorted[sorted.length - 1]);
        const result: DailySignup[] = [];
        let cumulative = 0;
        // Count subscribers before the range
        if (timeRange !== 'all') {
            cumulative = subscribers.filter(s => new Date(s.created_at) < start).length;
        }
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            const count = map.get(key) || 0;
            cumulative += count;
            result.push({ date: key, count, cumulative });
        }
        return result;
    }, [filteredSubscribers, subscribers, timeRange]);

    const genderData: GenderData[] = useMemo(() => {
        const map = new Map<string, number>();
        filteredSubscribers.forEach(s => {
            const g = s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1).toLowerCase() : 'Unspecified';
            map.set(g, (map.get(g) || 0) + 1);
        });
        const total = filteredSubscribers.length || 1;
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value, percentage: Math.round((value / total) * 100) }))
            .sort((a, b) => b.value - a.value);
    }, [filteredSubscribers]);

    const ageData: AgeData[] = useMemo(() => {
        const map = new Map<string, number>();
        AGE_RANGES_LIST.forEach(r => map.set(r, 0));
        filteredSubscribers.forEach(s => {
            const range = getAgeRange(s.birthdate);
            map.set(range, (map.get(range) || 0) + 1);
        });
        const total = filteredSubscribers.length || 1;
        return AGE_RANGES_LIST.map(range => ({
            range,
            count: map.get(range) || 0,
            percentage: Math.round(((map.get(range) || 0) / total) * 100),
        }));
    }, [filteredSubscribers]);

    const averageAge = useMemo(() => {
        const ages = filteredSubscribers.map(s => calculateAge(s.birthdate)).filter((a): a is number => a !== null);
        if (ages.length === 0) return null;
        return Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length);
    }, [filteredSubscribers]);

    const nationalityData: NationalityData[] = useMemo(() => {
        const map = new Map<string, number>();
        filteredSubscribers.forEach(s => {
            const nat = s.nationality ? s.nationality.charAt(0).toUpperCase() + s.nationality.slice(1).toLowerCase() : 'Unspecified';
            map.set(nat, (map.get(nat) || 0) + 1);
        });
        const total = filteredSubscribers.length || 1;
        return Array.from(map.entries())
            .map(([nationality, count]) => ({ nationality, count, percentage: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [filteredSubscribers]);

    const dayOfWeekData: DayOfWeekData[] = useMemo(() => {
        const counts = new Array(7).fill(0);
        filteredSubscribers.forEach(s => {
            counts[new Date(s.created_at).getDay()]++;
        });
        return DAY_NAMES.map((day, i) => ({ day, shortDay: DAY_SHORT[i], count: counts[i] }));
    }, [filteredSubscribers]);

    const hourOfDayData: HourOfDayData[] = useMemo(() => {
        const counts = new Array(24).fill(0);
        filteredSubscribers.forEach(s => {
            counts[new Date(s.created_at).getHours()]++;
        });
        return counts.map((count, hour) => ({
            hour,
            label: `${hour.toString().padStart(2, '0')}:00`,
            count
        }));
    }, [filteredSubscribers]);

    const monthlyData: MonthlyData[] = useMemo(() => {
        if (subscribers.length === 0) return [];
        const map = new Map<string, number>();
        subscribers.forEach(s => {
            const d = new Date(s.created_at);
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
    }, [subscribers]);

    const emailDomainData: EmailDomainData[] = useMemo(() => {
        const map = new Map<string, number>();
        filteredSubscribers.forEach(s => {
            if (!s.email) return;
            const domain = s.email.split('@')[1]?.toLowerCase() || 'unknown';
            map.set(domain, (map.get(domain) || 0) + 1);
        });
        const total = filteredSubscribers.length || 1;
        return Array.from(map.entries())
            .map(([domain, count]) => ({ domain, count, percentage: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [filteredSubscribers]);

    const genderAgeHeatmap: GenderAgeHeatmapCell[] = useMemo(() => {
        const cells: GenderAgeHeatmapCell[] = [];
        const genders = ['Male', 'Female', 'Unspecified'];
        const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
        const map = new Map<string, number>();

        filteredSubscribers.forEach(s => {
            const g = s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1).toLowerCase() : 'Unspecified';
            const ar = getAgeRange(s.birthdate);
            if (ar === 'N/A') return;
            const key = `${g}|${ar}`;
            map.set(key, (map.get(key) || 0) + 1);
        });

        genders.forEach(gender => {
            ageRanges.forEach(ageRange => {
                cells.push({ gender, ageRange, count: map.get(`${gender}|${ageRange}`) || 0 });
            });
        });
        return cells;
    }, [filteredSubscribers]);

    const projectionData = useMemo(() => {
        if (dailySignups.length < 7) return [];
        const recent = dailySignups.slice(-30);
        const avgRate = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
        const lastCumulative = dailySignups[dailySignups.length - 1].cumulative;
        const lastDate = new Date(dailySignups[dailySignups.length - 1].date);

        const projection = [];
        projection.push({
            date: dailySignups[dailySignups.length - 1].date,
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
    }, [dailySignups]);

    const recentSignups: RecentSignup[] = useMemo(() => {
        return [...subscribers]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 15)
            .map(s => ({
                id: s.id,
                name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'N/A',
                email: s.email || 'N/A',
                nationality: s.nationality ? s.nationality.charAt(0).toUpperCase() + s.nationality.slice(1).toLowerCase() : 'N/A',
                gender: s.gender || 'N/A',
                age: calculateAge(s.birthdate),
                created_at: s.created_at,
            }));
    }, [subscribers]);

    const milestones = useMemo(() => {
        const total = subscribers.length;
        if (total === 0) return [];
        const recent30 = dailySignups.slice(-30);
        const avgRate = recent30.length > 0 ? recent30.reduce((sum, d) => sum + d.count, 0) / recent30.length : 0;
        if (avgRate === 0) return [];

        const targets = [100, 250, 500, 1000, 2500, 5000, 10000];
        return targets
            .filter(t => t > total)
            .slice(0, 3)
            .map(target => {
                const daysNeeded = Math.ceil((target - total) / avgRate);
                const date = new Date();
                date.setDate(date.getDate() + daysNeeded);
                return { target, daysNeeded, estimatedDate: date.toISOString().split('T')[0] };
            });
    }, [subscribers, dailySignups]);

    // Active filter count (for badge)
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (timeRange !== 'all') count++;
        if (genderFilter.length > 0) count++;
        if (nationalityFilter.length > 0) count++;
        if (ageRangeFilter.length > 0) count++;
        return count;
    }, [timeRange, genderFilter, nationalityFilter, ageRangeFilter]);

    return {
        isLoading,
        error,
        timeRange,
        setTimeRange,
        customRange,
        setCustomRange,
        // Demographic filters
        genderFilter,
        setGenderFilter,
        nationalityFilter,
        setNationalityFilter,
        ageRangeFilter,
        setAgeRangeFilter,
        activeFilterCount,
        fetchData,
        totalSubscribers: subscribers.length,
        kpis,
        dailySignups,
        genderData,
        ageData,
        averageAge,
        nationalityData,
        dayOfWeekData,
        hourOfDayData,
        monthlyData,
        emailDomainData,
        genderAgeHeatmap,
        projectionData,
        recentSignups,
        milestones,
    };
}
