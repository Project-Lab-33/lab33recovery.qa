import type { Metadata } from "next";
import HBOTClient from "./HBOTClient";

const TITLE = "Hyperbaric Oxygen Therapy (HBOT) in Qatar | The Lab 33 Doha";
const DESCRIPTION = "HBOT at The Lab 33, The Pearl, Doha. Pressurised pure-oxygen therapy for accelerated cellular recovery, sleep, and longevity. Join the waitlist.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "hyperbaric oxygen therapy qatar", "HBOT qatar", "HBOT doha",
        "hyperbaric chamber qatar", "hyperbaric chamber doha",
        "oxygen therapy qatar", "O2 sessions qatar", "O₂ sessions doha",
        "hbot recovery", "hbot benefits", "The Lab 33 HBOT", "Lab 33 HBOT", "hbot The Pearl",
    ],
    alternates: { canonical: "https://lab33recovery.qa/hbot" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "https://lab33recovery.qa/hbot",
        siteName: "The Lab 33",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
    },
};

export default function HBOTPage() {
    return <HBOTClient />;
}
