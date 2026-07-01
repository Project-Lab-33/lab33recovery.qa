"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, Globe2 } from "lucide-react";
import { COUNTRIES, Country } from "@/lib/countries";
import { GenderIcon } from "@/components/admin/shared/GenderIcon";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import { DateTimePicker } from "@/components/admin/shared/DateTimePicker";

const AGE_RANGES = [
    { id: '18-24', label: '18–24' },
    { id: '25-34', label: '25–34' },
    { id: '35-44', label: '35–44' },
    { id: '45-54', label: '45–54' },
    { id: '55+', label: '55+' },
];

interface WaitlistFilterDrawerProps {
    filtersVisible: boolean;
    setFiltersVisible: (v: boolean) => void;
    genderFilter: string[];
    setGenderFilter: React.Dispatch<React.SetStateAction<string[]>>;
    nationalityFilter: string[];
    setNationalityFilter: React.Dispatch<React.SetStateAction<string[]>>;
    ageRangeFilter: string[];
    setAgeRangeFilter: React.Dispatch<React.SetStateAction<string[]>>;
    dateFromFilter: string;
    setDateFromFilter: (v: string) => void;
    dateToFilter: string;
    setDateToFilter: (v: string) => void;
    activeFilterCount: number;
}

export function WaitlistFilterDrawer({
    filtersVisible, setFiltersVisible,
    genderFilter, setGenderFilter,
    nationalityFilter, setNationalityFilter,
    ageRangeFilter, setAgeRangeFilter,
    dateFromFilter, setDateFromFilter,
    dateToFilter, setDateToFilter,
    activeFilterCount,
}: WaitlistFilterDrawerProps) {
    const [natFilterSearch, setNatFilterSearch] = useState('');

    const natFilterSuggestion = useMemo(() => {
        if (!natFilterSearch) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(natFilterSearch.toLowerCase()) &&
            !nationalityFilter.includes(c.name)
        ) || null;
    }, [natFilterSearch, nationalityFilter]);

    const clearAll = () => {
        setGenderFilter([]);
        setNationalityFilter([]);
        setAgeRangeFilter([]);
        setDateFromFilter('');
        setDateToFilter('');
        setNatFilterSearch('');
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
            title="Filter Subscribers"
            width="680px"
            footer={filterFooter}
            bodyClassName="space-y-8"
        >
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

            {/* Date Joined */}
            <FilterSection title="Date Joined">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">From</label>
                        <DateTimePicker
                            value={dateFromFilter || null}
                            onChange={(v) => setDateFromFilter(v)}
                            dateOnly
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60">To</label>
                        <DateTimePicker
                            value={dateToFilter || null}
                            onChange={(v) => setDateToFilter(v)}
                            dateOnly
                        />
                    </div>
                </div>
            </FilterSection>
        </AdminDrawer>
    );
}

