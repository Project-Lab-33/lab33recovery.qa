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
        title: "Move more freely",
        body: "Your body opens up. Less restriction, more ease in every movement — from training to daily life.",
    },
    {
        code: "02",
        title: "Better range of motion",
        body: "Tight areas release, joints move cleaner, and your body starts working the way it should.",
    },
    {
        code: "03",
        title: "Less tension, more control",
        body: "We don't just stretch — we teach your body how to hold and control new ranges.",
    },
    {
        code: "04",
        title: "Stronger posture, less fatigue",
        body: "When your body is aligned, everything feels lighter. You move better, and you last longer.",
    },
    {
        code: "05",
        title: "Better performance",
        body: "More range + more control = more output. You move faster, stronger, and more efficiently.",
    },
    {
        code: "06",
        title: "Stay ahead of tightness",
        body: "Regular sessions keep your body balanced, preventing stiffness from building up again.",
    },
];



const HOW_IT_WORKS = [
    {
        num: "01",
        title: "Understand your body",
        desc: "Every session starts with a proper assessment. Where's the pain? When did it start? What makes it better or worse? We listen before we touch anything.",
    },
    {
        num: "02",
        title: "Move & assess",
        desc: "We watch how you move — squat, hinge, reach, rotate. This reveals what's restricted, what's compensating, and where the actual problem is (often not where the pain is).",
    },
    {
        num: "03",
        title: "Guided stretch work",
        desc: "Targeted manual therapy using the right technique for what you need. Deep tissue, joint work, myofascial release, trigger points — one session often combines several.",
    },
    {
        num: "04",
        title: "Reset & leave better",
        desc: "You leave with specific things to do — stretches, drills, positions to avoid. Not a generic printout. Things specific to your body and your issue. Do them. They work.",
    },
];

// Static particles — no Math.random() to avoid SSR mismatch
const PARTICLES = [
    { w: 3, h: 3, left: "7%", top: "24%", opacity: 0.18, color: "#AA8352" },
    { w: 2, h: 2, left: "18%", top: "60%", opacity: 0.14, color: "#634A29" },
    { w: 4, h: 4, left: "30%", top: "16%", opacity: 0.10, color: "#AA8352" },
    { w: 2, h: 2, left: "45%", top: "72%", opacity: 0.16, color: "#634A29" },
    { w: 3, h: 3, left: "58%", top: "30%", opacity: 0.13, color: "#AA8352" },
    { w: 2, h: 2, left: "70%", top: "54%", opacity: 0.18, color: "#634A29" },
    { w: 4, h: 4, left: "82%", top: "20%", opacity: 0.11, color: "#AA8352" },
    { w: 2, h: 2, left: "92%", top: "65%", opacity: 0.15, color: "#634A29" },
];

function SectionReveal({ children, delay = 0, className = "" }: {
    children: React.ReactNode; delay?: number; className?: string;
}) {
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

export default function GuidedStretchClient() {
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
        <main className="w-full bg-[#010A0F] text-[#F4EFE6] selection:bg-[#AA8352]/20 overflow-x-hidden">
            <h1 className="sr-only">Guided Stretch &amp; Sports Bodywork at The Lab 33 — Deep Tissue Therapy in Doha</h1>
            <PageSchema
                serviceName="Guided Stretch & Sports Bodywork"
                serviceDescription="Guided Stretch at The Lab 33 in The Pearl, Doha. Deep tissue, myofascial release, cupping, and kinesiology taping by qualified sports therapists."
                serviceSlug="guided-stretch"
                breadcrumbLabel="Guided Stretch"
                faqs={[
                    { q: "What is Guided Stretch?", a: "Guided Stretch is sports manual therapy combining deep tissue work, myofascial release, cupping, and kinesiology taping — performed by qualified sports therapists." },
                    { q: "Who is it for?", a: "Anyone training hard or working at a desk all day — athletes, executives, and members rebuilding mobility after injury." },
                    { q: "How is it different from a regular massage?", a: "It's targeted bodywork, not relaxation. Sessions focus on increasing range of motion, releasing adhesions, and restoring movement quality." },
                ]}
            />
            <BackgroundImage src="/guided-stretch-hero.webp" alt="Guided stretch and mobility session at The Lab 33" />
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
                        src="/guided-stretch-hero.webp"
                        alt="Guided stretch session at The Lab 33"
                        fill priority quality={90} sizes="100vw"
                        className="object-cover object-center"
                        style={{ filter: "sepia(0.6) hue-rotate(-10deg) brightness(0.35) saturate(1.2)" }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,transparent_15%,#010A0F_100%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#010A0F] to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#010A0F]/60 to-transparent" />
                </motion.div>

                {/* Green ambient glows */}
                <div className="absolute top-[22%] left-[18%] w-[55vw] h-[50vh] bg-[radial-gradient(circle,rgba(170,131,82,0.09)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[18%] right-[12%] w-[30vw] h-[32vh] bg-[radial-gradient(circle,rgba(139,107,64,0.07)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute top-[50%] left-[50%] w-[45vw] h-[40vh] bg-[radial-gradient(circle,rgba(199,181,145,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Floating particles */}
                {PARTICLES.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{ width: p.w, height: p.h, left: p.left, top: p.top, opacity: p.opacity, backgroundColor: p.color, boxShadow: `0 0 ${p.w * 5}px ${p.color}` }}
                        animate={{ y: [0, -14, 0], opacity: [p.opacity, p.opacity * 2.4, p.opacity] }}
                        transition={{ duration: 3.8 + i * 0.55, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
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
                            MODALITY 05 — GUIDED MOBILITY
                        </span>
                        <div className="w-8 h-[1px] bg-[#AA8352]/60" />
                    </motion.div>

                    <div className="overflow-hidden mb-1">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.85]"
                            style={{ fontSize: "clamp(3rem, 10vw, 9.5rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-[#AA8352]">
                                Guided
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
                            style={{ fontSize: "clamp(3rem, 10vw, 9.5rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#C7B591] via-[#AA8352] to-[#634A29]">
                                Stretch
                            </span>
                        </motion.p>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-lg text-[#B5AD9E] font-sans font-light text-[15px] leading-relaxed mb-12"
                    >
                        Real guided work focused on movement, mobility, and recovery.<br className="hidden md:block" />
                        Built to release tension, improve range, and help your body move.
                    </motion.p>

                </div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[11px] font-sans tracking-[0.45em] uppercase text-[#AA8352]/60">Explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[1px] h-8 bg-gradient-to-b from-[#AA8352]/60 to-transparent"
                    />
                </motion.div>
            </section>

            <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">

                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-4">
                            What We Do
                        </p>
                        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-16 items-start">
                            <div>
                                <h2
                                    className="font-serif font-light uppercase tracking-tight leading-[0.88] mb-8"
                                    style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white">
                                        We improve how
                                    </span>
                                    <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#C7B591] to-[#634A29]">
                                        your body moves
                                    </span>
                                </h2>

                                {/* Visual: Session Focus */}
                                <div className="flex flex-col gap-4">
                                    <span className="text-[11px] font-sans uppercase tracking-widest text-[#C7B591] mb-1">Session Focus</span>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-l border-[#AA8352]/20 pl-5">
                                        {["Mobility", "Control", "Range", "Release"].map((focus, i) => (
                                            <SectionReveal key={focus} className="flex items-center gap-3" delay={i * 0.1}>
                                                <div className="w-[3px] h-[3px] rounded-full bg-[#AA8352]/80" />
                                                <span className="text-[15px] font-sans font-light text-[#B5AD9E] tracking-wide">{focus}</span>
                                            </SectionReveal>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 text-[#B5AD9E] font-sans font-light leading-relaxed">
                                <p className="text-[15px]">
                                    Guided Stretch is focused on improving how your body moves.
                                    Each session targets restriction, stiffness, and imbalance through controlled positioning and guided range.
                                </p>
                                <p className="text-[15px]">
                                    This is not passive.<br />
                                    You stay engaged — breathing, moving, and building control, not just flexibility.
                                </p>
                                <p className="text-[15px]">
                                    Whether you train, sit long hours, travel often, or feel tight — this is how you reset your body and move better.
                                </p>
                            </div>
                        </div>
                    </SectionReveal>
                </section>





                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-4">
                            Benefits
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white">
                                What
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#C7B591] to-[#634A29]">
                                changes.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid md:grid-cols-2 gap-px">
                        {BENEFITS.map((b, i) => (
                            <SectionReveal key={b.code} delay={i * 0.06}>
                                <div className="group flex gap-6 p-7 lg:p-9 border border-[#AA8352]/[0.07] hover:border-[#AA8352]/22 bg-transparent hover:bg-[#AA8352]/[0.03] transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-[#C7B591] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                                    <span className="shrink-0 font-serif text-[13px] tracking-[0.3em] text-[#C7B591] pt-1">
                                        {b.code}
                                    </span>
                                    <div>
                                        <h3 className="font-serif font-light text-lg text-[#E6DBCA] group-hover:text-white mb-3 transition-colors duration-300">
                                            {b.title}
                                        </h3>
                                        <p className="text-[15px] font-sans text-[#C3BBAD] leading-relaxed group-hover:text-[#B5AD9E] transition-colors duration-300">
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
                        <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-4">
                            How It Works
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8 lg:mb-12"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white">
                                The Session
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#C7B591] to-[#634A29]">
                                Flow.
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="relative">
                        <div className="absolute left-[21px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#AA8352]/40 via-[#AA8352]/20 to-transparent hidden md:block" />
                        <div className="flex flex-col gap-0">
                            {HOW_IT_WORKS.map((step, i) => (
                                <SectionReveal key={step.num} delay={i * 0.1}>
                                    <div className="group flex gap-6 md:gap-8 py-5 lg:py-6 border-b border-[#AA8352]/[0.08] hover:border-[#AA8352]/22 transition-colors duration-500 relative">
                                        <div className="shrink-0 w-[42px] h-[42px] rounded-full border border-[#AA8352]/25 flex items-center justify-center group-hover:border-[#C7B591]/60 group-hover:bg-[#AA8352]/8 transition-all duration-500 z-10 bg-[#010A0F]">
                                            <span className="font-serif text-[12px] text-[#C7B591] group-hover:text-white transition-colors duration-300">
                                                {step.num}
                                            </span>
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <h3 className="font-serif font-light text-xl text-[#E6DBCA] group-hover:text-white mb-1 transition-colors duration-300">
                                                {step.title}
                                            </h3>
                                            <p className="text-[14px] font-sans text-[#C3BBAD] leading-relaxed group-hover:text-[#B5AD9E] transition-colors duration-400 max-w-2xl">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </SectionReveal>
                            ))}
                        </div>
                    </div>
                </section>



                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/15 bg-[#AA8352]/[0.02] px-8 py-10 md:px-12 md:py-12">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/35" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/35" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/35" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/35" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(170,131,82,0.06)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[11px] font-sans tracking-[0.5em] uppercase text-[#C7B591] mb-4 relative z-10">
                                The Combo
                            </p>
                            <blockquote
                                className="relative z-10 font-serif font-light text-xl md:text-2xl lg:text-3xl text-[#E6DBCA] leading-relaxed mb-4 max-w-3xl"
                                style={{ fontStyle: "italic" }}
                            >
                                &quot;Guided stretch before compression or contrast creates a more complete recovery flow.
                                We open range, improve movement, and prepare your body — then the rest locks it in.&quot;
                            </blockquote>
                            <cite className="not-italic text-[12px] font-sans tracking-[0.35em] uppercase text-[#C7B591] relative z-10 block">
                                — THE LAB 33 RECOVERY
                            </cite>
                        </div>
                    </SectionReveal>
                </section>



                <section className="min-h-[100dvh] flex flex-col justify-center py-8 lg:py-12">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#AA8352]/18 bg-[#AA8352]/[0.02] px-8 py-10 md:px-12 text-center">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#AA8352]/40" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#AA8352]/40" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#AA8352]/40" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#AA8352]/40" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(170,131,82,0.05)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#C7B591] mb-4 relative z-10">
                                Opening Q2 2026 · Porto Arabia
                            </p>
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-5 relative z-10"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#E6DBCA] to-white">
                                    Ready to move properly again?
                                </span>
                            </h2>
                            <p className="text-[15px] font-sans text-[#C3BBAD] max-w-sm mx-auto leading-relaxed mb-10 relative z-10">
                                Join the waitlist. Be first through the door. Early members get priority booking and the best rates.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Link
                                    href="https://apps.apple.com/gb/app/the-lab-33/id6761324375"
                                    className="group/cta no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#AA8352]/45 bg-[#AA8352]/[0.07] hover:border-[#C7B591]/80 hover:bg-[#AA8352]/12 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-[#AA8352]/12 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                                    <span className="font-serif text-[13px] tracking-[0.4em] uppercase text-[#C7B591] relative z-10">
                                        Download the App
                                    </span>
                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11" className="text-[#AA8352] group-hover/cta:text-[#C7B591] transition-colors relative z-10">
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/about"
                                    className="group/sec no-underline inline-flex items-center gap-3 px-8 py-4 border border-white/[0.08] hover:border-white/20 transition-all duration-500"
                                >
                                    <span className="font-serif text-[13px] tracking-[0.4em] uppercase text-white/60 group-hover/sec:text-white/90 transition-colors">
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
                            <Link href="/normatec" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Normatec</span>
                            </Link>
                            <Link href="/cold-plunge" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Cold Plunge</span>
                            </Link>
                            <Link href="/red-light-sauna" className="no-underline px-6 py-3 border border-[#AA8352]/15 hover:border-[#AA8352]/40 transition-colors duration-500">
                                <span className="font-serif text-[13px] tracking-[0.3em] uppercase text-[#C7B591]/60 hover:text-[#C7B591]">Red Light Sauna</span>
                            </Link>
                        </div>
                    </SectionReveal>
                </section>

            </div>
        </main>
    );
}

