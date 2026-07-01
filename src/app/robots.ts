import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/private/'],
            },
            {
                userAgent: ['GPTBot', 'Google-Extended', 'Claude-Web', 'Applebot-Extended', 'PerplexityBot', 'CCBot'],
                allow: '/',
            },
        ],
        sitemap: 'https://lab33recovery.qa/sitemap.xml', // User: Update if domain changes
    };
}
