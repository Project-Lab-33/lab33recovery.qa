"use client";

import { motion } from "framer-motion";

export interface AdminLoaderProps {
    title?: string;
    subtitle?: string;
    fullScreen?: boolean;
    /** When true, wraps in a viewport-centered container — use for page-level loading states */
    page?: boolean;
}

export function AdminLoader({ title = "Loading Secure Records", subtitle = "Synchronizing administrative data pulse...", fullScreen = false, page = false }: AdminLoaderProps) {
    const loader = (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 z-[100] bg-[var(--background)]/80 backdrop-blur-md' : 'flex-1 w-full min-h-0'}`}>
            <div className="relative">
                {/* Outer Breathing Ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-[-20px] rounded-full border border-[var(--accent-gold)]"
                />

                {/* Main Spinning Orbit */}
                <div className="relative w-16 h-16">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute inset-0 rounded-full border-2 border-t-[var(--accent-gold)] border-r-transparent border-b-transparent border-l-transparent"
                    />

                    {/* Inner Kinetic Pulse */}
                    <motion.div
                        animate={{
                            scale: [0.8, 1.1, 0.8],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--accent-gold)]/40 to-transparent blur-[2px]"
                    />
                </div>

                {/* Shimmering Center Point */}
                <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-[var(--accent-gold)] shadow-[0_0_15px_var(--accent-gold)]" />
            </div>

            <div className="mt-12 text-center space-y-2">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-[12px] text-[var(--text-primary)] uppercase tracking-[0.5em] font-medium"
                >
                    {title}
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]"
                >
                    {subtitle}
                </motion.p>
            </div>
        </div>
    );

    if (page) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                {loader}
            </div>
        );
    }

    return loader;
}
