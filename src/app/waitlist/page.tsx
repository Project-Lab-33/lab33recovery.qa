import { Metadata } from "next";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

export const metadata: Metadata = {
    title: "Join the Waitlist",
    description: "Be the first to experience Doha's premier biohacking & recovery lab. Join The Lab 33 waitlist for exclusive early access to Cold Plunge, Red Light Sauna, HBOT, Normatec Therapy & more at The Pearl, Qatar.",
    keywords: [
        "The Lab 33 waitlist", "Lab 33 waitlist", "recovery lab Qatar", "biohacking Doha waitlist",
        "The Pearl wellness", "early access The Lab 33", "HBOT Qatar signup",
    ],
    alternates: {
        canonical: "https://lab33recovery.qa/waitlist",
    },
    openGraph: {
        title: "Join the Waitlist",
        description: "Be the first to experience Doha's premier biohacking & recovery lab. Join The Lab 33 waitlist for exclusive early access.",
        url: "https://lab33recovery.qa/waitlist",
        siteName: "The Lab 33",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Join the Waitlist",
        description: "Be the first to experience Doha's premier biohacking & recovery lab at The Pearl, Qatar.",
    },
};

export default function WaitlistPage() {
    return (
        <main className="min-h-[100dvh] bg-[#050505]">
            <WaitlistForm mode="page" />
        </main>
    );
}
