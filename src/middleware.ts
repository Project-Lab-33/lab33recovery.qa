import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { PUBLIC_RATE_LIMIT, ADMIN_RATE_LIMIT, AUTH_RATE_LIMIT } from '@/lib/constants'
import { checkRateLimit, getRequestIP } from '@/lib/rateLimit'

// ── Env var validation (fail fast at import time) ──
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
        'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Add them to .env.local (see .env.example).'
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getRequestIP(request);

    // ── Rate limit public form submissions (5 per minute per IP) ──
    if (
        (pathname.startsWith('/api/waitlist') || pathname.startsWith('/api/apply')) &&
        request.method === 'POST'
    ) {
        const { limited } = await checkRateLimit(`public:${ip}`, PUBLIC_RATE_LIMIT);
        if (limited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }
    }

    // ── Rate limit auth login attempts ──
    if (pathname === '/api/admin/login' && request.method === 'POST') {
        const { limited } = await checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT);
        if (limited) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            );
        }
    }

    // ── Rate limit admin API routes ──
    if (pathname.startsWith('/api/admin/')) {
        const { limited } = await checkRateLimit(`admin:${ip}`, ADMIN_RATE_LIMIT);
        if (limited) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
    ],
}
