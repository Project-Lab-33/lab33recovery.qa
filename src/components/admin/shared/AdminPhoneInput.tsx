"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { COUNTRIES, Country } from "@/lib/countries";

interface AdminPhoneInputProps {
    /** Country object for the phone code */
    country: Country;
    /** Called when country changes */
    onCountryChange: (country: Country) => void;
    /** Local phone number (digits only) */
    value: string;
    /** Called when phone number changes */
    onChange: (value: string) => void;
    /** Whether the input is disabled (view mode) */
    disabled?: boolean;
    /** Raw full phone string for view mode display */
    displayValue?: string;
}

/**
 * Parse a stored international phone string (e.g. "+97412345678") into
 * { country, localNumber }. Tries longest country code first.
 */
export function parseStoredPhone(fullPhone: string): { country: Country; localNumber: string } {
    const def = COUNTRIES.find(c => c.code === '+974') || COUNTRIES[0];
    if (!fullPhone || !fullPhone.startsWith('+')) return { country: def, localNumber: fullPhone || '' };
    for (let len = 4; len >= 1; len--) {
        const prefix = fullPhone.slice(0, len + 1);
        const match = COUNTRIES.find(c => c.code === prefix);
        if (match) return { country: match, localNumber: fullPhone.slice(prefix.length) };
    }
    return { country: def, localNumber: fullPhone.replace(/^\+\d*/, '') };
}

export function AdminPhoneInput({
    country, onCountryChange, value, onChange, disabled, displayValue
}: AdminPhoneInputProps) {
    const [codeSearch, setCodeSearch] = useState('');

    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCodeSearch(val);
        const match = COUNTRIES.find(c => c.code === val || c.name.toLowerCase() === val.toLowerCase());
        if (match) onCountryChange(match);
    }, [onCountryChange]);

    if (disabled) {
        const parsed = parseStoredPhone(displayValue || '');
        return (
            <div className="relative h-12 px-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] transition-colors flex items-center gap-3 opacity-70">
                <Image src={parsed.country.flag} alt="" width={20} height={14} className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-[var(--border-medium)]" />
                <span className="text-sm text-[var(--text-primary)]">{displayValue || '—'}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-0 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] focus-within:border-[var(--accent-gold)]/40 focus-within:bg-[var(--surface-high)] transition-colors">
            {/* Flag */}
            <div className="w-7 h-5 rounded-sm overflow-hidden shrink-0 border border-[var(--border-medium)] ml-4">
                <Image src={country.flag} alt="" width={28} height={20} className="w-full h-full object-cover" />
            </div>
            {/* Country code input */}
            <input
                type="text"
                value={codeSearch || country.code}
                onChange={handleCodeChange}
                onFocus={() => setCodeSearch(country.code)}
                onBlur={() => setCodeSearch('')}
                className="w-16 shrink-0 px-3 py-3 bg-transparent text-[var(--text-primary)] text-sm focus:outline-none"
            />
            <div className="h-5 w-px bg-[var(--border-medium)]" />
            {/* Phone number input */}
            <input
                type="tel"
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                placeholder={country.code === '+974' ? '1234 5678' : '123 456 7890'}
                className="flex-1 px-4 py-3 bg-transparent text-[var(--text-primary)] text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
            />
        </div>
    );
}
