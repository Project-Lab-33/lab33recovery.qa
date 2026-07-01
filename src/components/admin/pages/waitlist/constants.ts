export const ANALYTICS_CHART_THEME = {
    gold: 'var(--accent-gold)',
    surface: 'var(--surface-high)',
    border: 'var(--border-medium)',
    text: 'var(--text-primary)',
    muted: 'var(--text-muted)',
} as const;

// Gender chart colors — semantic data visualization
export const GENDER_COLORS: Record<string, string> = {
    'Male': 'var(--chart-male, #5B8DEF)',
    'Female': 'var(--chart-female, #E85D9C)',
    'Unspecified': 'var(--chart-neutral, #6B7280)',
} as const;

// Heatmap text colors
export const HEATMAP_TEXT = {
    bright: 'var(--text-primary)',
    dim: 'var(--text-muted)',
} as const;
