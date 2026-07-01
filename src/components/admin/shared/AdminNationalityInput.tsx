"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { COUNTRIES, Country } from "@/lib/countries";

interface AdminNationalityInputProps {
    /** Current nationality value (country name or empty) */
    value: string;
    /** Called when nationality changes */
    onChange: (value: string) => void;
    /** Whether the input is disabled (view mode) */
    disabled?: boolean;
}

export function AdminNationalityInput({ value, onChange, disabled }: AdminNationalityInputProps) {
    const [search, setSearch] = useState(value || '');

    const suggestion = useMemo(() => {
        if (!search || value) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(search.toLowerCase())
        ) || null;
    }, [search, value]);

    // Sync search text when value changes externally
    useEffect(() => {
         
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearch(value || '');
    }, [value]);

    const flagCountry = value ? COUNTRIES.find(c => c.name === value) : null;

    if (disabled) {
        return (
            <div className="relative h-12 px-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] transition-colors flex items-center gap-3 opacity-70">
                {flagCountry && (
                    <Image src={flagCountry.flag} alt="" width={20} height={14} className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-[var(--border-medium)]" />
                )}
                <span className="text-sm text-[var(--text-primary)]">{value || '—'}</span>
            </div>
        );
    }

    return (
        <div className="relative h-12 px-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] focus-within:border-[var(--accent-gold)]/40 focus-within:bg-[var(--surface-high)] transition-colors flex items-center gap-3">
            {flagCountry && (
                <Image src={flagCountry.flag} alt="" width={20} height={14} className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-[var(--border-medium)]" />
            )}
            <div className="relative flex-1">
                {suggestion && !value && search && (
                    <div className="absolute inset-0 pointer-events-none flex items-center">
                        <span className="text-sm text-[var(--text-muted)]/50 whitespace-pre">
                            {search}<span className="text-[var(--text-muted)]/50">{suggestion.name.slice(search.length)}</span>
                        </span>
                    </div>
                )}
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSearch(val);
                        const exact = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase());
                        if (exact) {
                            onChange(exact.name);
                            setSearch(exact.name);
                        } else if (value) {
                            onChange('');
                        }
                    }}
                    onKeyDown={(e) => {
                        if ((e.key === 'Tab' || e.key === 'Enter') && suggestion && !value) {
                            e.preventDefault();
                            onChange(suggestion.name);
                            setSearch(suggestion.name);
                        }
                    }}
                    placeholder="Search country..."
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none relative z-10"
                />
            </div>
        </div>
    );
}
