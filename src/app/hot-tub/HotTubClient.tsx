"use client";

import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BackgroundImage from "@/components/shared/BackgroundImage";
import PageSchema from "@/components/seo/PageSchema";
import Copyright from "@/components/shared/Copyright";
import LocationIndicator from "@/components/shared/LocationIndicator";
import SocialIcons from "@/components/shared/SocialIcons";
import SiteHUD from "@/components/shared/SiteHUD";

const BENEFITS = [
    {
        code: "01",
        title: "Muscle Release",
        body: "Heat helps reduce tension and prepares your body to move better.",
    },
    {
        code: "02",
        title: "Circulation Boost",
        body: "Increased blood flow delivers oxygen and supports recovery.",
    },
    {
        code: "03",
        title: "Nervous System Shift",
        body: "Heat helps your body transition into recovery mode.",
    },
    {
        code: "04",
        title: "Joint Mobility",
        body: "Warmth reduces stiffness and improves range of motion.",
    },
    {
        code: "05",
        title: "Contrast Amplifier",
        body: "Heat enhances the effect of cold — making contrast more effective.",
    },
    {
        code: "06",
        title: "Sleep Support",
        body: "A rise and drop in body temperature helps regulate deeper sleep.",
    },
];

const SESSION_STEPS = [
    {
        num: "I",
        title: "Start warm",
        desc: "Raise body temperature. Prepare for contrast.",
        meta: "10–15 min",
    },
    {
        num: "II",
        title: "Go cold",
        desc: "Cold exposure drives a strong vascular response.",
        meta: "2–4 min",
    },
    {
        num: "III",
        title: "Repeat",
        desc: "Alternate heat and cold.",
        meta: "2–3 rounds",
    },
    {
        num: "IV",
        title: "End on cold",
        desc: "Finish cold. Lock in the effect.",
        meta: "",
    },
];

const CONTRAST_SCIENCE = [
    { label: "Vascular Activation", desc: "Hot opens blood flow. Cold compresses it. This creates a pumping effect that helps your body move and reset faster." },
    { label: "Inflammation Response", desc: "Switching between heat and cold triggers a controlled response — helping reduce soreness and support recovery." },
    { label: "System Reset", desc: "Contrast trains your nervous system. Over time, your body handles stress better and recovers with more efficiency." },
];

// Static particle data
const PARTICLES = [
    { w: 2.5, h: 2.5, left: "8%", top: "25%", opacity: 0.12 },
    { w: 2.0, h: 2.0, left: "22%", top: "50%", opacity: 0.20 },
    { w: 3.0, h: 3.0, left: "35%", top: "75%", opacity: 0.15 },
    { w: 1.8, h: 1.8, left: "48%", top: "22%", opacity: 0.18 },
    { w: 2.2, h: 2.2, left: "60%", top: "55%", opacity: 0.12 },
    { w: 2.8, h: 2.8, left: "72%", top: "35%", opacity: 0.20 },
    { w: 1.5, h: 1.5, left: "85%", top: "60%", opacity: 0.15 },
    { w: 2.4, h: 2.4, left: "92%", top: "30%", opacity: 0.18 },
];

function SectionReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

function WarmRule() {
    return (
        <div className="relative my-20 lg:my-28 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#AA8352]/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#AA8352]/40 shrink-0" />
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#AA8352]/20 to-transparent" />
        </div>
    );
}

export default function HotTubClient() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

    const [pastHero, setPastHero] = useState(false);
    const [nearBottom, setNearBottom] = useState(false);

    useEffect(() => {
        const unsub = scrollYProgress.on("change", (v) => setPastHero(v > 0.02));
        return unsub;
    }, [scrollYProgress]);

    useEffect(() => {
        const checkBottom = () => {
            const distFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
            setNearBottom(distFromBottom < 120);
        };
        window.addEventListener("scroll", checkBottom, { passive: true });
        checkBottom();
        return () => window.removeEventListener("scroll", checkBottom);
    }, []);

    const showFixedFooter = !pastHero || nearBottom;

    return (
        <main className="w-full bg-[#010A0F] text-[#F4EFE6] selection:bg-[#AA8352]/20 overflow-x-hidden">
            <h1 className="sr-only">Contrast Heat &amp; Hot Tub Recovery at The Lab 33 — The Pearl, Doha</h1>
            <PageSchema
                serviceName="Contrast Heat Therapy"
                serviceDescription="Contrast Heat at The Lab 33 in The Pearl, Doha. Hot water therapy paired with the Cold Plunge to relax muscles, boost circulation, and amplify recovery."
                serviceSlug="hot-tub"
                breadcrumbLabel="Contrast Heat"
                faqs={[
                    { q: "What is contrast therapy?", a: "Contrast therapy alternates between hot and cold immersion — at The Lab 33, between the hot tub and the Cold Plunge — training the vascular system and accelerating recovery." },
                    { q: "Why pair hot and cold?", a: "The hot phase relaxes muscle and dilates blood vessels; the cold phase contracts them. Cycling between the two creates a vascular pump that flushes inflammation and rebuilds tissue faster." },
                    { q: "How long is a contrast session?", a: "Typically 15–25 minutes total, with structured rotations between hot and cold phases." },
                ]}
            />
            <BackgroundImage src="/cinematic-lab-interior.webp" alt="Hot tub contrast therapy area at The Lab 33" />
            <SiteHUD />

            <AnimatePresence>
                {showFixedFooter && (
                    <motion.div
                        key="hud-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="contents"
                    >
                        <LocationIndicator />
                        <SocialIcons />
                        <Copyright />
                    </motion.div>
                )}
            </AnimatePresence>

            <section ref={heroRef} className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

                {/* Background image with parallax */}
                <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>
                    <Image
                        src="/cinematic-lab-interior.webp"
                        alt="Hot tub area at The Lab 33"
                        fill
                        priority
                        quality={90}
                        sizes="100vw"
                        className="object-cover object-center"
                        style={{ filter: "sepia(0.6) hue-rotate(-10deg) brightness(0.35) saturate(1.2)" }}
                    />
                    {/* Deep vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,transparent_20%,#010A0F_100%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#010A0F] to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#010A0F]/60 to-transparent" />
                </motion.div>

                {/* Warm amber ambient glow */}
                <div className="absolute top-[30%] left-[20%] w-[60vw] h-[50vh] bg-[radial-gradient(circle,rgba(170,131,82,0.10)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vh] bg-[radial-gradient(circle,rgba(139,107,64,0.06)_0%,transparent_65%)] pointer-events-none" />

                {/* Animated warm particle dots */}
                {PARTICLES.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-[#AA8352] pointer-events-none"
                        style={{
                            width: p.w,
                            height: p.h,
                            left: p.left,
                            top: p.top,
                            opacity: p.opacity,
                        }}
                        animate={{ y: [0, -14, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
                        transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    />
                ))}

                {/* Hero content */}
                <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="w-8 h-[1px] bg-[#AA8352]/40" />
                        <span className="text-[15px] font-sans tracking-[0.6em] uppercase text-[#AA8352]/80">
                            Facility 02 · Contrast Heat
                        </span>
                        <div className="w-8 h-[1px] bg-[#AA8352]/40" />
                    </motion.div>

                    <div className="overflow-hidden mb-3">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.85]"
                            style={{ fontSize: "clamp(4rem, 12vw, 11rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#C7B591] to-[#AA8352]/80">
                                Contrast
                            </span>
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden mb-10">
                        <motion.p
                            aria-hidden="true"
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.85]"
                            style={{ fontSize: "clamp(4rem, 12vw, 11rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] via-[#634A29] to-[#634A29]/40">
                                Heat
                            </span>
                        </motion.p>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-lg text-[#B5AD9E] font-sans font-light text-[15px] leading-relaxed mb-12"
                    >
                        Combined with the cold plunge, the hot tub creates contrast recovery — helping your
                        muscles relax, improving circulation, and leaving your body feeling fully reset.
                    </motion.p>

                </div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[15px] font-sans tracking-[0.45em] uppercase text-[#AA8352]/70">Explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[1px] h-8 bg-gradient-to-b from-[#AA8352]/40 to-transparent"
                    />
                </motion.div>
            </section>

            <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">

                <section className="pt-24 lg:pt-36 pb-6">
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#AA8352] mb-5">
                            The Science
                        </p>
                        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-24 items-start">
                            <div>
                                <h2
                                    className="font-serif font-light uppercase tracking-tight leading-[0.88] mb-8"
                                    style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#C7B591] to-white/80">
                                        Why heat
                                    </span>
                                    <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] to-[#634A29]">
                                        actually works.
                                    </span>
                                </h2>
                                {/* Heat gauge visual */}
                                <div className="relative w-2 h-48 bg-[#010A0F] border border-[#AA8352]/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#634A29] via-[#634A29] to-[#AA8352]"
                                        initial={{ height: "0%" }}
                                        whileInView={{ height: "75%" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-5 text-[#B5AD9E] font-sans font-light leading-relaxed">
                                <p className="text-[15px]">
                                    Heat is one of the oldest tools in recovery.
                                    <br />
                                    When your body warms up, blood flow increases and muscles begin to release.
                                </p>
                                <p className="text-[15px]">
                                    But the real effect comes from contrast.
                                    <br />
                                    Switching between heat and cold creates a rapid vascular response — helping your body move, flush, and reset faster.
                                </p>
                                <p className="text-[15px]">
                                    At The Lab 33, heat is not used alone.
                                    <br />
                                    It&apos;s part of a controlled protocol — calibrated temperature, guided timing, and structured cycles.
                                </p>
                                <p className="text-[15px] text-[#AA8352]/90 font-sans tracking-wide border-l border-[#AA8352]/15 pl-4 mt-2">
                                    Built to help your body recover with intention.
                                </p>
                            </div>
                        </div>
                    </SectionReveal>
                </section>

                <WarmRule />

                <section>
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#AA8352] mb-5">
                            Contrast Therapy
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-14"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#C7B591] to-white/80">
                                Hot opens. Cold closes.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid md:grid-cols-3 gap-px">
                        {CONTRAST_SCIENCE.map((item, i) => (
                            <SectionReveal key={item.label} delay={i * 0.1}>
                                <div className="group relative p-8 lg:p-10 border border-[#AA8352]/[0.08] bg-[#AA8352]/[0.02] hover:bg-[#AA8352]/[0.05] transition-all duration-500 h-full overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#AA8352]/50 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                                    <span className="block text-[12px] font-sans tracking-[0.45em] uppercase text-[#AA8352]/50 mb-4">
                                        0{i + 1}
                                    </span>
                                    <h3 className="font-serif font-light text-xl text-[#C7B591] mb-4 group-hover:text-[#AA8352] transition-colors duration-300">
                                        {item.label}
                                    </h3>
                                    <p className="text-[15px] font-sans text-[#B5AD9E] leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </section>

                <WarmRule />

                <section>
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#AA8352] mb-5">
                            Benefits
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-14 lg:mb-20"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#C7B591] to-white/80">
                                Why heat
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] to-[#634A29]">
                                matters.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid grid-cols-1 gap-px">
                        {BENEFITS.map((b, i) => (
                            <SectionReveal key={b.code} delay={i * 0.06}>
                                <div className="group flex gap-6 p-7 lg:p-9 border border-[#AA8352]/[0.07] hover:border-[#AA8352]/20 bg-transparent hover:bg-[#AA8352]/[0.03] transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-[#AA8352] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                                    <span className="shrink-0 font-serif text-[12px] tracking-[0.3em] text-[#AA8352]/80 group-hover:text-[#AA8352] transition-colors duration-300 pt-1">
                                        {b.code}
                                    </span>
                                    <div>
                                        <h3 className="font-serif font-light text-lg text-[#C7B591] group-hover:text-white mb-3 transition-colors duration-300">
                                            {b.title}
                                        </h3>
                                        <p className="text-[15px] font-sans text-[#B5AD9E] leading-relaxed group-hover:text-[#B5AD9E] transition-colors duration-300">
                                            {b.body}
                                        </p>
                                    </div>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </section>

                <WarmRule />

                <section>
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#AA8352] mb-5">
                            How a Session Works
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-6"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#C7B591] to-white/80">
                                The contrast protocol.
                            </span>
                        </h2>
                        <p className="font-sans font-light text-[#B5AD9E] text-[15px] md:text-[16px] mb-14 lg:mb-20 max-w-2xl">
                            A structured sequence designed to maximize recovery.
                        </p>
                    </SectionReveal>

                    <div className="relative">
                        <div className="absolute left-[26px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#AA8352]/30 via-[#AA8352]/15 to-transparent hidden md:block" />
                        <div className="flex flex-col gap-0">
                            {SESSION_STEPS.map((step, i) => (
                                <SectionReveal key={step.num} delay={i * 0.1}>
                                    <div className="group flex gap-8 md:gap-12 py-8 border-b border-[#AA8352]/[0.07] hover:border-[#AA8352]/20 transition-colors duration-500 relative">
                                        <div className="shrink-0 w-[52px] h-[52px] rounded-full border border-[#AA8352]/20 flex items-center justify-center group-hover:border-[#AA8352]/50 group-hover:bg-[#AA8352]/5 transition-all duration-500 z-10 bg-[#010A0F]">
                                            <span className="font-serif text-[15px] text-[#AA8352] group-hover:text-[#AA8352] transition-colors duration-300">
                                                {step.num}
                                            </span>
                                        </div>
                                        <div className="flex-1 pt-3">
                                            <h3 className="font-serif font-light text-xl text-[#C7B591] group-hover:text-white mb-2 transition-colors duration-300 uppercase tracking-wide">
                                                {step.title}
                                            </h3>
                                            <p className="text-[15px] font-sans text-[#B5AD9E] leading-relaxed max-w-2xl">
                                                {step.desc}
                                            </p>
                                            {step.meta && (
                                                <p className="mt-3 text-[12px] font-sans tracking-[0.4em] uppercase text-[#AA8352]">
                                                    {step.meta}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </SectionReveal>
                            ))}
                        </div>
                    </div>
                </section>

                <WarmRule />

                <section className="pb-28 lg:pb-36">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/15 bg-[#AA8352]/[0.02] px-8 py-14 md:px-16 text-center">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/35" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/35" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/35" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/35" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(170,131,82,0.05)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#AA8352] mb-5 relative z-10">
                                Opening Q2 2026 · Porto Arabia
                            </p>
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-5 relative z-10"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#C7B591] to-white/80">
                                    Ready to warm up?
                                </span>
                            </h2>
                            <p className="text-[14px] font-sans text-[#B5AD9E] max-w-sm mx-auto leading-relaxed mb-10 relative z-10">
                                Get on the waitlist and be one of the first people through the door when we open.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Link
                                    href="https://apps.apple.com/gb/app/the-lab-33/id6761324375"
                                    className="group/cta no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#AA8352]/40 bg-[#AA8352]/[0.06] hover:border-[#AA8352]/70 hover:bg-[#AA8352]/10 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-[#AA8352]/10 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                                    <span className="font-serif text-[15px] tracking-[0.4em] uppercase text-[#AA8352] relative z-10">
                                        Download the App
                                    </span>
                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11" className="text-[#AA8352]/90 group-hover/cta:text-[#AA8352] transition-colors relative z-10">
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/cold-plunge"
                                    className="group/sec no-underline inline-flex items-center gap-3 px-8 py-4 border border-white/[0.06] hover:border-white/12 transition-all duration-500"
                                >
                                    <span className="font-serif text-[15px] tracking-[0.4em] uppercase text-white/40 group-hover/sec:text-white/70 transition-colors">
                                        Cold Plunge →
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </SectionReveal>
                </section>

                <section className="py-16 border-t border-[#AA8352]/[0.08]">
                    <SectionReveal>
                        <p className="text-[9px] font-sans tracking-[0.55em] uppercase text-[#AA8352]/60 mb-8 text-center">
                            Pairs well with
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/cold-plunge" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Cold Plunge</span>
                            </Link>
                            <Link href="/red-light-sauna" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Red Light Sauna</span>
                            </Link>
                            <Link href="/guided-stretch" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Guided Stretch</span>
                            </Link>
                        </div>
                    </SectionReveal>
                </section>

            </div>
        </main>
    );
}
