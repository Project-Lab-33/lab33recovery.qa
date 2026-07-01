"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-6 max-w-md text-center"
            >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-red-400" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]/60 leading-relaxed">
                        An unexpected error occurred while loading this page.
                        Please try again or contact support if the issue persists.
                    </p>
                    {process.env.NODE_ENV === 'development' && error?.message && (
                        <p className="text-xs text-red-400/60 font-mono mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-left break-all">
                            {error.message}
                        </p>
                    )}
                </div>

                {/* Action */}
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)]/20 hover:border-[var(--accent-gold)]/40 transition-all duration-300 text-[var(--accent-gold)] text-sm font-medium"
                >
                    <RotateCcw size={14} />
                    Try Again
                </button>
            </motion.div>
        </div>
    );
}
