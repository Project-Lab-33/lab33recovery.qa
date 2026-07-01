"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, RefreshCw } from "lucide-react";

export interface ExportOverlayProps {
    /** Whether the overlay is visible */
    isVisible: boolean;
    /** Primary label — e.g. "Generating PDF" */
    title?: string;
    /** Secondary hint — e.g. "Preparing your export…" */
    subtitle?: string;
}

export function ExportOverlay({
    isVisible,
    title = "Generating PDF",
    subtitle = "Preparing your export…",
}: ExportOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Premium Backdrop — matches DeleteModal / AdminDrawer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="relative w-full max-w-sm overflow-hidden"
                    >
                        {/* Glass Background — drawer gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] rounded-3xl border border-[var(--accent-gold)]/15 shadow-[0_24px_80px_-20px_rgba(212,175,119,0.15)]" />

                        {/* Ambient Glow */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--accent-gold)]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[var(--accent-gold)]/3 rounded-full blur-3xl pointer-events-none" />

                        {/* Content */}
                        <div className="relative">
                            {/* Header */}
                            <div className="flex items-center gap-4 px-8 py-6 border-b border-[var(--border-subtle)]/50">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center">
                                    <FileText size={18} className="text-[var(--accent-gold)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif text-[var(--text-primary)] mb-0.5">
                                        {title}
                                    </h3>
                                    <p className="text-[10px] text-[var(--accent-gold)]/50 uppercase tracking-[0.3em] font-bold">
                                        Export in progress
                                    </p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-8 py-8 flex flex-col items-center gap-6">
                                {/* Progress Ring */}
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    {/* Ambient ring */}
                                    <div className="absolute inset-0 rounded-full border-2 border-[var(--border-subtle)]/30" />
                                    {/* Spinning ring */}
                                    <div
                                        className="absolute inset-0 rounded-full border-2 border-transparent"
                                        style={{
                                            borderTopColor: 'var(--accent-gold)',
                                            borderRightColor: 'var(--accent-gold)',
                                            animation: 'export-spin 1s cubic-bezier(0.55, 0.1, 0.25, 1) infinite',
                                        }}
                                    />
                                    {/* Secondary ring */}
                                    <div
                                        className="absolute inset-2 rounded-full border border-transparent"
                                        style={{
                                            borderTopColor: 'rgba(var(--accent-gold-rgb, 212,175,119), 0.3)',
                                            animation: 'export-spin 1.6s linear infinite reverse',
                                        }}
                                    />
                                    {/* Center spinner */}
                                    <RefreshCw size={20} className="text-[var(--accent-gold)] animate-spin" />
                                </div>

                                {/* Status Text */}
                                <div className="text-center space-y-1.5">
                                    <p className="text-sm text-[var(--text-secondary)]/70 leading-relaxed">
                                        {subtitle}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full max-w-[200px] h-1 rounded-full bg-[var(--surface-high)] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent-gold)]/60 to-[var(--accent-gold)]"
                                        style={{
                                            animation: 'export-progress 2s ease-in-out infinite',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Scoped animations */}
                    <style>{`
                        @keyframes export-spin { to { transform: rotate(360deg); } }
                        @keyframes export-progress {
                            0% { width: 0%; margin-left: 0%; }
                            50% { width: 70%; margin-left: 15%; }
                            100% { width: 0%; margin-left: 100%; }
                        }
                    `}</style>
                </div>
            )}
        </AnimatePresence>
    );
}
