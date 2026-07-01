export const APP_NAME = 'The Lab 33';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate Limiting
export const PUBLIC_RATE_LIMIT = 5;       // per minute per IP
export const ADMIN_RATE_LIMIT = 60;       // per minute per IP
export const AUTH_RATE_LIMIT = 10;        // per minute per IP

// Analytics
export const DEFAULT_TIME_RANGE = '30d' as const;
export const CHART_ANIMATION_DURATION = 300; // ms

// Formatting
export const DATE_FORMAT = {
    short: 'MMM d',
    medium: 'MMM d, yyyy',
    full: 'MMMM d, yyyy',
    datetime: 'MMM d, yyyy HH:mm',
} as const;
