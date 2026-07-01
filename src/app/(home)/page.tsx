import { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";

// SEO copy tuned for ranking-improvement on "recovery qatar" / "recovery lab qatar".
// Title leads with the target keyword, sits at 54 chars (SERP sweet spot 50–60).
// Description fits the 155-char SERP cap with concrete services + CTA.
const TITLE = "Recovery Lab Qatar — Cold Plunge, HBOT & Sauna | The Lab 33";
const DESCRIPTION = "Qatar's premier recovery lab in Porto Arabia, The Pearl. Cold Plunge, Hyperbaric Oxygen, Infrared Sauna, Normatec & Guided Stretch. Join the waitlist.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    // Primary - the home page owns these broad commercial terms
    "recovery qatar", "recovery lab qatar", "recovery lab doha", "recovery doha",
    "biohacking qatar", "biohacking doha", "biohacking lab qatar",
    "wellness center doha", "wellness center qatar",
    "longevity qatar", "longevity doha", "longevity clinic qatar",
    "human optimization qatar", "performance lab qatar",

    // Brand
    "Lab 33", "Lab 33 Qatar", "Lab 33 Doha", "Lab 33 The Pearl",
    "the lab 33", "the lab 33 recovery", "lab 33 recovery",

    // Location intent (high-value)
    "The Pearl recovery", "The Pearl wellness", "The Pearl biohacking",
    "Porto Arabia recovery", "Porto Arabia wellness",
    "athlete recovery qatar", "athlete recovery doha",
    "premium wellness qatar", "luxury recovery doha",
  ],
  alternates: {
    canonical: "https://lab33recovery.qa",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://lab33recovery.qa",
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

export default function Home() {
  return <HomeClient />;
}
