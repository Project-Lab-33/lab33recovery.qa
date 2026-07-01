"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, RefreshCw, AlertOctagon } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    isDeleting: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function DeleteModal({
    isOpen,
    isDeleting,
    title = "Delete Content",
    description = "Are you sure you want to delete this content? All associated media and data will be permanently removed.",
    onConfirm,
    onClose
}: DeleteModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" aria-describedby="delete-modal-description">
                    {/* Premium Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="relative w-full max-w-md overflow-hidden"
                    >
                        {/* Glass Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] rounded-3xl border border-rose-500/15 shadow-[0_24px_80px_-20px_rgba(220,80,80,0.15)]" />

                        {/* Ambient Glow */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-400/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Content */}
                        <div className="relative">
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                        <AlertOctagon size={18} className="text-rose-500" />
                                    </div>
                                    <div>
                                        <h3 id="delete-modal-title" className="text-lg font-serif text-[var(--text-primary)] mb-0.5">
                                            {title}
                                        </h3>
                                        <p className="text-[10px] text-rose-500/50 uppercase tracking-[0.3em] font-bold">
                                            Permanent Action
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    aria-label="Close dialog"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)] hover:border-[var(--border-medium)] transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-8 py-6">
                                <p id="delete-modal-description" className="text-sm text-[var(--text-secondary)]/70 leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-[var(--border-subtle)]/30">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60 hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)] border border-transparent hover:border-[var(--border-medium)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[11px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-rose-500/20 transition-colors"
                                >
                                    {isDeleting ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
