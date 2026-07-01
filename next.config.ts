import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Allow cross-origin requests during development
  allowedDevOrigins: ['192.168.101.2', 'http://192.168.101.2', 'http://192.168.101.2:3000'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn-us.com',
      },
    ],
    dangerouslyAllowSVG: true,
    // Configure allowed image quality values
    qualities: [75, 90],
  },

  // ─── Production Caching & Security Headers ───
  async headers() {
    return [
      // ── Static assets (fonts, images, textures) — immutable, 1 year ──
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/textures/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ── Logos & icons — long cache with revalidation ──
      {
        source: '/:path*.(png|ico|webp|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // ── Service Worker — never cache (must always be fresh) ──
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // ── SEO files — moderate cache ──
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // ── Global security headers (production only) ──
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/:path*' as const,
              headers: [
                // Prevent clickjacking (SAMEORIGIN allows our own iframes like Google Maps)
                {
                  key: 'X-Frame-Options',
                  value: 'SAMEORIGIN',
                },
                // Prevent MIME type sniffing
                {
                  key: 'X-Content-Type-Options',
                  value: 'nosniff',
                },
                // Control referrer information
                {
                  key: 'Referrer-Policy',
                  value: 'strict-origin-when-cross-origin',
                },
                // Permissions policy — disable unused browser features
                {
                  key: 'Permissions-Policy',
                  value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
                },
                // Strict transport security — enforce HTTPS
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
                // XSS protection (legacy browsers)
                {
                  key: 'X-XSS-Protection',
                  value: '1; mode=block',
                },
                // Content Security Policy
                {
                  key: 'Content-Security-Policy',
                  value: [
                    "default-src 'self'",
                    // unsafe-inline is required for Next.js hydration scripts.
                    // unsafe-eval has been REMOVED — it is not needed in production.
                    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "img-src 'self' data: blob: https://flagcdn.com https://*.supabase.co",
                    "font-src 'self' https://fonts.gstatic.com",
                    "connect-src 'self' https://*.supabase.co https://api.resend.com https://api.open-meteo.com https://va.vercel-scripts.com",
                    "worker-src 'self' blob:",
                    "frame-src https://www.google.com https://maps.google.com",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "upgrade-insecure-requests",
                  ].join('; '),
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
