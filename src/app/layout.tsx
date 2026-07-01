import type { Metadata } from "next";
import { DM_Serif_Text, Slabo_27px } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";
import CustomCursorWrapper from "@/components/ui/CustomCursorWrapper";

const dmSerifText = DM_Serif_Text({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
});

const tasaExplorer = localFont({
  src: "../fonts/tasa-explorer-400.ttf",
  variable: "--font-tasa-explorer",
  weight: "400",
  display: 'swap',
});

const slabo27px = Slabo_27px({
  variable: "--font-slabo",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
});

import OrganizationJsonLd from "@/components/seo/JsonLd";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// Viewport settings for proper mobile keyboard handling
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://lab33recovery.qa'), // User: Update this to your actual production URL
  title: {
    default: "The Lab 33 | Future of Recovery",
    template: "%s | The Lab 33",
  },
  description: "Doha’s premier biohacking & recovery lab in The Pearl. Cold Plunge, O₂ Sessions, Red Light Sauna, Normatec & Guided Stretch. Join the waitlist.",
  keywords: ["The Lab 33", "Lab 33", "recovery Qatar", "wellness Doha", "The Pearl", "biohacking", "cold plunge", "HBOT", "Porto Arabia", "red light sauna", "normatec therapy", "guided stretch"],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lab33recovery.qa',
    siteName: 'The Lab 33',
    title: 'The Lab 33 | Future of Recovery',
    description: 'Doha’s premier biohacking & recovery lab in The Pearl. Cold Plunge, O₂ Sessions, Red Light Sauna, Normatec & Guided Stretch. Join the waitlist.',
    images: [
      {
        url: '/opengraph-image.png', // Corrected to match existing file
        width: 1200,
        height: 630,
        alt: 'The Lab 33 - The Future of Recovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Lab 33 | Future of Recovery',
    description: 'Doha’s premier biohacking & recovery lab in The Pearl. Cold Plunge, O₂ Sessions, Red Light Sauna, Normatec & Guided Stretch. Join the waitlist.',
    // creator: '@lab33', // Add handle if known
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    other: {
      "msvalidate.01": "018550E8C056494C4D772B05ECC2F71F",
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  alternates: {
    types: {
      'text/plain': [
        { url: '/llms.txt', title: 'LLMs.txt - AI Entity Definition' },
        { url: '/llms-full.txt', title: 'LLMs-full.txt - Complete AI Knowledge Base' },
      ],
    },
  },
  other: {
    'llms-txt': 'https://lab33recovery.qa/llms.txt',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSerifText.className} ${dmSerifText.variable} ${tasaExplorer.variable} ${slabo27px.variable} antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
        >
          <CustomCursorWrapper />
          <OrganizationJsonLd />
          <Analytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
