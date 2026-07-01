"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Country } from "@/lib/countries";

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    country: Country;
    onCountrySearch: (val: string) => void;
    countrySearchValue: string;
    hasError?: boolean;
    duplicateError?: string | null;
    required?: boolean;
}

export default function PhoneInput({
    value,
    onChange,
    country,
    onCountrySearch,
    countrySearchValue,
    hasError,
    duplicateError
}: PhoneInputProps) {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        let formatted = '';

        if (country.code === '+974') {
            formatted = digits.slice(0, 8).replace(/(\d{4})(\d{0,4})/, (_, g1, g2) => g2 ? `${g1} ${g2}` : g1);
        } else if (country.code === '+1') {
            formatted = digits.slice(0, 10).replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join(' '));
        } else {
            formatted = digits.slice(0, 12).replace(/(\d{4})/g, '$1 ').trim();
        }
        onChange(formatted);
    };

    return (
        <motion.div
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Card Glow */}
            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                style={{
                    background: "linear-gradient(135deg, rgba(212,175,119,0.2) 0%, transparent 50%, rgba(212,175,119,0.1) 100%)"
                }}
            />

            <div className={`relative h-12 md:h-14 px-3 sm:px-4 md:px-6 rounded-xl bg-white/[0.06] border transition-all duration-500 backdrop-blur-xl flex items-center gap-2 sm:gap-3 md:gap-4 ${hasError || duplicateError ? "border-red-500/50" : "border-white/[0.12] group-focus-within:border-[#D4AF77]/40 group-focus-within:bg-white/[0.08]"}`}>
                <label className={`shrink-0 text-[10px] md:text-xs font-sans tracking-[0.1em] uppercase transition-colors duration-300 ${hasError || duplicateError ? "text-red-400" : "text-[#D4AF77]/80 group-focus-within:text-[#D4AF77]"}`}>
                    Phone
                </label>

                <div className="h-4 w-px bg-white/10 shrink-0" />

                <div className="flex-1 min-w-0 flex items-center h-full">
                    {country && (
                        <div className="w-6 h-4 rounded-sm overflow-hidden shrink-0 border border-white/10 mr-2 sm:mr-3 md:mr-4">
                            <Image src={country.flag} alt={country.name} width={24} height={16} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <input
                        type="text"
                        value={countrySearchValue || country.code}
                        onChange={(e) => onCountrySearch(e.target.value)}
                        onFocus={() => onCountrySearch(country.code)}
                        className="w-12 sm:w-14 md:w-16 shrink-0 bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none"
                    />

                    <div className="h-4 w-px bg-white/10 mx-1 sm:mx-2 md:mx-4 shrink-0" />

                    <input
                        type="tel"
                        value={value}
                        onChange={handlePhoneChange}
                        placeholder={country.code === '+974' ? '1234 5678' : '123 456 7890'}
                        className="flex-1 min-w-0 bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none pr-5"
                    />
                </div>

                {/* HUD STATUS INDICATOR — absolutely positioned */}
                <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${value.trim() ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500/80 shadow-[0_0_6px_rgba(220,38,38,0.3)]"}`} />
                </div>

                {/* Animated Bottom Border */}
                <motion.div
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{
                        background: (hasError || duplicateError) ? "linear-gradient(90deg, transparent 0%, #dc2626 50%, transparent 100%)" : "linear-gradient(90deg, transparent 0%, #D4AF77 50%, transparent 100%)"
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: value ? 1 : 0,
                        opacity: value ? 1 : 0
                    }}
                    transition={{ duration: 0.4 }}
                />
            </div>
        </motion.div>
    );
}
