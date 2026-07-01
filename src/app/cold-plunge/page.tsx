import type { Metadata } from "next";
import ColdPlungeClient from "./ColdPlungeClient";

const TITLE = "Cold Plunge in Qatar — Ice Bath Therapy at The Pearl | The Lab 33";
const DESCRIPTION = "Cold Plunge at The Lab 33, Porto Arabia. Precision ice bath therapy in Doha — calibrated for muscle recovery, mental clarity, and peak performance. Join the waitlist.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "cold plunge qatar", "cold plunge doha", "ice bath qatar", "ice bath doha",
        "cold water therapy qatar", "cold immersion doha", "cryotherapy qatar",
        "cold plunge benefits", "muscle recovery qatar", "The Lab 33 cold plunge", "Lab 33 cold plunge",
        "cold plunge The Pearl", "cold plunge porto arabia",
    ],
    alternates: { canonical: "https://lab33recovery.qa/cold-plunge" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "https://lab33recovery.qa/cold-plunge",
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

export default function ColdPlungePage() {
    return <ColdPlungeClient />;
}
