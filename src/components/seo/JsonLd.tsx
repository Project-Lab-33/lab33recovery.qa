export default function OrganizationJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HealthAndBeautyBusiness',
        name: 'The Lab 33',
        alternateName: ['THE LAB 33', 'Lab 33', 'Lab 33 Recovery', 'LAB 33 Recovery'],
        url: 'https://lab33recovery.qa',
        logo: 'https://lab33recovery.qa/logo-meta-seo.png',
        image: 'https://lab33recovery.qa/opengraph-image.png',
        description: "Qatar's premier recovery lab in Porto Arabia, The Pearl. Cold Plunge, Hyperbaric Oxygen, Infrared Sauna, Normatec, Contrast Heat & Guided Stretch.",
        telephone: '+97466063343',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Porto Arabia, The Pearl',
            addressLocality: 'Doha',
            addressRegion: 'Doha',
            addressCountry: 'QA'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '25.3722422',
            longitude: '51.5462962'
        },
        hasMap: 'https://www.google.com/maps/place/The+LAB+33/@25.3722422,51.5462962,17z',
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '08:00',
                closes: '22:00'
            }
        ],
        sameAs: [
            'https://www.instagram.com/lab33recovery.qa/',
            'https://www.facebook.com/lab33recovery.qa/',
            'https://www.tiktok.com/@thelab33.qa',
            'https://share.google/SGE8mxi8u4TZk4dzn'
        ],
        priceRange: '$$$',
        paymentAccepted: 'Cash, Credit Card',
        currenciesAccepted: 'QAR',
        areaServed: {
            '@type': 'Country',
            name: 'Qatar'
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Recovery Services',
            itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cold Plunge', description: 'Ice bath therapy for muscle recovery and inflammation reduction' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hyperbaric Oxygen Therapy (HBOT)', description: 'O₂ Sessions in pressurised chamber for cellular recovery and longevity' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Infrared Sauna', description: 'Red light infrared therapy for circulation, sleep, and recovery' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Normatec Compression', description: 'Pneumatic compression therapy for athletic recovery' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Contrast Heat', description: 'Heat therapy alternated with cold for vascular recovery' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Guided Stretch', description: 'Sports manual therapy: massage, cupping, and kinesiology taping' } }
            ]
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
