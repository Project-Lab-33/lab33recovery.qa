"use client";

import { motion } from "framer-motion";

export interface ToggleSwitchProps {
    enabled: boolean;
    onToggle: () => void;
    disabled?: boolean;
    /** Accent color when enabled — defaults to #0080FF */
    accentColor?: string;
}

export function ToggleSwitch({ enabled, onToggle, disabled, accentColor = '#0080FF' }: ToggleSwitchProps) {
    return (
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${enabled
                ? ''
                : 'bg-[var(--surface-high)] border border-[var(--border-medium)]'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={enabled ? { backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}4D` } : {}}
        >
            <motion.div
                animate={{ x: enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute top-1 w-4 h-4 rounded-full ${enabled ? 'bg-white' : 'bg-[var(--text-muted)]'}`}
            />
        </button>
    );
}
