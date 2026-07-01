"use client";

import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#D4AF77]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#8B7355]/5 blur-[120px] rounded-full" />
            </div>

            {/* Digital Grid Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* Central Interface */}
            <div className="relative z-20 flex flex-col items-center">
                {/* Alert Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <div className="w-20 h-20 rounded-full border border-[#D4AF77]/20 flex items-center justify-center bg-[#D4AF77]/5">
                        <AlertTriangle size={32} className="text-[#D4AF77]" />
                    </div>
                </motion.div>

                {/* Status HUD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF77] to-transparent" />
                        <span className="text-[10px] md:text-[12px] font-sans tracking-[0.8em] text-[#D4AF77] uppercase font-bold">
                            Something went wrong
                        </span>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF77] to-transparent" />
                    </div>

                    <p className="max-w-xs text-center text-[10px] md:text-[11px] font-sans text-white/40 tracking-[0.15em] leading-loose uppercase">
                        An unexpected error occurred. Please try again or return home.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <button
                            onClick={reset}
                            className="group relative flex items-center justify-center gap-3 px-8 py-3 bg-[#D4AF77]/10 border border-[#D4AF77]/30 rounded-xl backdrop-blur-3xl hover:bg-[#D4AF77]/20 hover:border-[#D4AF77]/50 transition-all duration-500"
                        >
                            <span className="text-[10px] font-sans tracking-[0.4em] text-[#D4AF77] uppercase">Try Again</span>
                        </button>

                        <Link
                            href="/"
                            className="group relative flex items-center justify-center gap-3 px-8 py-3 bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-3xl hover:border-[#D4AF77]/50 transition-all duration-500"
                        >
                            <ArrowLeft size={14} className="text-[#D4AF77] group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-sans tracking-[0.4em] text-white uppercase">Go Home</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
