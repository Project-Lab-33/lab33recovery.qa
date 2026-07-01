"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Country, COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
    value: string;
    searchValue: string;
    onSearchChange: (val: string) => void;
    suggestion: Country | null;
    onSelect: (country: string) => void;
    hasError?: boolean;
    required?: boolean;
}

export default function CountrySelect({
    value,
    searchValue,
    onSearchChange,
    suggestion,
    onSelect,
    hasError
}: CountrySelectProps) {
    const selectedCountry = COUNTRIES.find(c => c.name === value);

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

            <div className={`relative h-12 md:h-14 px-3 sm:px-4 md:px-6 rounded-xl bg-white/[0.06] border transition-all duration-500 backdrop-blur-xl flex items-center gap-2 sm:gap-3 md:gap-4 ${hasError ? "border-red-500/50" : "border-white/[0.12] group-focus-within:border-[#D4AF77]/40 group-focus-within:bg-white/[0.08]"}`}>
                <label className={`shrink-0 text-[10px] md:text-xs font-sans tracking-[0.1em] uppercase transition-colors duration-300 ${hasError ? "text-red-400" : "text-[#D4AF77]/80 group-focus-within:text-[#D4AF77]"}`}>
                    Nation
                </label>

                <div className="h-4 w-px bg-white/10 shrink-0" />

                <div className="flex-1 min-w-0 flex items-center h-full">
                    {value && selectedCountry && (
                        <div className="w-6 h-4 rounded-sm overflow-hidden shrink-0 border border-white/10 mr-2 sm:mr-3 md:mr-4">
                            <Image src={selectedCountry.flag} alt="" width={24} height={16} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="relative flex-1 min-w-0">
                        {suggestion && !value && (
                            <div className="absolute inset-0 pointer-events-none flex items-center">
                                <span className="text-sm md:text-base font-serif text-white/30 whitespace-pre truncate">
                                    {searchValue}
                                    <span className="text-white/20">{suggestion.name.slice(searchValue.length)}</span>
                                </span>
                            </div>
                        )}
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                onSearchChange(val);
                                const exactMatch = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase());
                                if (exactMatch) {
                                    onSelect(exactMatch.name);
                                    onSearchChange(exactMatch.name);
                                } else if (value) {
                                    onSelect("");
                                }
                            }}
                            onKeyDown={(e) => {
                                if ((e.key === 'Tab' || e.key === 'Enter') && suggestion && !value) {
                                    e.preventDefault();
                                    onSelect(suggestion.name);
                                    onSearchChange(suggestion.name);
                                }
                            }}
                            placeholder="Search country..."
                            className="w-full bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none relative z-10 pr-5"
                        />
                    </div>
                </div>

                {/* HUD STATUS INDICATOR — absolutely positioned */}
                <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${value ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500/80 shadow-[0_0_6px_rgba(220,38,38,0.3)]"}`} />
                </div>
            </div>

            {/* Animated Bottom Border */}
            <motion.div
                className="absolute bottom-0 left-4 right-4 h-px"
                style={{
                    background: hasError ? "linear-gradient(90deg, transparent 0%, #dc2626 50%, transparent 100%)" : "linear-gradient(90deg, transparent 0%, #D4AF77 50%, transparent 100%)"
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                    scaleX: value ? 1 : 0,
                    opacity: value ? 1 : 0
                }}
                transition={{ duration: 0.4 }}
            />
        </motion.div>
    );
}
