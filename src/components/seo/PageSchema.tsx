/**
 * Per-page structured data: Service + Breadcrumb (+ optional FAQ).
 * Renders as a static inline <script> so every crawler — including ones that
 * don't run JavaScript (Bing, Perplexity, ChatGPT-Search) — can read it.
 */

type FAQ = { q: string; a: string };

type Props = {
    serviceName: string;
    serviceDescription: string;
    serviceSlug: string;          // e.g. "cold-plunge"
    breadcrumbLabel: string;      // e.g. "Cold Plunge"
    faqs?: FAQ[];                 // optional per-page FAQs
};

export default function PageSchema({
    serviceName,
    serviceDescription,
    serviceSlug,
    breadcrumbLabel,
    faqs,
}: Props) {
    const baseUrl = "https://lab33recovery.qa";
    const pageUrl = `${baseUrl}/${serviceSlug}`;

    const service = {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: serviceName,
        name: serviceName,
        description: serviceDescription,
        url: pageUrl,
        provider: {
            "@type": "HealthAndBeautyBusiness",
            name: "The Lab 33",
            url: baseUrl,
            telephone: "+97466063343",
            address: {
                "@type": "PostalAddress",
                streetAddress: "Porto Arabia, The Pearl",
                addressLocality: "Doha",
                addressRegion: "Doha",
                addressCountry: "QA",
            },
        },
        areaServed: { "@type": "Country", name: "Qatar" },
    };

    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
            { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: pageUrl },
        ],
    };

    const faqSchema = faqs && faqs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
        }
        : null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
        </>
    );
}
