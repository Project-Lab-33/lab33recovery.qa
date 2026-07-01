"use client";

interface AdminFieldLabelProps {
    children: React.ReactNode;
}

export function AdminFieldLabel({ children }: AdminFieldLabelProps) {
    return (
        <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
            {children}
        </label>
    );
}
