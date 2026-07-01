import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
    title: "About",
    description:
        "Doha's premier biohacking and recovery lab, nestled in The Pearl–Porto Arabia. Discover the science, the story, and the philosophy behind The Lab 33.",
    keywords: [
        "about The Lab 33", "The Lab 33 story", "about Lab 33", "Lab 33 story", "biohacking lab Doha",
        "recovery science Qatar", "The Pearl wellness center",
    ],
    alternates: {
        canonical: "https://lab33recovery.qa/about",
    },
    openGraph: {
        title: "About | The Lab 33 — Future of Recovery",
        description:
            "Doha's premier biohacking and recovery lab, nestled in The Pearl–Porto Arabia. Discover the science, the story, and the philosophy behind The Lab 33.",
        url: "https://lab33recovery.qa/about",
        siteName: "The Lab 33",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About | The Lab 33",
        description:
            "Doha's premier biohacking and recovery lab, nestled in The Pearl–Porto Arabia. Discover the science, the story, and the philosophy behind The Lab 33.",
    },
};

export default function AboutPage() {
    return <AboutClient />;
}
