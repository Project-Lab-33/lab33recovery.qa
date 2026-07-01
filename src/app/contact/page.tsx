import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact The Lab 33 — Recovery Lab in Doha",
    description: "Get in touch with The Lab 33 — Doha's premier biohacking & recovery lab opening in Porto Arabia, The Pearl, Q2 2026.",
    keywords: [
        "contact The Lab 33", "contact Lab 33", "The Lab 33 Doha location", "recovery lab The Pearl",
        "The Lab 33 phone number", "biohacking lab Qatar contact",
    ],
    alternates: {
        canonical: "https://lab33recovery.qa/contact",
    },
    openGraph: {
        title: "Contact The Lab 33 — Recovery Lab in Doha",
        description: "Get in touch with The Lab 33 — Doha's premier biohacking & recovery lab in Porto Arabia, The Pearl.",
        url: "https://lab33recovery.qa/contact",
        siteName: "The Lab 33",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact The Lab 33",
        description: "Get in touch with The Lab 33 — Doha's premier biohacking & recovery lab in Porto Arabia, The Pearl.",
    },
};

export default function ContactPage() {
    return <ContactClient />;
}
