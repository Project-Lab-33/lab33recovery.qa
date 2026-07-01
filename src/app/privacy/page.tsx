import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for The Lab 33 — how we collect, use, and protect your data.",
    alternates: {
        canonical: "https://lab33recovery.qa/privacy",
    },
};

export default function PrivacyPolicy() {
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
                        Privacy Policy
                    </h1>
                    <p className="text-[#e8e0d4]/50 text-sm">
                        Last updated: February 10, 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
                <Section title="1. Introduction">
                    <p>
                        The Lab 33 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                        you visit our website (lab33recovery.com), use our mobile applications, or interact with our
                        services (collectively, the &quot;Services&quot;).
                    </p>
                </Section>

                <Section title="2. Information We Collect">
                    <h3 className="text-white font-medium text-base mb-2">Personal Information</h3>
                    <p>We may collect personal information that you voluntarily provide, including:</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Name and contact information (email, phone number)</li>
                        <li>Date of birth and gender</li>
                        <li>Health and medical information relevant to our services</li>
                        <li>Booking and appointment history</li>
                        <li>Payment information</li>
                        <li>Social media account information (when you authorize integrations)</li>
                        <li>Employment application details (for job applicants)</li>
                    </ul>

                    <h3 className="text-white font-medium text-base mb-2 mt-6">Automatically Collected Information</h3>
                    <p>When you access our Services, we may automatically collect:</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Device information (browser type, operating system)</li>
                        <li>IP address and approximate location</li>
                        <li>Usage data (pages visited, time spent, interactions)</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </Section>

                <Section title="3. How We Use Your Information">
                    <p>We use the collected information to:</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Provide, maintain, and improve our Services</li>
                        <li>Process bookings and manage your account</li>
                        <li>Send you relevant communications and updates</li>
                        <li>Personalize your experience</li>
                        <li>Analyze usage patterns to improve our offerings</li>
                        <li>Publish marketing content to authorized social media platforms</li>
                        <li>Process job applications</li>
                        <li>Comply with legal obligations</li>
                        <li>Protect against fraud and unauthorized access</li>
                    </ul>
                </Section>

                <Section title="4. Social Media Integrations">
                    <p>
                        Our Services integrate with third-party social media platforms including Instagram, Facebook,
                        TikTok, and Google. When you authorize these integrations:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>We access only the permissions explicitly authorized by you</li>
                        <li>We use platform APIs to publish content on your behalf</li>
                        <li>We may store access tokens securely to maintain the connection</li>
                        <li>You can revoke access at any time through the respective platform&apos;s settings</li>
                    </ul>
                    <p className="mt-3">
                        We do not sell or share your social media data with third parties. Content published through
                        our Services to third-party platforms is subject to those platforms&apos; respective privacy policies.
                    </p>
                </Section>

                <Section title="5. Data Sharing and Disclosure">
                    <p>We may share your information with:</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li><strong className="text-white">Service providers:</strong> Third-party vendors who assist in operating our Services (hosting, analytics, payment processing)</li>
                        <li><strong className="text-white">Social media platforms:</strong> When you authorize content publishing integrations</li>
                        <li><strong className="text-white">Legal authorities:</strong> When required by law or to protect our rights</li>
                        <li><strong className="text-white">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                    <p className="mt-3">
                        We do not sell your personal information to third parties for marketing purposes.
                    </p>
                </Section>

                <Section title="6. Data Security">
                    <p>
                        We implement industry-standard security measures to protect your information, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Encryption of data in transit (SSL/TLS)</li>
                        <li>Secure storage with access controls</li>
                        <li>Regular security assessments</li>
                        <li>Employee access restrictions on a need-to-know basis</li>
                    </ul>
                    <p className="mt-3">
                        While we strive to protect your data, no method of transmission over the Internet is 100% secure.
                        We cannot guarantee absolute security.
                    </p>
                </Section>

                <Section title="7. Cookies and Tracking">
                    <p>
                        We use cookies and similar technologies to enhance your experience. These include:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li><strong className="text-white">Essential cookies:</strong> Required for the Services to function properly</li>
                        <li><strong className="text-white">Analytics cookies:</strong> Help us understand how visitors interact with our Services (Google Analytics)</li>
                        <li><strong className="text-white">Marketing cookies:</strong> Used to deliver relevant advertisements (Meta Pixel)</li>
                    </ul>
                    <p className="mt-3">
                        You can manage cookie preferences through your browser settings.
                    </p>
                </Section>

                <Section title="8. Your Rights">
                    <p>Depending on your location, you may have the right to:</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 text-[#e8e0d4]/70">
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to or restrict processing of your data</li>
                        <li>Data portability</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p className="mt-3">
                        To exercise any of these rights, please contact us using the information provided below.
                    </p>
                </Section>

                <Section title="9. Data Retention">
                    <p>
                        We retain your personal information for as long as necessary to fulfill the purposes outlined
                        in this Privacy Policy, unless a longer retention period is required or permitted by law. When
                        data is no longer needed, it will be securely deleted or anonymized.
                    </p>
                </Section>

                <Section title="10. Children&apos;s Privacy">
                    <p>
                        Our Services are not directed to individuals under the age of 18. We do not knowingly collect
                        personal information from children. If we become aware that we have collected data from a child,
                        we will take steps to delete it promptly.
                    </p>
                </Section>

                <Section title="11. Changes to This Policy">
                    <p>
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with
                        an updated effective date. We encourage you to review this Privacy Policy periodically for any
                        changes.
                    </p>
                </Section>

                <Section title="12. Contact Us">
                    <p>
                        If you have any questions or concerns about this Privacy Policy or our data practices, please
                        contact us at:
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
