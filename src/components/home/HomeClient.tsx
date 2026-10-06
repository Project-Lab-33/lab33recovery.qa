"use client";

import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/shared/BackgroundImage";
import SiteHUD from "@/components/shared/SiteHUD";
import InfinityLoader from "@/components/shared/InfinityLoader";
import LocationIndicator from "@/components/shared/LocationIndicator";
import Copyright from "@/components/shared/Copyright";
import SocialIcons from "@/components/shared/SocialIcons";

const FACILITIES = [
    { num: "01", name: "Cold Plunge", href: "/cold-plunge", image: "/cold-plunge-hero.webp", color: "#4A90D9", glow: "rgba(74,144,217,0.18)", tag: "Cold water immersion" },
    { num: "02", name: "Hot Tub", href: "/hot-tub", image: "/cinematic-lab-interior.webp", color: "#F59E0B", glow: "rgba(245,158,11,0.18)", tag: "Contrast heat" },
    { num: "03", name: "Red Light Sauna", href: "/red-light-sauna", image: "/red-light-sauna-hero.webp", color: "#E05050", glow: "rgba(224,80,80,0.18)", tag: "Infrared light therapy" },
    { num: "04", name: "O₂ Sessions", href: "/hbot", image: "/hbot-hero-bronze-optimized.webp", color: "#AA8352", glow: "rgba(170,131,82,0.18)", tag: "Oxygen therapy" },
    { num: "05", name: "Normatec", href: "/normatec", image: "/normatec-hero.webp", color: "#9B6DFF", glow: "rgba(155,109,255,0.18)", tag: "Compression recovery" },
    { num: "06", name: "Mobility & Stretch", href: "/guided-stretch", image: "/guided-stretch-hero.webp", color: "#34D399", glow: "rgba(52,211,153,0.18)", tag: "Guided stretching" },
];

const MARQUEE_ITEMS = ["Cold Plunge", "Hot Tub", "Red Light Sauna", "O₂ Sessions", "Normatec", "Mobility & Stretch",
    "Cold Plunge", "Hot Tub", "Red Light Sauna", "O₂ Sessions", "Normatec", "Mobility & Stretch"];

const STATS = [
    { val: "6", label: "Facilities" },
    { val: "Q2 '26", label: "Opening" },
    { val: "The Pearl", label: "Location" },
    { val: "100%", label: "Science-backed" },
];


const FLOAT_ACCENTS = [
    { x: "-18vw", y: "-12vh", size: 6, delay: 0, dur: 14 },
    { x: "22vw", y: "-18vh", size: 4, delay: 2, dur: 18 },
    { x: "-25vw", y: "10vh", size: 5, delay: 4, dur: 16 },
    { x: "19vw", y: "14vh", size: 3, delay: 1, dur: 20 },
    { x: "-10vw", y: "22vh", size: 4, delay: 3, dur: 15 },
    { x: "28vw", y: "-6vh", size: 5, delay: 5, dur: 17 },
    { x: "-30vw", y: "-4vh", size: 3, delay: 2.5, dur: 19 },
    { x: "12vw", y: "20vh", size: 6, delay: 1.5, dur: 13 },
];


function SectionReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        >{children}</motion.div>
    );
}

export default function HomeClient() {
    /* 3-D parallax */
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const spring = { damping: 30, stiffness: 150 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), spring);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), spring);
    const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), spring);
    const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), spring);

    /* Raw mouse position for cursor spotlight */
    const rawMouseX = useMotionValue(-500);
    const rawMouseY = useMotionValue(-500);

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth - 0.5);
            mouseY.set(e.clientY / window.innerHeight - 0.5);
            rawMouseX.set(e.clientX - 250);
            rawMouseY.set(e.clientY - 250);
        };
        window.addEventListener("mousemove", fn, { passive: true });
        return () => window.removeEventListener("mousemove", fn);
    }, [mouseX, mouseY, rawMouseX, rawMouseY]);

    /* 5-tap admin easter egg */
    const router = useRouter();
    const [, setLogoTaps] = useState(0);
    const tapRef = useRef<NodeJS.Timeout | null>(null);
    const handleLogoClick = useCallback(() => {
        if (tapRef.current) clearTimeout(tapRef.current);
        setLogoTaps(p => {
            const n = p + 1;
            if (n >= 5) { setTimeout(() => { router.push("/admin/login"); setLogoTaps(0); }, 0); return 0; }
            tapRef.current = setTimeout(() => setLogoTaps(0), 3000);
            return n;
        });
    }, [router]);
    useEffect(() => () => { if (tapRef.current) clearTimeout(tapRef.current); }, []);

    /* Fixed footer fade */
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const [pastHero, setPastHero] = useState(false);
    const [nearBottom, setNearBottom] = useState(false);
    useEffect(() => { const u = scrollYProgress.on("change", v => setPastHero(v > 0.02)); return u; }, [scrollYProgress]);
    useEffect(() => {
        const fn = () => setNearBottom(document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 120);
        window.addEventListener("scroll", fn, { passive: true }); fn();
        return () => window.removeEventListener("scroll", fn);
    }, []);
    const showFooter = !pastHero || nearBottom;

    /* Interactive facility list hover state */
    const [active, setActive] = useState<typeof FACILITIES[0] | null>(null);

    /* Mouse cursor tracker for facility section */
    const cursorX = useMotionValue(-200);
    const cursorY = useMotionValue(-200);
    const springCursor = { damping: 20, stiffness: 200 };
    const smoothCursorX = useSpring(cursorX, springCursor);
    const smoothCursorY = useSpring(cursorY, springCursor);

    const facilityRef = useRef<HTMLDivElement>(null);
    const handleFacilityMouseMove = (e: React.MouseEvent) => {
        const rect = facilityRef.current?.getBoundingClientRect();
        if (!rect) return;
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
    };

    return (
        <main className="w-full bg-[#080807] text-[#F5F5F0] overflow-x-hidden selection:bg-[#D4AF77]/15">

            {/* Shimmer keyframes + styles */}
            <style jsx global>{`
                @keyframes hero-shimmer {
                    0%, 100% { text-shadow: 0 0 60px rgba(212,175,119,0.04), 0 0 120px rgba(212,175,119,0.02); }
                    50% { text-shadow: 0 0 80px rgba(212,175,119,0.15), 0 0 160px rgba(212,175,119,0.06); }
                }
                @keyframes hero-stroke-pulse {
                    0%, 100% { -webkit-text-stroke-color: rgba(212,175,119,0.35); text-shadow: 0 0 40px rgba(212,175,119,0.05); }
                    50% { -webkit-text-stroke-color: rgba(212,175,119,0.7); text-shadow: 0 0 80px rgba(212,175,119,0.2); }
                }
                @keyframes float-diamond {
                    0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.25; }
                    50% { transform: rotate(45deg) scale(1.3); opacity: 0.5; }
                }
                .hero-char-shimmer { animation: hero-shimmer 4s ease-in-out infinite; }
                .hero-33-pulse { animation: hero-stroke-pulse 3.5s ease-in-out infinite; }
            `}</style>

            {/* Grain overlay — sits above everything */}
            <div className="fixed inset-0 z-[300] pointer-events-none opacity-[0.028]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px 200px" }}
            />

            <h1 className="sr-only">The Lab 33 — Recovery Lab in Qatar | Cold Plunge, Hyperbaric Oxygen, Infrared Sauna, Normatec & Guided Stretch at The Pearl, Doha</h1>
            <BackgroundImage alt="The Lab 33 premium recovery lab interior in The Pearl, Qatar" />
            <SiteHUD />

            <AnimatePresence>
                {showFooter && (
                    <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="contents">
                        <LocationIndicator /><SocialIcons /><Copyright />
                    </motion.div>
                )}
            </AnimatePresence>

            <section ref={heroRef} className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

                {/* Cursor-following gold spotlight */}
                <motion.div
                    className="absolute top-0 left-0 z-[10] pointer-events-none rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: 500,
                        height: 500,
                        x: rawMouseX,
                        y: rawMouseY,
                        background: "radial-gradient(circle, rgba(212,175,119,0.06) 0%, transparent 65%)",
                        filter: "blur(40px)",
                    }}
                />

                {/* Pulsating gradient orbs — two for depth */}
                <motion.div
                    className="absolute z-[11] pointer-events-none rounded-full"
                    style={{
                        width: "clamp(350px, 50vw, 800px)",
                        height: "clamp(350px, 50vw, 800px)",
                        background: "radial-gradient(circle, rgba(212,175,119,0.1) 0%, rgba(212,175,119,0.03) 40%, transparent 70%)",
                        filter: "blur(50px)",
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute z-[11] pointer-events-none rounded-full"
                    style={{
                        width: "clamp(200px, 30vw, 500px)",
                        height: "clamp(200px, 30vw, 500px)",
                        background: "radial-gradient(circle, rgba(245,245,240,0.04) 0%, transparent 60%)",
                        filter: "blur(40px)",
                    }}
                    animate={{
                        scale: [1.1, 0.9, 1.1],
                        opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />


                {/* Floating diamond accents */}
                {FLOAT_ACCENTS.map((a, i) => (
                    <motion.div
                        key={`accent-${i}`}
                        className="absolute z-[14] pointer-events-none"
                        style={{ left: `calc(50% + ${a.x})`, top: `calc(50% + ${a.y})` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 + a.delay * 0.3, duration: 1.5 }}
                    >
                        <motion.div
                            className="border border-[#D4AF77]/20"
                            style={{ width: a.size, height: a.size, transform: "rotate(45deg)" }}
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.2, 0.5, 0.2],
                                rotate: [45, 45, 45],
                                y: [0, -15, 0],
                            }}
                            transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut", delay: a.delay }}
                        />
                    </motion.div>
                ))}

                {/* Infinity loader (existing) */}
                <div className="absolute inset-0 flex items-center justify-center -translate-y-[5vh] md:translate-y-0 pointer-events-none z-[12]">
                    <InfinityLoader />
                </div>

                {/* Main content — 3D parallax */}
                <div className="relative z-20 flex flex-col items-center -translate-y-[3vh] md:translate-y-0 px-6" style={{ perspective: 1200 }}>
                    <motion.div
                        className="flex flex-col items-center"
                        style={{ rotateX, rotateY, x: translateX, y: translateY, transformStyle: "preserve-3d" }}
                    >

                        <Image src="/logo-primary.webp" alt="The Lab 33" width={800} height={300}
                            className="w-[80vw] md:w-[600px] lg:w-[800px] h-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.12)] cursor-default select-none"
                            priority sizes="(max-width: 768px) 80vw, (max-width: 1024px) 600px, 800px"
                            onClick={handleLogoClick}
                        />

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="font-serif font-light text-[11px] md:text-[13px] tracking-[0.65em] uppercase text-white/30 text-center mt-8 md:mt-10"
                        >
                            Qatar&apos;s first dedicated recovery lab
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-8"
                        >
                            <Link href="https://apps.apple.com/gb/app/the-lab-33/id6761324375"
                                className="group no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#D4AF77]/30 hover:border-[#D4AF77]/70 transition-all duration-600"
                            >
                                <div className="absolute inset-0 bg-[#D4AF77]/[0.05] group-hover:bg-[#D4AF77]/[0.12] transition-colors duration-500" />
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[#D4AF77]/15 to-transparent transition-transform duration-700 pointer-events-none" />
                                <span className="font-serif text-[11px] tracking-[0.5em] uppercase text-[#D4AF77] relative z-10">Download the App</span>
                                <svg viewBox="0 0 16 16" fill="none" width="9" height="9" className="text-[#D4AF77]/50 group-hover:text-[#D4AF77] group-hover:translate-x-1 transition-all duration-400 relative z-10">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </motion.div>

                    </motion.div>
                </div>

                {/* Scroll cue */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 1 }}
                    className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                    <motion.p
                        className="font-sans text-[8px] tracking-[0.5em] uppercase text-white/20 mb-1"
                        animate={{ opacity: [0.15, 0.5, 0.15] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Scroll
                    </motion.p>
                    <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF77]/30 via-white/15 to-transparent"
                    />
                </motion.div>
            </section>

            <div className="relative z-10 bg-[#080807]">

                <div className="relative py-7 border-y border-white/[0.05] overflow-hidden">
                    <motion.div
                        className="flex whitespace-nowrap gap-16"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    >
                        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                            <span key={i} className="font-serif text-[13px] tracking-[0.45em] uppercase text-white/18 shrink-0 px-8">
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </div>

                <section className="relative min-h-[100dvh] w-full flex flex-col justify-center overflow-hidden py-10 lg:py-16">
                    {/* Ambient background */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(212,175,119,0.025), transparent 60%)"
                    }} />

                    <div className="max-w-[1300px] mx-auto px-6 md:px-12 lg:px-20">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-center">

                            {/* LEFT — Decorative side */}
                            <SectionReveal className="relative flex flex-col items-center lg:items-start">
                                {/* Large decorative "33" watermark */}
                                <motion.div
                                    className="absolute -top-8 lg:-top-16 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 pointer-events-none select-none"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <span
                                        className="font-serif font-extralight"
                                        style={{
                                            fontSize: "clamp(8rem, 20vw, 18rem)",
                                            lineHeight: 0.8,
                                            color: "transparent",
                                            WebkitTextStroke: "1px rgba(212,175,119,0.08)",
                                        }}
                                    >
                                        33
                                    </span>
                                </motion.div>

                                {/* Gold vertical accent bar */}
                                <motion.div
                                    className="w-[2px] rounded-full mb-8 hidden lg:block"
                                    style={{ background: "linear-gradient(to bottom, rgba(212,175,119,0.5), rgba(212,175,119,0.05))" }}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 80 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                />

                                {/* Label */}
                                <motion.p
                                    className="text-[10px] font-sans tracking-[0.6em] uppercase text-[#D4AF77]/60 mb-4 relative z-10"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    Our belief
                                </motion.p>

                                {/* Horizontal accent */}
                                <motion.div
                                    className="h-[1px] relative"
                                    style={{ background: "linear-gradient(90deg, rgba(212,175,119,0.4), transparent)" }}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: 100 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </SectionReveal>

                            {/* RIGHT — Manifesto text */}
                            <div className="relative">
                                {["Your body can recover", "faster than you think.", "We built the place", "to prove it."].map((line, lineIdx) => (
                                    <div key={lineIdx} className="overflow-hidden">
                                        <motion.div
                                            className="font-serif font-light tracking-tight leading-[0.92]"
                                            style={{ fontSize: "clamp(2.2rem, 6vw, 5.5rem)" }}
                                            initial={{ y: "100%", opacity: 0 }}
                                            whileInView={{ y: 0, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 1,
                                                delay: lineIdx * 0.12,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                        >
                                            {line.split(" ").map((word, wordIdx) => (
                                                <span
                                                    key={wordIdx}
                                                    className="inline-block mr-[0.22em]"
                                                    style={{
                                                        color: lineIdx < 2 ? "rgba(245,245,240,0.92)" : "rgba(212,175,119,0.85)",
                                                    }}
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                        </motion.div>
                                    </div>
                                ))}

                                {/* Tagline under manifesto */}
                                <motion.p
                                    className="mt-8 text-[13px] md:text-[15px] font-sans text-white/35 leading-relaxed max-w-md"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                >
                                    Six science-backed modalities. One space. Designed to push your recovery further than you thought possible.
                                </motion.p>
                            </div>
                        </div>
                    </div>

                <div className="px-6 md:px-12 lg:px-20 mt-auto pt-8">
                    <div className="max-w-[1300px] mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {STATS.map((s, i) => (
                                <motion.div
                                    key={s.label}
                                    className={`group relative overflow-hidden rounded-lg cursor-default ${i === 0 ? "row-span-1 md:row-span-2" : ""}`}
                                    style={{
                                        background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        backdropFilter: "blur(10px)",
                                    }}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ borderColor: "rgba(212,175,119,0.2)" }}
                                >
                                    {/* Hover glow */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(212,175,119,0.06), transparent 70%)" }}
                                    />

                                    {/* Corner accent */}
                                    <motion.div
                                        className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-[#D4AF77]/40 to-transparent"
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                                        style={{ transformOrigin: "left" }}
                                    />
                                    <motion.div
                                        className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-[#D4AF77]/40 to-transparent"
                                        initial={{ scaleY: 0 }}
                                        whileInView={{ scaleY: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                                        style={{ transformOrigin: "top" }}
                                    />

                                    <div className={`flex flex-col items-center justify-center text-center relative z-10 ${i === 0 ? "py-12 md:py-0 md:h-full" : "py-10 md:py-12"}`}>
                                        <motion.span
                                            className={`font-serif text-[#D4AF77] leading-none mb-3 ${i === 0 ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"}`}
                                            whileHover={{ scale: 1.06 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            {s.val}
                                        </motion.span>
                                        <span className="text-[10px] font-sans tracking-[0.5em] uppercase text-white/25 group-hover:text-white/50 transition-colors duration-500">
                                            {s.label}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
                </section>

                <section
                    ref={facilityRef}
                    className="relative overflow-hidden min-h-[100dvh] w-full flex flex-col justify-center"
                    onMouseMove={handleFacilityMouseMove}
                    onMouseLeave={() => setActive(null)}
                >
                    {/* Dynamic full-bleed background */}
                    <AnimatePresence mode="sync">
                        {active && (
                            <motion.div key={active.name}
                                className="absolute inset-0 z-0 pointer-events-none"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.55, ease: "easeOut" }}
                            >
                                <Image src={active.image} alt={active.name} fill
                                    className="object-cover object-center"
                                    style={{ filter: "brightness(0.12) saturate(0.6)" }}
                                    sizes="100vw"
                                />
                                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${active.glow}, transparent 70%)` }} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cursor dot */}
                    <motion.div
                        className="absolute z-20 pointer-events-none rounded-full flex items-center justify-center"
                        style={{
                            x: smoothCursorX, y: smoothCursorY,
                            translateX: "-50%", translateY: "-50%",
                            width: 80, height: 80,
                        }}
                    >
                        <AnimatePresence>
                            {active && (
                                <motion.div
                                    key="cursor-ring"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-full h-full rounded-full border flex items-center justify-center"
                                    style={{ borderColor: active.color + "80", backgroundColor: active.color + "12" }}
                                >
                                    <svg viewBox="0 0 16 16" fill="none" width="12" height="12" style={{ color: active.color }}>
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Header */}
                    <div className="relative z-10 pt-20 pb-6 px-6 md:px-12 lg:px-20 max-w-[1200px] mx-auto">
                        <SectionReveal>
                            <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-4">The Six Facilities</p>
                            <h2 className="font-serif font-light tracking-tight leading-[0.9] text-white"
                                style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
                            >
                                Choose what your body needs.
                            </h2>
                        </SectionReveal>
                    </div>

                    {/* Facility rows */}
                    <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 pb-20">
                        {FACILITIES.map((f, i) => (
                            <SectionReveal key={f.name} delay={i * 0.07}>
                                <Link href={f.href} onMouseEnter={() => setActive(f)}
                                    className="group no-underline flex items-center justify-between py-6 lg:py-8 border-b border-white/[0.06] hover:border-white/12 transition-all duration-500 relative overflow-hidden"
                                >
                                    {/* Left */}
                                    <div className="flex items-center gap-4 md:gap-8">
                                        <motion.span
                                            animate={{ color: active?.name === f.name ? f.color : "rgba(255,255,255,0.2)" }}
                                            transition={{ duration: 0.3 }}
                                            className="font-serif text-[11px] tracking-[0.4em] w-8 shrink-0"
                                        >
                                            {f.num}
                                        </motion.span>
                                        <motion.span
                                            animate={{
                                                color: active?.name === f.name ? "#ffffff" : "rgba(245,245,240,0.65)",
                                                x: active?.name === f.name ? 6 : 0,
                                            }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                            className="font-serif font-light leading-none"
                                            style={{ fontSize: "clamp(1.8rem, 5vw, 4.5rem)" }}
                                        >
                                            {f.name}
                                        </motion.span>
                                    </div>

                                    {/* Right */}
                                    <div className="flex items-center gap-4 md:gap-8 shrink-0">
                                        <motion.span
                                            animate={{ opacity: active?.name === f.name ? 1 : 0, x: active?.name === f.name ? 0 : 10 }}
                                            transition={{ duration: 0.35 }}
                                            className="hidden md:block font-sans text-[11px] tracking-[0.4em] uppercase"
                                            style={{ color: f.color }}
                                        >
                                            {f.tag}
                                        </motion.span>
                                        <motion.div
                                            animate={{ x: active?.name === f.name ? 0 : -8, opacity: active?.name === f.name ? 1 : 0 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <svg viewBox="0 0 28 28" fill="none" width="28" height="28" style={{ color: f.color }}>
                                                <path d="M5 14h18M17 8l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </motion.div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-[1px] origin-left"
                                        style={{ backgroundColor: f.color }}
                                        animate={{ scaleX: active?.name === f.name ? 1 : 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </Link>
                            </SectionReveal>
                        ))}
                    </div>
                </section>

                <div className="relative py-7 border-y border-white/[0.04] overflow-hidden">
                    <motion.div
                        className="flex whitespace-nowrap gap-16"
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    >
                        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                            <span key={i} className="font-serif text-[13px] tracking-[0.45em] uppercase text-white/10 shrink-0 px-8">
                                ✦ {item}
                            </span>
                        ))}
                    </motion.div>
                </div>

                <section className="min-h-[100dvh] w-full flex flex-col justify-center py-20 px-6 md:px-12 lg:px-20">
                    <SectionReveal>
                        <div className="max-w-[900px] mx-auto">

                            {/* Large editorial heading */}
                            <p className="text-[11px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/70 mb-8">
                                Opening Q2 2026 · Porto Arabia, The Pearl
                            </p>

                            <div className="mb-12">
                                {["The waitlist", "is open."].map((line, i) => (
                                    <div key={i}
                                        className="font-serif font-light tracking-tight leading-[0.86] block"
                                        style={{
                                            fontSize: "clamp(3rem, 9vw, 9rem)",
                                            color: i === 0 ? "rgba(245,245,240,0.92)" : "transparent",
                                            WebkitTextStroke: i === 1 ? "1px rgba(212,175,119,0.6)" : undefined,
                                        }}
                                    >
                                        {line}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center justify-between">
                                <p className="text-[16px] font-sans text-white/48 max-w-xs leading-relaxed">
                                    Early members get priority booking and founding rates — locked in permanently.
                                </p>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Link href="https://apps.apple.com/gb/app/the-lab-33/id6761324375"
                                        className="group no-underline relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 border border-[#D4AF77]/45 hover:border-[#D4AF77]/80 transition-all duration-500"
                                    >
                                        <div className="absolute inset-0 bg-[#D4AF77]/[0.07] group-hover:bg-[#D4AF77]/12 transition-colors duration-500" />
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[#D4AF77]/15 to-transparent transition-transform duration-700 pointer-events-none" />
                                        <span className="font-serif text-[12px] tracking-[0.45em] uppercase text-[#D4AF77] relative z-10">Download the App</span>
                                        <svg viewBox="0 0 16 16" fill="none" width="10" height="10" className="text-[#D4AF77]/70 group-hover:text-[#D4AF77] group-hover:translate-x-0.5 transition-all relative z-10">
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Bottom rule */}
                            <div className="mt-20 pt-12 border-t border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <span className="font-serif text-[13px] font-light text-white/28 tracking-wide">
                                    Porto Arabia · The Pearl-Qatar · Doha
                                </span>
                                <div className="flex items-center gap-6">
                                    {[
                                        { label: "About", href: "/about" },
                                        { label: "Contact", href: "/contact" },
                                        { label: "Download App", href: "https://apps.apple.com/gb/app/the-lab-33/id6761324375" },
                                    ].map(l => (
                                        <Link key={l.label} href={l.href}
                                            className="no-underline font-serif text-[11px] tracking-[0.4em] uppercase text-white/28 hover:text-white/60 transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SectionReveal>
                </section>

            </div>
        </main>
    );
}
