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

// Static particle data — avoids Math.random() during render (SSR/client hydration mismatch)
const PARTICLES = [
    { w: 2.2, h: 3.1, left: "10%", top: "20%", opacity: 0.15 },
    { w: 1.8, h: 2.4, left: "21%", top: "45%", opacity: 0.25 },
    { w: 3.0, h: 1.9, left: "32%", top: "70%", opacity: 0.35 },
    { w: 2.5, h: 2.8, left: "43%", top: "20%", opacity: 0.15 },
    { w: 1.5, h: 3.3, left: "54%", top: "45%", opacity: 0.25 },
    { w: 2.9, h: 1.6, left: "65%", top: "70%", opacity: 0.35 },
    { w: 1.7, h: 2.6, left: "76%", top: "20%", opacity: 0.15 },
    { w: 2.4, h: 1.8, left: "87%", top: "45%", opacity: 0.25 },
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

function IceRule() {
    return (
        <div className="relative my-20 lg:my-28 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#AA8352]/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#AA8352]/40 shrink-0" />
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#AA8352]/20 to-transparent" />
        </div>
    );
}

export default function ColdPlungeClient() {
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
            <h1 className="sr-only">Cold Plunge Ice Bath Therapy at The Lab 33 — Porto Arabia, Doha</h1>
            <PageSchema
                serviceName="Cold Plunge"
                serviceDescription="Calibrated cold-water immersion at The Lab 33 in Porto Arabia, The Pearl. Precision ice bath therapy in Doha for muscle recovery, mental clarity, and peak performance."
                serviceSlug="cold-plunge"
                breadcrumbLabel="Cold Plunge"
                faqs={[
                    { q: "What is Cold Plunge therapy?", a: "Cold Plunge is brief, controlled cold-water immersion (typically 3–5°C) used to reduce muscle soreness, sharpen mental focus, and accelerate recovery after training." },
                    { q: "How is The Lab 33 plunge different from a normal ice bath?", a: "The Lab 33 plunge is precision-controlled — temperature, flow, and immersion depth are calibrated per protocol, not improvised in a tub of ice." },
                    { q: "How long is a cold plunge session?", a: "Most members plunge for 2–5 minutes, often as part of a wider contrast or recovery protocol." },
                ]}
            />
            <BackgroundImage src="/cold-plunge-hero.webp" alt="Cold plunge pool at The Lab 33 recovery facility" />
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
                        src="/cold-plunge-hero.webp"
                        alt="Cold plunge pool at The Lab 33"
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

                {/* Cold blue ambient glow */}
                <div className="absolute top-[30%] left-[20%] w-[60vw] h-[50vh] bg-[radial-gradient(circle,rgba(170,131,82,0.12)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vh] bg-[radial-gradient(circle,rgba(139,107,64,0.08)_0%,transparent_65%)] pointer-events-none" />

                {/* Animated ice particle dots */}
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
                        animate={{ y: [0, -18, 0], opacity: [p.opacity, p.opacity * 2.2, p.opacity] }}
                        transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
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
                            Modality 01 · Cold Immersion
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
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-[#AA8352]/80">
                                Cold
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
                                Plunge
                            </span>
                        </motion.p>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-lg text-[#B5AD9E] font-sans font-light text-[15px] leading-relaxed mb-12"
                    >
                        Step in. Control your breath. Reset your system.
                        {" "}Cold immersion is one of the most effective recovery methods for reducing
                        inflammation, improving circulation, and building mental resilience.
                        {" "}At The Lab 33, temperature, timing, and protocol are set for real results.
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
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-5">
                            The Science
                        </p>
                        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-24 items-start">
                            <div>
                                <h2
                                    className="font-serif font-light uppercase tracking-tight leading-[0.88] mb-8"
                                    style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white/80">
                                        Why it
                                    </span>
                                    <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] to-[#C3BBAD]">
                                        actually works.
                                    </span>
                                </h2>
                                {/* Temp gauge visual */}
                                <div className="relative w-2 h-48 bg-[#010A0F] border border-[#AA8352]/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#634A29] via-[#634A29] to-[#AA8352]"
                                        initial={{ height: "0%" }}
                                        whileInView={{ height: "62%" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-7 text-[#B5AD9E] font-sans font-light leading-relaxed">
                                <p className="text-[15px] text-[#E6DBCA]/90">
                                    Cold exposure triggers a powerful response in the body.
                                </p>

                                {/* Styled benefit list */}
                                <div className="flex flex-col gap-3 py-2">
                                    {[
                                        "Inflammation decreases.",
                                        "Circulation improves.",
                                        "Dopamine increases.",
                                        "Recovery accelerates.",
                                        "Mental resilience grows.",
                                    ].map((item, i) => (
                                        <div key={i} className="group/item flex items-center gap-4">
                                            <div className="relative shrink-0 w-2 h-2">
                                                <div className="absolute inset-0 rounded-full bg-[#AA8352]" />
                                                <div className="absolute -inset-1 rounded-full bg-[#AA8352]/20 group-hover/item:bg-[#AA8352]/40 transition-colors duration-500" />
                                            </div>
                                            <span className="text-[15px] text-[#B5AD9E] group-hover/item:text-[#E6DBCA] transition-colors duration-300">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[15px]">
                                    What was once used only by elite athletes is now supported by modern
                                    research and recovery science.
                                </p>
                                <p className="text-[15px]">
                                    At The Lab 33, the environment is controlled so you get the full
                                    benefit — with different cold plunge temperatures available to match
                                    your level and recovery needs.
                                </p>

                                {/* Closing tagline — accented */}
                                <div className="border-l-2 border-[#AA8352]/40 pl-5 py-2 mt-2">
                                    <p className="text-[16px] font-serif font-light text-[#E6DBCA] leading-relaxed tracking-wide">
                                        This is not just cold water.
                                        <br />
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#AA8352] to-[#C7B591]">
                                            This is structured recovery.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SectionReveal>
                </section>



                <IceRule />

                <section>
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-5">
                            Cold Plunge Protocol
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-16 lg:mb-24"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white/80">
                                How it works.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            {
                                num: "01",
                                title: "Prepare",
                                points: [
                                    "Arrive ready for cold exposure.",
                                    "Avoid hot showers before the session.",
                                    "Take slow breaths before entering.",
                                ],
                            },
                            {
                                num: "02",
                                title: "Immerse",
                                points: [
                                    "Step in slowly until shoulder level.",
                                    "Control your breathing.",
                                    "Allow the body to adapt to the cold.",
                                ],
                            },
                            {
                                num: "03",
                                title: "Exposure time",
                                points: [
                                    "Start with short sessions of 1–2 minutes.",
                                    "Increase gradually over time.",
                                    "Advanced sessions may reach up to 11 minutes.",
                                ],
                            },
                        ].map((step, i) => (
                            <SectionReveal key={step.num} delay={i * 0.12}>
                                <div className="group relative h-full p-8 lg:p-10 border border-[#AA8352]/[0.08] bg-[#AA8352]/[0.02] hover:bg-[#AA8352]/[0.05] transition-all duration-500 overflow-hidden">
                                    {/* Scan line on hover */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#AA8352]/50 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-[15%] bottom-[15%] w-[2px] bg-[#AA8352] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                                    {/* Step number */}
                                    <div className="flex items-baseline gap-3 mb-6">
                                        <span
                                            className="font-serif font-light leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] to-[#C3BBAD]/50"
                                            style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                                        >
                                            {step.num}
                                        </span>
                                        <span className="text-[11px] font-sans tracking-[0.5em] uppercase text-[#AA8352]/60">
                                            —
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-serif font-light text-xl text-[#E6DBCA] group-hover:text-white mb-5 transition-colors duration-300">
                                        {step.title}
                                    </h3>

                                    {/* Bullet points */}
                                    <div className="flex flex-col gap-3">
                                        {step.points.map((point, j) => (
                                            <div key={j} className="flex items-start gap-3">
                                                <div className="relative shrink-0 w-1.5 h-1.5 mt-[7px]">
                                                    <div className="absolute inset-0 rounded-full bg-[#AA8352]/60" />
                                                    <div className="absolute -inset-1 rounded-full bg-[#AA8352]/10 group-hover:bg-[#AA8352]/25 transition-colors duration-500" />
                                                </div>
                                                <span className="text-[14px] font-sans text-[#B5AD9E] leading-relaxed group-hover:text-[#B5AD9E]/90 transition-colors duration-300">
                                                    {point}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>

                    {/* Consistency callout */}
                    <SectionReveal delay={0.4}>
                        <div className="mt-12 lg:mt-16 border-l-2 border-[#AA8352]/30 pl-6 py-1 max-w-xl">
                            <p className="text-[15px] font-serif font-light tracking-wide">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E6DBCA] to-[#AA8352]">
                                    Consistency gives the best recovery results.
                                </span>
                            </p>
                        </div>
                    </SectionReveal>
                </section>


                <IceRule />

                <section className="pb-28 lg:pb-36">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/15 bg-[#AA8352]/[0.02] px-8 py-14 md:px-16 text-center">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/35" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/35" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/35" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/35" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(170,131,82,0.05)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-5 relative z-10">
                                Opening Q2 2026 · Porto Arabia
                            </p>
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-5 relative z-10"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white/80">
                                    Ready to try it?
                                </span>
                            </h2>
                            <p className="text-[14px] font-sans text-[#B5AD9E] max-w-sm mx-auto leading-relaxed mb-10 relative z-10">
                                Get on the waitlist and be one of the first people through the door when we open.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Link
                                    href="/waitlist"
                                    className="group/cta no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#AA8352]/40 bg-[#AA8352]/[0.06] hover:border-[#AA8352]/70 hover:bg-[#AA8352]/10 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-[#AA8352]/10 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                                    <span className="font-serif text-[15px] tracking-[0.4em] uppercase text-[#AA8352] relative z-10">
                                        Join Waitlist
                                    </span>
                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11" className="text-[#AA8352]/90 group-hover/cta:text-[#AA8352] transition-colors relative z-10">
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/about"
                                    className="group/sec no-underline inline-flex items-center gap-3 px-8 py-4 border border-white/[0.06] hover:border-white/12 transition-all duration-500"
                                >
                                    <span className="font-serif text-[15px] tracking-[0.4em] uppercase text-white/40 group-hover/sec:text-white/70 transition-colors">
                                        Explore More
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
                            <Link href="/hot-tub" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Hot Tub</span>
                            </Link>
                            <Link href="/red-light-sauna" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Red Light Sauna</span>
                            </Link>
                            <Link href="/normatec" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Normatec</span>
                            </Link>
                        </div>
                    </SectionReveal>
                </section>

            </div>
        </main>
    );
}



