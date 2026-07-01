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
    { code: "01", title: "Faster recovery", body: "Supports your body in recovering after training and physical stress." },
    { code: "02", title: "Sharper focus", body: "Helps improve clarity, focus, and mental energy." },
    { code: "03", title: "Less inflammation", body: "Supports your body in reducing internal stress and fatigue." },
    { code: "04", title: "Better circulation", body: "Helps your body deliver oxygen more efficiently." },
    { code: "05", title: "Stronger immunity", body: "Supports your system to stay resilient and balanced." },
    { code: "06", title: "Deeper sleep", body: "Helps your body relax and improve sleep quality." },
];

const HOW_IT_WORKS = [
    { num: "I", title: "Step inside", desc: "Enter the chamber. Settle in, relax, and disconnect." },
    { num: "II", title: "Pressure builds", desc: "The chamber gradually pressurises. You may feel it in your ears — like on a flight." },
    { num: "III", title: "Breathe oxygen", desc: "You relax while your body absorbs more oxygen." },
    { num: "IV", title: "Time to switch off", desc: "Sessions last 30-60–90 minutes. Most people use this time to fully relax or sleep." },
    { num: "V", title: "Depressurise & step out", desc: "Pressure slowly returns to normal. You may feel it in your ears — like landing from a flight. You step out feeling clear, light, and recharged." },
];

const USE_CASES = [
    { label: "Post-training recovery", icon: "✦" },
    { label: "Travel fatigue & jet lag", icon: "✦" },
    { label: "Mental clarity & focus", icon: "✦" },
    { label: "High performers & busy schedules", icon: "✦" },
    { label: "Longevity & wellbeing", icon: "✦" },
    { label: "Recovery days", icon: "✦" },
    { label: "Anyone who wants to feel better", icon: "✦" },
];

// Static particles
const PARTICLES = [
    { w: 3, h: 3, left: "6%", top: "28%", opacity: 0.22, color: "#AA8352" },
    { w: 2, h: 2, left: "17%", top: "62%", opacity: 0.16, color: "#C7B591" },
    { w: 4, h: 4, left: "29%", top: "18%", opacity: 0.12, color: "#AA8352" },
    { w: 2, h: 2, left: "44%", top: "74%", opacity: 0.19, color: "#634A29" },
    { w: 3, h: 3, left: "57%", top: "32%", opacity: 0.15, color: "#AA8352" },
    { w: 2, h: 2, left: "68%", top: "55%", opacity: 0.21, color: "#C7B591" },
    { w: 4, h: 4, left: "80%", top: "22%", opacity: 0.13, color: "#AA8352" },
    { w: 2, h: 2, left: "91%", top: "67%", opacity: 0.18, color: "#634A29" },
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

const CTA_BUTTON_THEME = "group/cta no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#AA8352]/20 bg-[#E6DBCA] hover:bg-[#DED2BF] shadow-[0_0_15px_rgba(170,131,82,0.1)] transition-all duration-500";

export default function HBOTClient() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

    const [pastHero, setPastHero] = useState(false);
    const [nearBottom, setNearBottom] = useState(false);

    useEffect(() => {
        const unsub = scrollYProgress.on("change", (v) => {
            setPastHero(v > 0.02);
            setNearBottom(v > 0.95);
        });
        return unsub;
    }, [scrollYProgress]);

    const showFixedFooter = !pastHero || nearBottom;

    return (
        <main className="w-full bg-[#010A0F] text-[#F4EFE6] selection:bg-[#AA8352]/20 overflow-x-hidden">
            <h1 className="sr-only">Hyperbaric Oxygen Therapy (HBOT) at The Lab 33 — O₂ Sessions in The Pearl, Doha</h1>
            <PageSchema
                serviceName="Hyperbaric Oxygen Therapy (HBOT)"
                serviceDescription="Pressurised pure-oxygen therapy at The Lab 33 in The Pearl, Doha. O₂ Sessions for accelerated cellular recovery, sleep, longevity, and cognitive performance."
                serviceSlug="hbot"
                breadcrumbLabel="Hyperbaric Oxygen Therapy"
                faqs={[
                    { q: "What is HBOT?", a: "Hyperbaric Oxygen Therapy is breathing pure oxygen inside a pressurised chamber to increase plasma oxygen saturation, accelerating cellular recovery and reducing inflammation." },
                    { q: "What does The Lab 33 call HBOT?", a: "The Lab 33 brands HBOT as O₂ Sessions — the same medical-grade hyperbaric protocol delivered as part of our recovery and longevity programme." },
                    { q: "Who is HBOT for?", a: "Executives, athletes, and longevity-focused members seeking faster recovery, better sleep, sharper cognition, and improved cellular health." },
                ]}
            />
            <BackgroundImage src="/hbot-hero-bronze-optimized.webp" alt="Hyperbaric oxygen therapy chamber at The Lab 33" />
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

                <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>
                    <Image
                        src="/hbot-hero-bronze-optimized.webp"
                        alt="Hyperbaric oxygen therapy chamber at The Lab 33"
                        fill priority quality={90} sizes="100vw"
                        className="object-cover object-center"
                        style={{ filter: "brightness(0.85)" }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,transparent_15%,#010A0F_100%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#010A0F] to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#010A0F]/60 to-transparent" />
                </motion.div>

                {/* Teal/cyan ambient glows */}
                <div className="absolute top-[20%] left-[15%] w-[60vw] h-[50vh] bg-[radial-gradient(circle,rgba(170,131,82,0.10)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[15%] right-[10%] w-[35vw] h-[35vh] bg-[radial-gradient(circle,rgba(139,107,64,0.07)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute top-[55%] left-[55%] w-[40vw] h-[40vh] bg-[radial-gradient(circle,rgba(199,181,145,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Floating particles (Optimized GPU Rendering) */}
                {PARTICLES.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full pointer-events-none will-change-transform"
                        style={{ width: p.w, height: p.h, left: p.left, top: p.top, opacity: p.opacity, backgroundColor: p.color }}
                        animate={{ y: [0, -14, 0], opacity: [p.opacity, p.opacity * 2.2, p.opacity] }}
                        transition={{ duration: 3.6 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.48 }}
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
                        <div className="w-8 h-[1px] bg-[#AA8352]/60" />
                        <span className="text-[11px] font-sans tracking-[0.6em] uppercase text-[#C7B591]">
                            Modality 03 · O₂ Sessions
                        </span>
                        <div className="w-8 h-[1px] bg-[#AA8352]/60" />
                    </motion.div>

                    <div className="overflow-hidden pt-6 -mt-6 pb-8 -mb-6">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.85]"
                            style={{ fontSize: "clamp(4.5rem, 13vw, 12rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F4EFE6] via-[#E6DBCA] to-[#F4EFE6]">
                                O₂ Sessions
                            </span>
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden pt-6 -mt-6 pb-8 mb-2">
                        <motion.h2
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light italic tracking-tight leading-[0.9]"
                            style={{ fontSize: "clamp(1.4rem, 4.5vw, 4rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#D4CBB3] via-[#C7B591] to-[#634A29]">
                                Hyperbaric Oxygen Therapy
                            </span>
                        </motion.h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-lg text-[#C3BBAD] font-sans font-light text-[15px] leading-relaxed mb-12"
                    >
                        Breathe pure oxygen inside a pressurised chamber, and let your body
                        heal at a rate that simply isn&apos;t possible at normal air pressure.
                    </motion.p>

                </div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[11px] font-sans tracking-[0.45em] uppercase text-[#AA8352]">Explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[1px] h-8 bg-gradient-to-b from-[#AA8352] to-transparent"
                    />
                </motion.div>
            </section>

            <section className="relative z-10 min-h-[100dvh] flex items-center w-full">
                <SectionReveal className="w-full mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
                    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-24 items-center">
                        <div>
                            <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-6">
                                How It Works
                            </p>
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.88]"
                                style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F4EFE6] via-[#E6DBCA] to-[#F4EFE6]">
                                    More oxygen.
                                </span>
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#C7B591] to-[#634A29]">
                                    Better support.
                                </span>
                            </h2>
                        </div>
                        <div className="flex flex-col gap-6 text-[#C3BBAD] font-sans font-light leading-relaxed">
                            <p className="text-[15px]">
                                At higher pressure, your body is able to absorb more oxygen than usual.
                            </p>
                            <p className="text-[15px]">
                                This allows oxygen to circulate more efficiently, supporting energy levels, mental clarity, and overall recovery.
                            </p>
                            <p className="text-[15px]">
                                It&apos;s a simple, quiet experience designed to help your body reset and recharge — especially after physical effort, travel, or demanding days.
                            </p>
                        </div>
                    </div>
                </SectionReveal>
            </section>

            <section className="relative z-10 min-h-[100dvh] flex items-center w-full py-8 lg:py-12">
                <div className="w-full mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
                    <SectionReveal>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F4EFE6] via-[#E6DBCA] to-[#F4EFE6]">
                                Six things that
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#C7B591] to-[#634A29]">
                                actually happen.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid md:grid-cols-2 gap-px">
                        {BENEFITS.map((b, i) => (
                            <SectionReveal key={b.code} delay={i * 0.06}>
                                <div className="group flex gap-6 p-7 lg:p-9 border border-[#AA8352]/[0.08] hover:border-[#AA8352]/25 bg-[#AA8352]/[0.01] hover:bg-[#AA8352]/[0.03] transition-all duration-500 relative overflow-hidden h-full">
                                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-[#C7B591] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                                    <span className="shrink-0 font-serif text-[13px] tracking-[0.3em] text-[#C7B591] pt-1">
                                        {b.code}
                                    </span>
                                    <div>
                                        <h3 className="font-serif font-light text-lg text-[#E6DBCA] group-hover:text-[#F4EFE6] mb-1 lg:mb-2 transition-colors duration-300">
                                            {b.title}
                                        </h3>
                                        <p className="text-[14px] font-sans text-[#B5AD9E] leading-relaxed group-hover:text-[#C3BBAD] transition-colors duration-300">
                                            {b.body}
                                        </p>
                                    </div>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 min-h-[100dvh] flex items-center w-full py-8 lg:py-12">
                <div className="w-full mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
                    <SectionReveal>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F4EFE6] via-[#E6DBCA] to-[#F4EFE6]">
                                What to expect.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="relative">
                        <div className="absolute left-[26px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#AA8352]/40 via-[#AA8352]/20 to-transparent hidden md:block" />
                        <div className="flex flex-col gap-0">
                            {HOW_IT_WORKS.map((step, i) => (
                                <SectionReveal key={step.num} delay={i * 0.08}>
                                    <div className="group flex gap-6 md:gap-8 py-5 lg:py-6 border-b border-[#AA8352]/[0.08] hover:border-[#AA8352]/25 transition-colors duration-500 relative">
                                        <div className="shrink-0 w-[42px] h-[42px] rounded-full border border-[#AA8352]/25 flex items-center justify-center group-hover:border-[#C7B591]/60 group-hover:bg-[#AA8352]/8 transition-all duration-500 z-10 bg-[#010A0F]">
                                            <span className="font-serif text-[12px] text-[#C7B591] group-hover:text-[#F4EFE6] transition-colors duration-300">
                                                {step.num}
                                            </span>
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <h3 className="font-serif font-light text-xl text-[#E6DBCA] group-hover:text-[#F4EFE6] mb-2 transition-colors duration-300">
                                                {step.title}
                                            </h3>
                                            <p className="text-[14px] font-sans text-[#B5AD9E] leading-relaxed group-hover:text-[#C3BBAD] transition-colors duration-400 max-w-2xl">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </SectionReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 min-h-[100dvh] flex items-center w-full py-8 lg:py-12">
                <div className="w-full mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
                    <SectionReveal>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F4EFE6] via-[#E6DBCA] to-[#F4EFE6]">
                                Athletes & active lifestyles
                            </span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            {USE_CASES.map((uc, i) => (
                                <motion.div
                                    key={uc.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="group flex flex-col items-start gap-4 p-7 border border-[#AA8352]/10 bg-[#AA8352]/[0.02] hover:border-[#AA8352]/25 hover:bg-[#AA8352]/[0.06] transition-all duration-400"
                                >
                                    <span className="text-[#C7B591] text-[10px] shrink-0">✦</span>
                                    <span className="text-[15px] font-sans text-[#B5AD9E] leading-snug group-hover:text-[#F4EFE6] transition-colors duration-300">
                                        {uc.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </SectionReveal>
                </div>
            </section>

            <section className="relative z-10 min-h-[100dvh] flex items-center justify-center w-full py-8 lg:py-12">
                <div className="w-full mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/15 bg-[#AA8352]/[0.02] px-8 py-10 md:px-16 md:py-12 flex flex-col items-center justify-center text-center">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/35" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/35" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/35" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/35" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(170,131,82,0.08)_0%,transparent_80%)] pointer-events-none" />

                            <h3 className="relative z-10 font-serif font-light text-2xl md:text-3xl lg:text-4xl text-[#F4EFE6] leading-relaxed max-w-3xl">
                                Your body heals better with more oxygen.<br />
                                <span className="text-[#C7B591]">More oxygen. Better recovery. Stronger you.</span>
                            </h3>
                        </div>
                    </SectionReveal>
                </div>
            </section>

            <section className="relative z-10 min-h-[100dvh] flex items-center w-full py-8 lg:py-12">
                <div className="w-full mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/15 bg-[#AA8352]/[0.02] px-8 py-10 md:px-16 text-center">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/40" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/40" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/40" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/40" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(170,131,82,0.05)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#D4CBB3] mb-5 relative z-10">
                                Opening Q2 2026 · Porto Arabia
                            </p>
                            <h3
                                className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-5 relative z-10"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F4EFE6] via-[#E6DBCA] to-[#F4EFE6]">
                                    Ready to breathe different?
                                </span>
                            </h3>
                            <p className="text-[15px] font-sans text-[#B5AD9E] max-w-sm mx-auto leading-relaxed mb-10 relative z-10">
                                Join the waitlist and secure your spot as a founding member of The Lab 33.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Link
                                    href="/waitlist"
                                    className={CTA_BUTTON_THEME}
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-[#AA8352]/15 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                                    <span className="font-serif text-[13px] tracking-[0.4em] uppercase text-[#2B2B28] font-bold group-hover/cta:text-[#010A0F] relative z-10">
                                        Join Waitlist
                                    </span>
                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11" className="text-[#2B2B28] font-bold group-hover/cta:text-[#010A0F] transition-colors relative z-10">
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/about"
                                    className="group/sec no-underline inline-flex items-center gap-3 px-8 py-4 border border-[#AA8352]/25 hover:border-[#AA8352]/50 transition-all duration-500"
                                >
                                    <span className="font-serif text-[13px] tracking-[0.4em] uppercase text-[#E6DBCA]/70 group-hover/sec:text-[#F4EFE6] transition-colors">
                                        Explore More
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </SectionReveal>

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
                                <Link href="/red-light-sauna" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                    <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Red Light Sauna</span>
                                </Link>
                            </div>
                        </SectionReveal>
                    </section>
                </div>
            </section>
        </main>
    );
}