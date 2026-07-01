import type { Metadata } from "next";
import NormatecClient from "./NormatecClient";

const TITLE = "Normatec Compression in Qatar — Athlete Recovery | The Lab 33";
const DESCRIPTION = "Normatec pneumatic compression at The Lab 33, The Pearl, Doha. The recovery tool used by elite athletes — flush soreness and get back to full speed faster.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "normatec qatar", "normatec doha",
        "compression therapy qatar", "compression therapy doha",
        "pneumatic compression doha", "leg recovery therapy",
        "athlete recovery qatar", "athlete recovery doha",
        "normatec boots qatar", "The Lab 33 normatec", "Lab 33 normatec",
        "normatec The Pearl", "normatec Porto Arabia",
    ],
    alternates: { canonical: "https://lab33recovery.qa/normatec" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "https://lab33recovery.qa/normatec",
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

export default function NormatecPage() {
    return <NormatecClient />;
}
