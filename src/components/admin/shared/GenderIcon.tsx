"use client";

// When `selected` is true, the icon uses white color to be visible on gold background.
export const GenderIcon = ({ gender, selected }: { gender: string; selected?: boolean }) => {
    const colorClass = selected ? 'text-white' : 'text-[var(--accent-gold)]/40';

    if (gender?.toLowerCase() === 'male') {
        return (
            <svg className={`w-3.5 h-3.5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="10" cy="14" r="5" />
                <path d="M19 5L13.5 10.5" />
                <path d="M15 5H19V9" />
            </svg>
        );
    }
    if (gender?.toLowerCase() === 'female') {
        return (
            <svg className={`w-3.5 h-3.5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="8" r="5" />
                <path d="M12 13V21" />
                <path d="M9 18H15" />
            </svg>
        );
    }
    return <span className="text-[10px] text-[var(--text-muted)]">-</span>;
};
