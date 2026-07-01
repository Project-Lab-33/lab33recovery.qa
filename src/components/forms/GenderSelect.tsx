"use client";

import { motion } from "framer-motion";

interface GenderSelectProps {
    value: string;
    onChange: (value: string) => void;
    hasError?: boolean;
}

const GENDERS = [
    {
        id: "male",
        label: "Male",
        icon: (
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="14" r="5" />
                <path d="M19 5L13.5 10.5" />
                <path d="M15 5H19V9" />
            </svg>
        )
    },
    {
        id: "female",
        label: "Female",
        icon: (
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="5" />
                <path d="M12 13V21" />
                <path d="M9 18H15" />
            </svg>
        )
    },
];

export default function GenderSelect({ value, onChange, hasError }: GenderSelectProps) {
    return (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
            {GENDERS.map((gender) => (
                <motion.button
                    key={gender.id}
                    type="button"
                    onClick={() => onChange(gender.id)}
                    className="group relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Active Glow Overlay */}
                    <motion.div
                        className="absolute -inset-[1px] rounded-2xl"
                        style={{ background: "linear-gradient(135deg, #D4AF77 0%, rgba(212,175,119,0.3) 50%, #D4AF77 100%)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: value === gender.id ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                    />

                    <div className={`relative h-12 md:h-14 rounded-xl backdrop-blur-xl transition-all duration-500 overflow-hidden ${value === gender.id
                            ? "bg-gradient-to-b from-[#D4AF77]/10 to-[#D4AF77]/5"
                            : `bg-gradient-to-b from-white/[0.04] to-white/[0.01] border ${hasError ? 'border-red-500/30' : 'border-white/[0.06]'} group-hover:border-white/[0.12] group-hover:bg-white/[0.06]`
                        }`}>
                        {/* Corner Accents */}
                        <div className="absolute top-2 left-2 w-3 h-3">
                            <div className={`absolute top-0 left-0 w-full h-px transition-colors duration-500 ${value === gender.id ? "bg-[#D4AF77]/60" : "bg-white/10 group-hover:bg-white/20"}`} />
                            <div className={`absolute top-0 left-0 w-px h-full transition-colors duration-500 ${value === gender.id ? "bg-[#D4AF77]/60" : "bg-white/10 group-hover:bg-white/20"}`} />
                        </div>
                        <div className="absolute bottom-2 right-2 w-3 h-3">
                            <div className={`absolute bottom-0 right-0 w-full h-px transition-colors duration-500 ${value === gender.id ? "bg-[#D4AF77]/60" : "bg-white/10 group-hover:bg-white/20"}`} />
                            <div className={`absolute bottom-0 right-0 w-px h-full transition-colors duration-500 ${value === gender.id ? "bg-[#D4AF77]/60" : "bg-white/10 group-hover:bg-white/20"}`} />
                        </div>

                        <div className="relative h-full flex items-center justify-center gap-2 md:gap-3">
                            <motion.div
                                className={`transition-colors duration-500 ${value === gender.id ? "text-[#D4AF77]" : "text-white/25 group-hover:text-white/40"}`}
                                animate={{ scale: value === gender.id ? 1.1 : 1 }}
                            >
                                {gender.icon}
                            </motion.div>
                            <span className={`text-[10px] md:text-[11px] font-sans tracking-[0.5em] uppercase transition-colors duration-500 ${value === gender.id ? "text-white" : "text-white/30 group-hover:text-white/50"}`}>
                                {gender.label}
                            </span>
                        </div>

                        {/* Animated Bottom Line */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF77] to-transparent"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: value === gender.id ? 1 : 0, opacity: value === gender.id ? 1 : 0 }}
                        />
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
