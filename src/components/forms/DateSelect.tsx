"use client";

import { motion } from "framer-motion";
import { RefObject } from "react";

interface DateSelectProps {
    dayValue: string;
    monthValue: string;
    yearValue: string;
    onDayChange: (val: string) => void;
    onMonthChange: (val: string) => void;
    onYearChange: (val: string) => void;
    dayRef: RefObject<HTMLInputElement | null>;
    monthRef: RefObject<HTMLInputElement | null>;
    yearRef: RefObject<HTMLInputElement | null>;
    hasError?: boolean;
    required?: boolean;
}

export default function DateSelect({
    dayValue,
    monthValue,
    yearValue,
    onDayChange,
    onMonthChange,
    onYearChange,
    dayRef,
    monthRef,
    yearRef,
    hasError
}: DateSelectProps) {
    return (
        <motion.div
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                    Birth
                </label>

                <div className="h-4 w-px bg-white/10 shrink-0" />

                <div className="flex-1 min-w-0 flex items-center h-full">
                    <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
                        <input
                            ref={dayRef}
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder="DD"
                            value={dayValue}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                onDayChange(val);
                                if (val.length === 2) monthRef.current?.focus();
                            }}
                            className="w-8 md:w-10 bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none text-center"
                        />
                        <span className="text-white/20 text-sm">/</span>
                        <input
                            ref={monthRef}
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder="MM"
                            value={monthValue}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                onMonthChange(val);
                                if (val.length === 2) yearRef.current?.focus();
                            }}
                            className="w-8 md:w-10 bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none text-center"
                        />
                        <span className="text-white/20 text-sm">/</span>
                        <input
                            ref={yearRef}
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="YYYY"
                            value={yearValue}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                onYearChange(val);
                            }}
                            className="w-10 md:w-16 bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none text-center"
                        />
                    </div>
                </div>

                {/* HUD STATUS INDICATOR — absolutely positioned */}
                <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${(dayValue && monthValue && yearValue) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500/80 shadow-[0_0_6px_rgba(220,38,38,0.3)]"}`} />
                </div>

                {/* Animated Bottom Border */}
                <motion.div
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{
                        background: hasError ? "linear-gradient(90deg, transparent 0%, #dc2626 50%, transparent 100%)" : "linear-gradient(90deg, transparent 0%, #D4AF77 50%, transparent 100%)"
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: (dayValue || monthValue || yearValue) ? 1 : 0,
                        opacity: (dayValue || monthValue || yearValue) ? 1 : 0
                    }}
                    transition={{ duration: 0.4 }}
                />
            </div>
        </motion.div>
    );
}
