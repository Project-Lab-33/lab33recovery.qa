import { Metadata } from "next";
import HiringClient from "./HiringClient";

export const metadata: Metadata = {
    title: "Careers",
    description: "Join Qatar's premier biohacking & recovery lab. Explore open positions at The Lab 33 in The Pearl, Doha. We're looking for distinguished professionals in wellness, recovery, and operations.",
    keywords: [
        "The Lab 33 careers", "Lab 33 careers", "jobs The Lab 33 Qatar", "jobs Lab 33 Qatar", "wellness jobs Doha",
        "recovery lab careers", "The Pearl jobs", "biohacking careers Qatar",
        "The Lab 33 hiring", "Lab 33 hiring", "Porto Arabia employment",
    ],
    alternates: {
        canonical: "https://lab33recovery.qa/hiring",
    },
    openGraph: {
        title: "Careers",
        description: "Join Qatar's premier biohacking & recovery lab. Explore open positions at The Lab 33 in The Pearl, Doha.",
        url: "https://lab33recovery.qa/hiring",
        siteName: "The Lab 33",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Careers",
        description: "Join Qatar's premier biohacking & recovery lab. Explore open positions at The Lab 33 in The Pearl, Doha.",
    },
};

export default function HiringPage() {
    return <HiringClient />;
}
