"use client";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Show red border for form validation errors */
    hasError?: boolean;
}

export function AdminInput({ hasError, className, ...props }: AdminInputProps) {
    return (
        <input
            {...props}
            className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-mid)] border text-[var(--text-primary)] text-sm focus:outline-none placeholder:text-[var(--text-muted)] transition-colors disabled:opacity-70 disabled:cursor-default ${hasError
                    ? 'border-red-500/50'
                    : 'border-[var(--border-medium)] focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)]'
                } ${className || ''}`}
        />
    );
}
