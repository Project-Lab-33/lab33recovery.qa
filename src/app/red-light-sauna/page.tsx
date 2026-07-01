import type { Metadata } from "next";
import RedLightSaunaClient from "./RedLightSaunaClient";

const TITLE = "Infrared Sauna in Qatar — Red Light Therapy | The Lab 33 Doha";
const DESCRIPTION = "Infrared Sauna at The Lab 33, The Pearl, Doha. Red light therapy for circulation, sleep, recovery, and skin — without the brutal heat of a traditional sauna.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "infrared sauna qatar", "infrared sauna doha",
        "red light therapy qatar", "red light therapy doha",
        "red light sauna qatar", "sauna qatar",
        "photobiomodulation doha", "LED therapy qatar",
        "skin rejuvenation therapy doha", "The Lab 33 infrared sauna", "Lab 33 infrared sauna",
        "infrared sauna The Pearl", "infrared sauna Porto Arabia",
    ],
    alternates: { canonical: "https://lab33recovery.qa/red-light-sauna" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "https://lab33recovery.qa/red-light-sauna",
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

export default function RedLightSaunaPage() {
    return <RedLightSaunaClient />;
}
