import type { Metadata } from "next";
import GuidedStretchClient from "./GuidedStretchClient";

const TITLE = "Guided Stretch in Doha — Deep Tissue Bodywork | The Lab 33";
const DESCRIPTION = "Guided Stretch at The Lab 33, The Pearl, Doha. Deep tissue, myofascial release, cupping, and kinesiology taping — all from expert sports therapists.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "guided stretch doha", "guided stretch qatar",
        "stretching therapy qatar", "sports massage doha", "sports massage qatar",
        "deep tissue stretch doha", "myofascial release qatar",
        "cupping therapy qatar", "cupping doha",
        "kinesiology taping doha", "kinesiology taping qatar",
        "flexibility therapy", "The Lab 33 guided stretch", "Lab 33 guided stretch", "bodywork The Pearl",
    ],
    alternates: { canonical: "https://lab33recovery.qa/guided-stretch" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "https://lab33recovery.qa/guided-stretch",
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

export default function GuidedStretchPage() {
    return <GuidedStretchClient />;
}
