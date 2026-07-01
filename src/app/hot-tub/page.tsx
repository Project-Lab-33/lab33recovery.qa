import type { Metadata } from "next";
import HotTubClient from "./HotTubClient";

const TITLE = "Contrast Heat Therapy in Qatar — Hot Tub Recovery | The Lab 33";
const DESCRIPTION = "Contrast Heat at The Lab 33, The Pearl, Doha. Hot water therapy paired with cold plunge to relax muscles, boost circulation, and amplify recovery.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "contrast heat therapy", "contrast therapy qatar", "contrast bath doha",
        "hot tub qatar", "hot tub doha", "hot water recovery qatar",
        "hydrotherapy doha", "heat therapy qatar", "hot tub cold plunge combo",
        "muscle relaxation therapy", "The Lab 33 contrast heat", "Lab 33 contrast heat", "The Lab 33 hot tub", "Lab 33 hot tub",
    ],
    alternates: { canonical: "https://lab33recovery.qa/hot-tub" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "https://lab33recovery.qa/hot-tub",
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

export default function HotTubPage() {
    return <HotTubClient />;
}
