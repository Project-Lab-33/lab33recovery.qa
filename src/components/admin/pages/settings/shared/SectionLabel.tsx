"use client";

import { motion } from "framer-motion";

const ACCENT = "#b48c50";

interface SectionLabelProps {
    icon: React.ElementType;
    label: string;
    count?: string;
    delay?: number;
    accent?: string;
}

export function SectionLabel({ icon: Icon, label, count, delay = 0, accent = ACCENT }: SectionLabelProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <Icon size={14} style={{ color: accent }} strokeWidth={1.5} />
                <label className="text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: accent }}>{label}</label>
            </div>
            {count && <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: `${accent}99` }}>{count}</span>}
        </motion.div>
    );
}
