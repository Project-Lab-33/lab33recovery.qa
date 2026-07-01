export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function replaceVariables(html: string, vars: Record<string, string>): string {
    let result = html;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}

const ALLOWED_ORIGINS = [
    'https://lab33recovery.qa',
    'https://www.lab33recovery.qa',
];

/**
 * Checks whether the request origin is allowed.
 * Skips the check in development (mobile testing uses network IP).
 * Returns `true` if the origin is allowed, `false` if blocked.
 */
export function isOriginAllowed(request: Request): boolean {
    if (process.env.NODE_ENV === 'development') return true;

    const origin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';

    const originOk = !origin || ALLOWED_ORIGINS.some(a => origin === a);
    const refererOk = !referer || ALLOWED_ORIGINS.some(a => referer.startsWith(a));

    return originOk || refererOk;
}
