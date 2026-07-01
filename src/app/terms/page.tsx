import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for The Lab 33 — Doha's premier biohacking & recovery lab.",
    alternates: {
        canonical: "https://lab33recovery.qa/terms",
    },
};

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-[#e8e0d4]">
            {/* Hero */}
            <div className="relative py-24 px-6 text-center border-b border-[#d4af77]/15">
                <div className="absolute inset-0 bg-gradient-to-b from-[#d4af77]/5 via-transparent to-transparent" />
                <div className="relative max-w-3xl mx-auto">
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af77] block mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-[#e8e0d4]/50 text-sm">
                        Last updated: February 10, 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
                <Section title="1. Acceptance of Terms">
                    <p>
                        By accessing or using the The Lab 33 website (lab33recovery.com), mobile applications,
                        or any related services (collectively, the &quot;Services&quot;), you agree to be bound by these
                        Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use
                        our Services.
                    </p>
                </Section>

                <Section title="2. Description of Services">
                    <p>
                        The Lab 33 provides premium wellness and recovery services located in The Pearl, Doha, Qatar.
                        Our Services include but are not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Cold Plunge</li>
                        <li>Red Light Sauna</li>
                        <li>Normatec Therapy</li>
                        <li>Hyperbaric Oxygen Therapy (HBOT)</li>
                        <li>Guided Stretch (Massage, Cupping & Kinesiology Taping)</li>
                        <li>Online booking and waitlist registration</li>
                        <li>Content and social media publishing tools</li>
                    </ul>
                </Section>

                <Section title="3. User Accounts">
                    <p>
                        Certain features of our Services may require you to create an account. You are responsible for
                        maintaining the confidentiality of your account credentials and for all activities that occur
                        under your account. You agree to provide accurate and complete information when creating an account
                        and to update your information as necessary.
                    </p>
                </Section>

                <Section title="4. Booking and Cancellation">
                    <p>
                        Bookings for recovery sessions are subject to availability. We reserve the right to modify or
                        cancel bookings at our discretion. Cancellation policies may apply and will be communicated at
                        the time of booking. Failure to attend a booked session without prior cancellation may result in
                        charges or restrictions on future bookings.
                    </p>
                </Section>

                <Section title="5. Health Disclaimer">
                    <p>
                        Our recovery and wellness services are not a substitute for professional medical advice, diagnosis,
                        or treatment. You should consult with a qualified healthcare provider before using any of our
                        services, especially if you have pre-existing medical conditions. You assume all risks associated
                        with the use of our recovery services.
                    </p>
                </Section>

                <Section title="6. Intellectual Property">
                    <p>
                        All content on our Services — including text, graphics, logos, images, videos, and software —
                        is the property of The Lab 33 or its licensors and is protected by intellectual property laws.
                        You may not reproduce, distribute, modify, or create derivative works from any content without
                        our express written permission.
                    </p>
                </Section>

                <Section title="7. Social Media Integration">
                    <p>
                        Our Services may integrate with third-party social media platforms including but not limited to
                        Instagram, Facebook, TikTok, and Google. By authorizing such integrations, you agree to the
                        respective platform&apos;s terms of service. We are not responsible for content published to
                        third-party platforms through our Services once it has been submitted to those platforms.
                    </p>
                </Section>

                <Section title="8. Prohibited Conduct">
                    <p>You agree not to:</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Use the Services for any unlawful purpose</li>
                        <li>Interfere with or disrupt the Services or servers</li>
                        <li>Attempt to gain unauthorized access to any portion of the Services</li>
                        <li>Upload malicious code or content</li>
                        <li>Impersonate any person or entity</li>
                        <li>Harvest or collect information about other users</li>
                    </ul>
                </Section>

                <Section title="9. Limitation of Liability">
                    <p>
                        To the maximum extent permitted by law, The Lab 33 shall not be liable for any indirect,
                        incidental, special, consequential, or punitive damages, including loss of profits, data, or
                        goodwill, arising out of or in connection with your use of our Services.
                    </p>
                </Section>

                <Section title="10. Modifications">
                    <p>
                        We reserve the right to modify these Terms at any time. Changes will be effective immediately
                        upon posting to the Services. Your continued use of the Services after any changes constitutes
                        your acceptance of the revised Terms.
                    </p>
                </Section>

                <Section title="11. Governing Law">
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the State of Qatar.
                        Any disputes arising from these Terms or your use of the Services shall be resolved in the courts
                        of Qatar.
                    </p>
                </Section>

                <Section title="12. Contact">
                    <p>
                        If you have any questions about these Terms, please contact us at:
                    </p>
                    <div className="mt-3 p-4 rounded-xl bg-white/5 border border-[#d4af77]/10">
                        <p className="text-white font-medium">The Lab 33</p>
                        <p className="text-[#e8e0d4]/60 text-sm">The Pearl, Porto Arabia</p>
                        <p className="text-[#e8e0d4]/60 text-sm">Doha, Qatar</p>
                        <p className="text-[#d4af77] text-sm mt-1">support@thelab33recovery.com</p>
                    </div>
                </Section>
            </div>
        </main>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-xl font-serif text-white mb-4 pb-2 border-b border-[#d4af77]/10">
                {title}
            </h2>
            <div className="text-[15px] leading-relaxed text-[#e8e0d4]/70 space-y-3">
                {children}
            </div>
        </section>
    );
}
