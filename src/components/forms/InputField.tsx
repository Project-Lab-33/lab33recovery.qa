"use client";

import { motion } from "framer-motion";

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
    hasError?: boolean;
    required?: boolean;
    className?: string;
}

export default function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    textarea = false,
    hasError,
    required = true,
    className = ""
}: InputFieldProps) {
    return (
        <motion.div
            className={`group relative ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Card Glow */}
            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                style={{
                    background: "linear-gradient(135deg, rgba(212,175,119,0.2) 0%, transparent 50%, rgba(212,175,119,0.1) 100%)"
                }}
            />

            <div className={`relative ${textarea ? "h-auto py-5 items-start" : "h-12 md:h-14 items-center"} px-3 sm:px-4 md:px-6 rounded-xl bg-white/[0.06] border transition-all duration-500 backdrop-blur-xl flex gap-2 sm:gap-3 md:gap-4 ${hasError ? "border-red-500/50" : "border-white/[0.12] group-focus-within:border-[#D4AF77]/40 group-focus-within:bg-white/[0.08]"}`}>
                <label className={`shrink-0 text-[10px] md:text-xs font-sans tracking-[0.1em] uppercase transition-colors duration-300 ${hasError ? "text-red-400" : "text-[#D4AF77]/80 group-focus-within:text-[#D4AF77]"}`}>
                    {label}
                </label>

                <div className={`w-px bg-white/10 shrink-0 ${textarea ? "h-24 mt-0" : "h-4"}`} />

                <div className="flex-1 min-w-0 flex items-center relative h-full">
                    {textarea ? (
                        <textarea
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            rows={4}
                            className="flex-1 bg-transparent text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none resize-none leading-relaxed py-1 pr-5"
                        />
                    ) : (
                        <input
                            type={type}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            className="flex-1 min-w-0 bg-transparent h-full text-sm md:text-base font-serif text-white placeholder:text-white/25 focus:outline-none pr-5"
                        />
                    )}
                </div>

                {/* HUD STATUS INDICATOR — absolutely positioned */}
                <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center">
                    {required ? (
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${value.trim() ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500/80 shadow-[0_0_6px_rgba(220,38,38,0.3)]"}`} />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    )}
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
            </div>
        </motion.div>
    );
}
