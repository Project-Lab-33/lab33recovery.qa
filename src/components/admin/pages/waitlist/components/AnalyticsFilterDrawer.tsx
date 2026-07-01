"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Globe2, Calendar } from "lucide-react";
import { COUNTRIES, Country } from "@/lib/countries";
import { GenderIcon } from "@/components/admin/shared/GenderIcon";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import type { TimeRange } from "@/components/admin/shared/types";

const AGE_RANGES = [
    { id: '18-24', label: '18–24' },
    { id: '25-34', label: '25–34' },
    { id: '35-44', label: '35–44' },
    { id: '45-54', label: '45–54' },
    { id: '55+', label: '55+' },
];

const TIME_RANGE_PRESETS: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
];

interface AnalyticsFilterDrawerProps {
    filtersVisible: boolean;
    setFiltersVisible: (v: boolean) => void;
    // Time range
    timeRange: TimeRange;
    setTimeRange: (v: TimeRange) => void;
    customRange: { start: string; end: string } | null;
    setCustomRange: (v: { start: string; end: string } | null) => void;
    // Demographic filters
    genderFilter: string[];
    setGenderFilter: React.Dispatch<React.SetStateAction<string[]>>;
    nationalityFilter: string[];
    setNationalityFilter: React.Dispatch<React.SetStateAction<string[]>>;
    ageRangeFilter: string[];
    setAgeRangeFilter: React.Dispatch<React.SetStateAction<string[]>>;
    // Count
    activeFilterCount: number;
}

export function AnalyticsFilterDrawer({
    filtersVisible, setFiltersVisible,
    timeRange, setTimeRange,
    customRange, setCustomRange,
    genderFilter, setGenderFilter,
    nationalityFilter, setNationalityFilter,
    ageRangeFilter, setAgeRangeFilter,
    activeFilterCount,
}: AnalyticsFilterDrawerProps) {
    const [natFilterSearch, setNatFilterSearch] = useState('');

    // Custom date states — stored as "yyyy-MM-dd" strings
    const [tempStart, setTempStart] = useState(customRange?.start || '');
    const [tempEnd, setTempEnd] = useState(customRange?.end || '');

    const natFilterSuggestion = useMemo(() => {
        if (!natFilterSearch) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(natFilterSearch.toLowerCase()) &&
            !nationalityFilter.includes(c.name)
        ) || null;
    }, [natFilterSearch, nationalityFilter]);

    const clearAll = () => {
        setTimeRange('all');
        setCustomRange(null);
        setTempStart('');
        setTempEnd('');
        setGenderFilter([]);
        setNationalityFilter([]);
        setAgeRangeFilter([]);
        setNatFilterSearch('');
    };

    const handleApplyCustomRange = () => {
        if (tempStart && tempEnd) {
            setCustomRange({ start: tempStart.split('T')[0], end: tempEnd.split('T')[0] });
            setTimeRange('custom');
        }
    };

    const handleClearCustomRange = () => {
        setTempStart('');
        setTempEnd('');
        setCustomRange(null);
        if (timeRange === 'custom') setTimeRange('all');
    };

    const filterFooter = (
        <div className="px-8 py-6 border-t border-[var(--border-strong)]/60 flex items-center justify-between shrink-0">
            <button type="button" onClick={clearAll}
                className="h-12 px-7 rounded-2xl text-[13px] font-bold uppercase tracking-[0.12em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-colors">
                Clear All
            </button>
            <button type="button" onClick={() => setFiltersVisible(false)}
                className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[13px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-[var(--accent-gold)]/25 hover:shadow-[var(--accent-gold)]/45 hover:scale-[1.02] active:scale-[0.98] transition-colors">
                Apply Filters
            </button>
        </div>
    );

    return (
        <AdminDrawer
            isOpen={filtersVisible}
            onClose={() => setFiltersVisible(false)}
            subtitle={`${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''} applied`}
            title="Filter Analytics"
            width="680px"
            footer={filterFooter}
            bodyClassName="space-y-8"
        >
            {/* Time Range */}
            <FilterSection title="Time Range">
                <div className="grid grid-cols-5 gap-3">
                    {TIME_RANGE_PRESETS.map(opt => {
                        const isSelected = timeRange === opt.value;
                        return (
                            <button key={opt.value} type="button"
                                onClick={() => { setTimeRange(opt.value); setCustomRange(null); setTempStart(''); setTempEnd(''); }}
                                className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border ${isSelected
                                    ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                                    : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                                    }`}>
                                {opt.label}
                            </button>
                        );
                    })}
                    {/* Custom button — 5th in the grid */}
                    <button type="button"
                        onClick={() => {
                            if (timeRange === 'custom') {
                                handleClearCustomRange();
                            } else {
                                setTimeRange('custom');
                            }
                        }}
                        className={`h-12 px-3 rounded-xl text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${timeRange === 'custom'
                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-[0_8px_20px_rgba(212,175,119,0.3)]'
                            : 'bg-[var(--surface-high)]/60 text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)]'
                            }`}>
                        <Calendar size={13} />
                        Custom
                    </button>
                </div>

                {/* Custom Date Range — revealed when Custom is selected */}
                <AnimatePresence>
                    {timeRange === 'custom' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">From</label>
                                        <DateTimePicker
                                            value={tempStart || null}
                                            onChange={(v) => setTempStart(v)}
                                            dateOnly
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">To</label>
                                        <DateTimePicker
                                            value={tempEnd || null}
                                            onChange={(v) => setTempEnd(v)}
                                            dateOnly
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <button type="button" onClick={handleApplyCustomRange}
                                        disabled={!tempStart || !tempEnd}
                                        className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-gold)]/20 hover:shadow-[var(--accent-gold)]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-colors">
                                        Apply Range
                                    </button>
                                    {customRange && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[var(--accent-gold)] font-medium italic">
                                                {customRange.start} — {customRange.end}
                                            </span>
                                            <button type="button" onClick={handleClearCustomRange}
                                                className="text-[11px] font-bold uppercase tracking-wider text-rose-500/60 hover:text-rose-400 transition-colors">
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </FilterSection>

            {/* Gender */}
            <FilterSection title="Gender" columns={2}>
                {['male', 'female'].map((g) => {
                    const isSelected = genderFilter.includes(g);
                    return (
                        <FilterPill
                            key={g}
                            label={g.charAt(0).toUpperCase() + g.slice(1)}
                            iconNode={<GenderIcon gender={g} selected={isSelected} />}
                            isSelected={isSelected}
                            onClick={() => setGenderFilter(prev => isSelected ? prev.filter(x => x !== g) : [...prev, g])}
                        />
                    );
                })}
            </FilterSection>

            {/* Nationality */}
            <FilterSection title="Nationality">
                <div className="relative h-12 px-5 rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-medium)] focus-within:border-[var(--accent-gold)]/40 focus-within:bg-[var(--surface-high)]/60 transition-colors duration-300 flex items-center gap-3">
                    <Globe2 size={16} className="text-[var(--accent-gold)]/60 shrink-0" />
                    <div className="h-4 w-px bg-[var(--border-medium)]" />
                    <div className="relative flex-1">
                        {natFilterSuggestion && natFilterSearch && (
                            <div className="absolute inset-0 pointer-events-none flex items-center">
                                <span className="text-sm font-serif text-[var(--text-muted)]/50 whitespace-pre">
                                    {natFilterSearch}
                                    <span className="text-[var(--text-muted)]/50">{natFilterSuggestion.name.slice(natFilterSearch.length)}</span>
                                </span>
                            </div>
                        )}
                        <input type="text" value={natFilterSearch}
                            onChange={(e) => setNatFilterSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.key === 'Tab' || e.key === 'Enter') && natFilterSuggestion) {
                                    e.preventDefault();
                                    setNationalityFilter(prev => [...prev, natFilterSuggestion.name]);
                                    setNatFilterSearch('');
                                }
                            }}
                            placeholder="Type country name..."
                            className="w-full bg-transparent text-sm font-serif text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 focus:outline-none relative z-10"
                        />
                    </div>
                    {natFilterSearch && (
                        <button type="button" onClick={() => setNatFilterSearch('')}
                            className="p-1 rounded-lg text-[var(--text-muted)]/50 hover:text-[var(--text-secondary)] transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
                {nationalityFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {nationalityFilter.map((nat) => {
                            const countryData = COUNTRIES.find(c => c.name === nat);
                            return (
                                <motion.div key={nat} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-lg bg-gradient-to-r from-[var(--accent-gold)]/15 to-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
                                    {countryData && <Image src={countryData.flag} alt="" width={16} height={12} className="w-4 h-3 object-cover rounded-sm" />}
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{nat}</span>
                                    <button type="button" onClick={() => setNationalityFilter(prev => prev.filter(x => x !== nat))}
                                        className="p-0.5 rounded hover:bg-[var(--surface-high)] transition-colors ml-1">
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </FilterSection>

            {/* Age Range */}
            <FilterSection title="Age Range" columns={3}>
                {AGE_RANGES.map((range) => (
                    <FilterPill
                        key={range.id}
                        label={range.label}
                        isSelected={ageRangeFilter.includes(range.id)}
                        onClick={() => setAgeRangeFilter(prev => ageRangeFilter.includes(range.id) ? prev.filter(x => x !== range.id) : [...prev, range.id])}
                    />
                ))}
            </FilterSection>
        </AdminDrawer>
    );
}

