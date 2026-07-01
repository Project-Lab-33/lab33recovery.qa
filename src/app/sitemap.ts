import { MetadataRoute } from 'next';

/**
 * Stable lastModified dates per page.
 * Update the date for a route when its content materially changes —
 * not on every build (which is what `new Date()` would do, defeating
 * the purpose of lastmod for crawlers).
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://lab33recovery.qa';

    // Last meaningful content update per route.
    const lastUpdated = {
        home: new Date('2026-04-27'),
        modalities: new Date('2026-04-27'),  // SEO uplift + JSON-LD per-modality schemas
        about: new Date('2026-04-16'),
        contact: new Date('2026-04-16'),
        waitlist: new Date('2026-02-05'),
        hiring: new Date('2026-04-16'),
        legal: new Date('2026-02-10'),
    };

    return [
        {
            url: baseUrl,
            lastModified: lastUpdated.home,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/cold-plunge`,
            lastModified: lastUpdated.modalities,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/hbot`,
            lastModified: lastUpdated.modalities,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/red-light-sauna`,
            lastModified: lastUpdated.modalities,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/hot-tub`,
            lastModified: lastUpdated.modalities,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/normatec`,
            lastModified: lastUpdated.modalities,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/guided-stretch`,
            lastModified: lastUpdated.modalities,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/waitlist`,
            lastModified: lastUpdated.waitlist,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/hiring`,
            lastModified: lastUpdated.hiring,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: lastUpdated.about,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: lastUpdated.contact,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: lastUpdated.legal,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: lastUpdated.legal,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
