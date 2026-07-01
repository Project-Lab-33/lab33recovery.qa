"use client";

import { motion } from "framer-motion";

export default function Copyright() {
    const currentYear = new Date().getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
        >
            <div className="flex flex-col items-center gap-1">
                <span className="text-[7px] md:text-[10px] font-mono text-[#78716C] tracking-[0.25em] md:tracking-[0.5em] uppercase whitespace-nowrap">
                    © {currentYear} LAB 33 — FUTURE OF RECOVERY
                </span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#8B7355]/30 to-transparent" />
            </div>
        </motion.div>
    );
}
