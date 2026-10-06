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

const FACILITIES = [
    {
        code: "01",
        name: "Cold Plunge",
        href: "/cold-plunge",
        tagline: "Cold water immersion",
        desc: "Jump into cold water for a few minutes and feel the reset. Less soreness, better mood, more energy.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.4" />
            </svg>
        ),
    },
    {
        code: "02",
        name: "Hot Tub",
        href: "/hot-tub",
        tagline: "Contrast heat",
        desc: "Combined with the cold plunge, the hot tub creates contrast recovery, helping your muscles relax, improving circulation, and leaving your body feeling fully reset.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M4 14h16M6 10c0-2 1-3 3-3s3 1 3 3M12 10c0-2 1-3 3-3s3 1 3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <rect x="3" y="14" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.1" />
            </svg>
        ),
    },
    {
        code: "03",
        name: "Red Light Sauna",
        href: "/red-light-sauna",
        tagline: "Infrared light therapy",
        desc: "Heat and red light help your body relax, loosen up, and recover after training or long days.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.1" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        code: "04",
        name: "O₂ Sessions",
        href: "/hbot",
        tagline: "Oxygen chamber",
        desc: "Relax in a pressurized O₂ session designed to help your body recharge and feel refreshed.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <rect x="2" y="7" width="20" height="10" rx="5" stroke="currentColor" strokeWidth="1.1" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.1" />
                <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        code: "05",
        name: "Normatec",
        href: "/normatec",
        tagline: "Compression recovery",
        desc: "Compression sleeves gently squeeze your legs to help circulation and reduce heaviness after training or long days.",
        icon: (
            <svg viewBox="0 0 24 14" fill="none" width="26" height="14">
                <path d="M1 7 Q4 1 7 7 Q10 13 13 7 Q16 1 19 7 Q21 11 23 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        code: "06",
        name: "Mobility & Stretch",
        href: "/guided-stretch",
        tagline: "Guided stretching",
        desc: "Guided stretch sessions help release tight muscles, improve mobility, and keep your body ready to perform.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M9 21v-7l-2-2V9a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3l-2 2v7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 8V6a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M9 15h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
        ),
    },
];

const PILLARS = [
    {
        label: "Built for Recovery",
        desc: "Everything here is designed to help your body reset, recharge, and perform better.",
    },
    {
        label: "Performance Focused",
        desc: "We use methods trusted by athletes, trainers, and people who demand more from their body.",
    },
    {
        label: "Calm but Strong",
        desc: "A space to slow down, recover properly, and come back stronger.",
    },
    {
        label: "Consistency Wins",
        desc: "Recovery works when you do it regularly. We help you make it part of your routine.",
    },
];

function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

function GoldRule() {
    return (
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF77]/25 to-transparent my-20 lg:my-28" />
    );
}

export default function AboutClient() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    // Show fixed HUD footer at top (hero) and again when near the bottom of the page
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
        <main className="w-full bg-[#050505] text-[#F5F5F0] selection:bg-[#D4AF77]/25 overflow-x-hidden">
            <h1 className="sr-only">About The Lab 33 — Doha&apos;s Biohacking &amp; Recovery Lab in Porto Arabia, The Pearl</h1>
            <PageSchema
                serviceName="The Lab 33 — Recovery & Longevity Lab"
                serviceDescription="Doha's premier biohacking and recovery lab, in Porto Arabia, The Pearl. The science, story, and philosophy behind The Lab 33."
                serviceSlug="about"
                breadcrumbLabel="About"
            />
            <BackgroundImage alt="The Lab 33 biohacking and recovery lab interior" />
            <SiteHUD />

            {/* Fixed footer elements — visible at top and at page bottom */}
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
                {/* Parallax background image */}
                <motion.div className="absolute inset-0 z-0" style={{ y: heroY, opacity: heroOpacity }}>
                    <Image
                        src="/cinematic-lab-interior.webp"
                        alt="The Lab 33 interior"
                        fill
                        className="object-cover object-center"
                        priority
                        quality={85}
                        sizes="100vw"
                        style={{ filter: "brightness(0.22) saturate(0.8)" }}
                    />
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,transparent_30%,#050505_100%)]" />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050505] to-transparent" />
                </motion.div>

                {/* Gold ambient */}
                <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vh] bg-[radial-gradient(circle,rgba(212,175,119,0.07)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vh] bg-[radial-gradient(circle,rgba(212,175,119,0.04)_0%,transparent_65%)] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-6">
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[9px] font-sans tracking-[0.6em] uppercase text-[#D4AF77]/80 mb-6"
                    >
                        The Lab 33 · Porto Arabia · Doha, Qatar
                    </motion.p>

                    <div className="overflow-hidden mb-2">
                        <motion.h1
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.86]"
                            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/25">
                                The Future
                            </span>
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden mb-10">
                        <motion.p
                            aria-hidden="true"
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.1, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                            className="font-serif font-light uppercase tracking-tight leading-[0.86]"
                            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#D4AF77] to-[#8B7355]/50">
                                of Recovery
                            </span>
                        </motion.p>
                    </div>


                    {/* Scroll cue */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    >
                        <span className="text-[8px] font-sans tracking-[0.45em] uppercase text-white/25">Scroll</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[1px] h-8 bg-gradient-to-b from-[#D4AF77]/50 to-transparent"
                        />
                    </motion.div>
                </div>
            </section>

            <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">

                <section className="pt-20 lg:pt-32 pb-6">
                    <SectionReveal>
                        <p className="text-[8px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-5">
                            Who We Are
                        </p>
                        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-start">
                            <div>
                                <h2
                                    className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8"
                                    style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                                        Built different.
                                    </span>
                                    <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#D4AF77] to-[#8B7355]/60">
                                        Built to perform.
                                    </span>
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-[1px] bg-[#D4AF77]" />
                                    <span className="text-[8px] font-sans tracking-[0.38em] uppercase text-[#8B7355]">
                                        Q2 2026 · Porto Arabia, The Pearl
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-5 text-[#A8A29E] font-sans font-light leading-relaxed">
                                <p className="text-[15px]">
                                    The Lab 33 is Qatar&#39;s first recovery lab built for performance.
                                    Not a gym. Not a spa.
                                    A space designed for athletes, professionals, and anyone who wants to move better, feel better, and recover the right way.
                                </p>
                                <p className="text-[15px]">
                                    Cold plunge, hot tub, red light sauna, O₂ sessions, compression, guided stretch — all under one roof.
                                </p>
                                <p className="text-[15px]">
                                    Opening at The Pearl – Porto Arabia in Q2 2026.
                                    The future of recovery is coming to Doha.
                                </p>
                            </div>
                        </div>
                    </SectionReveal>
                </section>

                <GoldRule />

                <section>
                    <SectionReveal>
                        <p className="text-[8px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-5">
                            Our Approach
                        </p>
                        <h2
                            className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-14 lg:mb-20"
                            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                                The Lab 33 Method
                            </span>
                        </h2>
                    </SectionReveal>

                    <div className="grid sm:grid-cols-2 gap-px border border-[#D4AF77]/10">
                        {PILLARS.map((p, i) => (
                            <SectionReveal key={p.label} delay={i * 0.08}>
                                <div className="group p-8 lg:p-10 border border-[#D4AF77]/[0.07] bg-white/[0.01] hover:bg-[#D4AF77]/[0.03] transition-colors duration-500 h-full relative overflow-hidden">
                                    {/* hover scan */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF77]/40 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                                    <span className="block text-[10px] font-sans tracking-[0.5em] uppercase text-[#D4AF77]/50 mb-4">
                                        0{i + 1}
                                    </span>
                                    <h3 className="font-serif font-light text-2xl text-white mb-4 group-hover:text-[#D4AF77] transition-colors duration-300">
                                        {p.label}
                                    </h3>
                                    <p className="text-[13px] font-sans text-[#8B7355] leading-relaxed">
                                        {p.desc}
                                    </p>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </section>

                <GoldRule />

                <section>
                    <SectionReveal>
                        <p className="text-[8px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-5">
                            Our Facilities
                        </p>
                        <div className="flex items-end justify-between gap-4 mb-14 lg:mb-20 flex-wrap">
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.9]"
                                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                                    Six facilities.
                                </span>
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#D4AF77] to-[#8B7355]/60">
                                    One mission.
                                </span>
                            </h2>
                            <p className="text-[13px] font-sans text-[#8B7355] max-w-xs leading-relaxed hidden md:block">
                                Each method is independently powerful. Combined, they create a simple and powerful way to recover, recharge, and stay strong.
                            </p>
                        </div>
                    </SectionReveal>

                    <div className="flex flex-col">
                        {FACILITIES.map((m, i) => (
                            <SectionReveal key={m.code} delay={i * 0.06}>
                                <Link href={m.href} className="group relative flex items-start gap-6 md:gap-10 py-8 border-b border-[#D4AF77]/[0.08] hover:border-[#D4AF77]/25 transition-colors duration-500 no-underline">
                                    {/* Number */}
                                    <span className="shrink-0 font-serif text-[11px] tracking-[0.3em] text-[#D4AF77]/40 group-hover:text-[#D4AF77]/70 transition-colors duration-300 pt-1">
                                        {m.code}
                                    </span>
                                    {/* Divider */}
                                    <div className="w-[1px] self-stretch bg-gradient-to-b from-[#D4AF77]/15 via-[#D4AF77]/08 to-transparent shrink-0 group-hover:from-[#D4AF77]/40 transition-colors duration-500" />
                                    {/* Icon */}
                                    <div className="shrink-0 text-[#8B7355] group-hover:text-[#D4AF77] transition-colors duration-300 mt-1 hidden sm:block">
                                        {m.icon}
                                    </div>
                                    {/* Text */}
                                    <div className="flex-1 flex flex-col md:flex-row md:items-start md:gap-10">
                                        <div className="md:w-48 shrink-0 mb-2 md:mb-0">
                                            <h3 className="font-serif font-light text-xl text-white group-hover:text-[#D4AF77] transition-colors duration-300 mb-1">
                                                {m.name}
                                            </h3>
                                            <span className="text-[9px] font-sans tracking-[0.35em] uppercase text-[#8B7355]">
                                                {m.tagline}
                                            </span>
                                        </div>
                                        <p className="text-[13px] font-sans text-[#8B7355]/80 leading-relaxed flex-1 group-hover:text-[#A8A29E] transition-colors duration-300">
                                            {m.desc}
                                        </p>
                                    </div>
                                    {/* Arrow */}
                                    <motion.div
                                        className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
                                    >
                                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" className="text-[#D4AF77]/60">
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </Link>
                            </SectionReveal>
                        ))}
                    </div>
                </section>

                <GoldRule />

                <section className="pb-6">
                    <SectionReveal>
                        <p className="text-[8px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-5">
                            Find Us
                        </p>
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div>
                                <h2
                                    className="font-serif font-light uppercase tracking-tight leading-[0.9] mb-8"
                                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                                        Porto Arabia,
                                    </span>
                                    <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#D4AF77] to-[#8B7355]/60">
                                        The Pearl
                                    </span>
                                </h2>
                                <p className="text-[15px] font-sans text-[#A8A29E] font-light leading-relaxed mb-8 max-w-sm">
                                    We&apos;re in The Pearl — right in Porto Arabia. Easy to get to, hard to
                                    find anywhere else in Doha. Come see what we&apos;re building.
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF77] animate-pulse shrink-0" />
                                    <span className="text-[9px] font-sans tracking-[0.4em] uppercase text-[#8B7355]">
                                        Opening Q2 2026
                                    </span>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="relative h-[280px] lg:h-[340px] overflow-hidden border border-[#D4AF77]/10">
                                <div className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-none bg-gradient-to-b from-[#050505]/90 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 h-10 z-10 pointer-events-none bg-gradient-to-t from-[#050505]/90 to-transparent" />
                                <div className="absolute inset-0 z-[5] pointer-events-none shadow-[inset_0_0_40px_rgba(5,5,5,0.5)]" />
                                <iframe
                                    title="The Lab 33 — Porto Arabia, The Pearl, Doha"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d51.5462962!3d25.3722422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45c3b59e7934a9%3A0xcab011f7508727e9!2sThe+LAB+33!5e0!3m2!1sen!2sqa!4v1741400000000!5m2!1sen!2sqa"
                                    className="absolute inset-0 w-full h-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    style={{ filter: "invert(92%) hue-rotate(180deg) saturate(0.25) brightness(0.68) contrast(1.1)" }}
                                />
                            </div>
                        </div>
                    </SectionReveal>
                </section>

                <GoldRule />

                <section className="pb-28 lg:pb-36">
                    <SectionReveal>
                        <div className="relative overflow-hidden border border-[#D4AF77]/15 bg-[#D4AF77]/[0.03] px-8 py-12 md:px-16 md:py-16 text-center">
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#D4AF77]/40" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#D4AF77]/40" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#D4AF77]/40" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#D4AF77]/40" />
                            {/* Glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(212,175,119,0.06)_0%,transparent_70%)] pointer-events-none" />

                            <p className="text-[8px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-5 relative z-10">
                                Membership · Q2 2026
                            </p>
                            <h2
                                className="font-serif font-light uppercase tracking-tight leading-[0.9] relative z-10 mb-6"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                                    Secure your spot
                                </span>
                            </h2>
                            <p className="text-[14px] font-sans text-[#8B7355] max-w-md mx-auto leading-relaxed mb-10 relative z-10">
                                Sign up early and get first access, member rates, and the chance to
                                help shape what The Lab 33 becomes.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Link
                                    href="https://apps.apple.com/gb/app/the-lab-33/id6761324375"
                                    className="group/cta no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#D4AF77]/40 bg-[#D4AF77]/[0.06] hover:border-[#D4AF77]/80 hover:bg-[#D4AF77]/10 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-[#D4AF77]/10 to-transparent transition-transform duration-[800ms] pointer-events-none" />
                                    <span className="font-serif text-[11px] tracking-[0.4em] uppercase text-[#D4AF77] group-hover/cta:text-[#D4AF77] relative z-10">
                                        Download the App
                                    </span>
                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11" className="text-[#D4AF77]/50 group-hover/cta:text-[#D4AF77] transition-colors relative z-10">
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/contact"
                                    className="group/sec no-underline inline-flex items-center gap-3 px-8 py-4 border border-white/[0.07] hover:border-white/15 transition-all duration-500"
                                >
                                    <span className="font-serif text-[11px] tracking-[0.4em] uppercase text-white/50 group-hover/sec:text-white/80 transition-colors">
                                        Get in Touch
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </SectionReveal>
                </section>

            </div>
        </main>
    );
}
