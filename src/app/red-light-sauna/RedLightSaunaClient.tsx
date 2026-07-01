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
        title: "Less tension",
        body: "Heat helps your body relax, easing tightness and stiffness.",
    },
    {
        code: "02",
        title: "Faster recovery",
        body: "Supports circulation so your body can recover more efficiently.",
    },
    {
        code: "03",
        title: "Better skin",
        body: "Regular sessions can help your skin look glowing and more balanced over time.",
    },
    {
        code: "04",
        title: "Deep sweat",
        body: "A comfortable heat that allows longer sessions and a deeper, more effective sweat.",
    },
    {
        code: "05",
        title: "Better sleep",
        body: "Sessions before rest help your body wind down and recover overnight.",
    },
    {
        code: "06",
        title: "Calmer state",
        body: "You leave feeling more relaxed, reset, and mentally lighter.",
    },
];

const HOW_IT_WORKS = [
    {
        num: "01",
        title: "STEP IN",
        desc: "",
    },
    {
        num: "02",
        title: "CONTROLLED HEAT RISES DEEP",
        desc: "",
    },
    {
        num: "03",
        title: "COMFORTABLE SWEAT",
        desc: "",
    },
    {
        num: "04",
        title: "RESET & RECHARGE",
        desc: "",
    },
];

// Static glowing particle data — no Math.random() to avoid SSR mismatch
const PARTICLES = [
    { w: 3, h: 3, left: "8%", top: "25%", opacity: 0.25, color: "#AA8352" },
    { w: 2, h: 2, left: "18%", top: "60%", opacity: 0.18, color: "#EA580C" },
    { w: 4, h: 4, left: "30%", top: "15%", opacity: 0.12, color: "#AA8352" },
    { w: 2, h: 2, left: "45%", top: "70%", opacity: 0.22, color: "#B45309" },
    { w: 3, h: 3, left: "58%", top: "30%", opacity: 0.16, color: "#EA580C" },
    { w: 2, h: 2, left: "70%", top: "55%", opacity: 0.20, color: "#AA8352" },
    { w: 4, h: 4, left: "82%", top: "20%", opacity: 0.14, color: "#B45309" },
    { w: 2, h: 2, left: "91%", top: "65%", opacity: 0.19, color: "#EA580C" },
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

export default function RedLightSaunaClient() {
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
            const dist = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
            setNearBottom(dist < 120);
        };
        window.addEventListener("scroll", checkBottom, { passive: true });
        checkBottom();
        return () => window.removeEventListener("scroll", checkBottom);
    }, []);

    const showFixedFooter = !pastHero || nearBottom;

    return (
        <main className="w-full bg-[#0A0302] text-[#F5EDE8] selection:bg-[#AA8352]/20 overflow-x-hidden">
            <h1 className="sr-only">Red Light Sauna &amp; Infrared Therapy at The Lab 33 — The Pearl, Doha</h1>
            <PageSchema
                serviceName="Infrared Sauna with Red Light Therapy"
                serviceDescription="Full-spectrum infrared sauna combined with red light therapy at The Lab 33 in The Pearl, Doha — for circulation, sleep, recovery, and skin, without the brutal heat of traditional sauna."
                serviceSlug="red-light-sauna"
                breadcrumbLabel="Red Light Sauna"
                faqs={[
                    { q: "What is the difference between an infrared sauna and a normal sauna?", a: "Infrared saunas use light to heat the body directly at a lower air temperature, so it feels gentler while still delivering deep tissue benefits, sweating, and cardiovascular conditioning." },
                    { q: "What does red light therapy do?", a: "Red and near-infrared light wavelengths stimulate mitochondrial activity at the cellular level, supporting recovery, skin quality, sleep, and inflammation reduction." },
                    { q: "How long is a session?", a: "Typical sessions are 30–45 minutes, programmed around your goal — recovery, skin, sleep, or general wellness." },
                ]}
            />
            <BackgroundImage src="/red-light-sauna-hero.webp" alt="Infrared red light sauna therapy at The Lab 33" />
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

                {/* Parallax background */}
                <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>
                    <Image
                        src="/red-light-sauna-hero.webp"
                        alt="Red light sauna at The Lab 33"
                        fill priority quality={90} sizes="100vw"
                        className="object-cover object-center"
                        style={{ filter: "sepia(0.6) hue-rotate(-10deg) brightness(0.35) saturate(1.2)" }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,transparent_15%,#0A0302_100%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A0302] to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0A0302]/60 to-transparent" />
                </motion.div>

                {/* Red ambient glows */}
                <div className="absolute top-[20%] left-[15%] w-[55vw] h-[50vh] bg-[radial-gradient(circle,rgba(170,131,82,0.10)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[15%] right-[10%] w-[35vw] h-[35vh] bg-[radial-gradient(circle,rgba(139,107,64,0.07)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-[radial-gradient(circle,rgba(170,131,82,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Floating glow particles */}
                {PARTICLES.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{ width: p.w, height: p.h, left: p.left, top: p.top, opacity: p.opacity, backgroundColor: p.color, boxShadow: `0 0 ${p.w * 4}px ${p.color}` }}
                        animate={{ y: [0, -14, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
                        transition={{ duration: 3.5 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
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
                        <div className="w-8 h-[1px] bg-[#AA8352]/50" />
                        <span className="text-[15px] font-sans tracking-[0.6em] uppercase text-[#AA8352]/80">
                            Modality 02 · Infrared Therapy
                        </span>
                        <div className="w-8 h-[1px] bg-[#AA8352]/50" />
                    </motion.div>

                    <div className="overflow-hidden pt-6 pb-6 -mt-6 -mb-5">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.85]"
                            style={{ fontSize: "clamp(3.2rem, 10vw, 10rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#AA8352] to-[#AA8352]/50">
                                INFRARED
                            </span>
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden pt-6 pb-8 -mt-6 mb-2">
                        <motion.p
                            aria-hidden="true"
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.85]"
                            style={{ fontSize: "clamp(3.2rem, 10vw, 10rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] via-[#634A29] to-[#7F1D1D]/50">
                                SAUNA
                            </span>
                        </motion.p>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-lg text-[#C3BBAD] font-sans font-light text-[15px] leading-relaxed mb-12"
                    >
                        Not like traditional saunas.<br className="hidden md:block" />
                        A more controlled, direct heat designed for recovery.
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

                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#E6DBCA] mb-3 lg:mb-4">
                            What It Is
                        </p>
                        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-16 items-center">
                            <div>
                                <h2
                                    className="font-serif font-light uppercase tracking-tight leading-[0.88] mb-6"
                                    style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#AA8352]/80 to-white/80">
                                        Not your
                                    </span>
                                    <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] to-[#7F1D1D]">
                                        typical sauna.
                                    </span>
                                </h2>
                            </div>
                            <div className="flex flex-col gap-6 text-[#C3BBAD] font-sans font-light leading-relaxed text-lg lg:text-xl">
                                <p>
                                    A traditional sauna heats the air around you.<br className="hidden md:block" />
                                    Infrared works differently — delivering a more direct, controlled heat.
                                </p>
                                <p>
                                    You warm up without being overwhelmed, allowing longer, more comfortable sessions that support recovery and relaxation.
                                </p>
                                <p>
                                    At The Lab 33, we use full-spectrum infrared — designed to work across the body in one session.
                                </p>
                            </div>
                        </div>
                    </SectionReveal>
                </section>

                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#E6DBCA] mb-3 lg:mb-4">
                            Benefits
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#AA8352]/80 to-white/80">
                                WHAT
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#AA8352] to-[#7F1D1D]">
                                CHANGES.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid md:grid-cols-2 gap-px">
                        {BENEFITS.map((b, i) => (
                            <SectionReveal key={b.code} delay={i * 0.06}>
                                <div className="group flex gap-5 p-5 lg:p-6 border border-[#AA8352]/[0.07] hover:border-[#AA8352]/20 bg-transparent hover:bg-[#AA8352]/[0.03] transition-all duration-500 relative overflow-hidden h-full">
                                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-[#AA8352] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                                    <span className="shrink-0 font-serif text-[12px] tracking-[0.3em] text-[#AA8352]/80 group-hover:text-[#E6DBCA] transition-colors duration-300 pt-1">
                                        {b.code}
                                    </span>
                                    <div>
                                        <h3 className="font-serif font-light text-lg text-[#AA8352]/80 group-hover:text-[#AA8352] mb-1 lg:mb-2 transition-colors duration-300">
                                            {b.title}
                                        </h3>
                                        <p className="text-[14px] font-sans text-[#C3BBAD] leading-relaxed group-hover:text-[#C3BBAD] transition-colors duration-300">
                                            {b.body}
                                        </p>
                                    </div>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </section>

                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#E6DBCA] mb-3 lg:mb-4">
                            A Session
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#AA8352]/80 to-white/80">
                                THE EXPERIENCE
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="relative">
                        <div className="absolute left-[26px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#AA8352]/30 via-[#AA8352]/15 to-transparent hidden md:block" />
                        <div className="flex flex-col gap-0">
                            {HOW_IT_WORKS.map((step, i) => (
                                <SectionReveal key={step.num} delay={i * 0.1}>
                                    <div className="group flex gap-6 md:gap-8 py-5 lg:py-6 border-b border-[#AA8352]/[0.07] hover:border-[#AA8352]/20 transition-colors duration-500 relative">
                                        <div className="shrink-0 w-[42px] h-[42px] rounded-full border border-[#AA8352]/20 flex items-center justify-center group-hover:border-[#AA8352]/50 group-hover:bg-[#AA8352]/5 transition-all duration-500 z-10 bg-[#0A0302]">
                                            <span className="font-serif text-[14px] text-[#E6DBCA] group-hover:text-[#AA8352] transition-colors duration-300">
                                                {step.num}
                                            </span>
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <h3 className="font-serif font-light text-xl text-[#AA8352]/70 group-hover:text-[#AA8352] mb-1 transition-colors duration-300">
                                                {step.title}
                                            </h3>
                                            {step.desc && (
                                                <p className="text-[15px] font-sans text-[#C3BBAD] leading-relaxed group-hover:text-[#C3BBAD] transition-colors duration-400 max-w-2xl mt-2">
                                                    {step.desc}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </SectionReveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/12 bg-[#AA8352]/[0.03] px-8 py-10 md:px-12 md:py-12">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/30" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/30" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/30" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(170,131,82,0.06)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[15px] font-sans tracking-[0.5em] uppercase text-[#AA8352]/90 mb-4 relative z-10">
                                Expert Tip
                            </p>
                            <blockquote
                                className="relative z-10 font-serif font-light text-xl md:text-2xl lg:text-3xl text-[#AA8352]/80 leading-relaxed mb-6 max-w-3xl"
                                style={{ fontStyle: "italic" }}
                            >
                                &ldquo;Red light sauna followed by cold plunge is one of the most effective recovery combinations.<br className="hidden md:block" />
                                Heat prepares the body — cold sharpens the result.&rdquo;
                            </blockquote>
                            <cite className="not-italic text-[12px] font-sans tracking-[0.35em] uppercase text-[#AA8352]/90 relative z-10 block">
                                — The Lab 33 Recovery Team
                            </cite>
                        </div>
                    </SectionReveal>
                </section>

                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/15 bg-[#AA8352]/[0.02] px-8 py-10 md:px-12 text-center">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/35" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/35" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/35" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/35" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(170,131,82,0.05)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[15px] font-sans tracking-[0.55em] uppercase text-[#E6DBCA] mb-5 relative z-10">
                                Opening Q2 2026 · Porto Arabia
                            </p>
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-5 relative z-10"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#AA8352]/80 to-white/80">
                                    Ready to feel the heat?
                                </span>
                            </h2>
                            <p className="text-[14px] font-sans text-[#C3BBAD] max-w-sm mx-auto leading-relaxed mb-10 relative z-10">
                                Get on the waitlist and be first in when we open. Early members get the best rates, guaranteed.
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
                            <Link href="/cold-plunge" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Cold Plunge</span>
                            </Link>
                            <Link href="/normatec" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Normatec</span>
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



