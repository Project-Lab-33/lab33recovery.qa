"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
    {
        index: "01",
        label: "Home",
        sub: "Back to the main experience",
        href: "/",
    },
    {
        index: "02",
        label: "About",
        sub: "Who we are & our story",
        href: "/about",
    },
    {
        index: "04",
        label: "Contact",
        sub: "Get in touch with us",
        href: "/contact",
    },
];

const FACILITIES = [
    {
        name: "Cold Plunge",
        tagline: "Cold water immersion",
        href: "/cold-plunge",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M10 2v16M2 10h16M4.93 4.93l10.14 10.14M15.07 4.93L4.93 15.07" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" fillOpacity="0.5" />
            </svg>
        ),
    },
    {
        name: "Hot Tub",
        tagline: "Contrast heat",
        href: "/hot-tub",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M3 12h14M5 8.5c0-1.8 1-2.5 2.5-2.5S10 6.7 10 8.5M10 8.5c0-1.8 1-2.5 2.5-2.5S15 6.7 15 8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <rect x="2" y="12" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
            </svg>
        ),
    },
    {
        name: "Infrared Sauna",
        tagline: "Infrared light therapy",
        href: "/red-light-sauna",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="10" cy="10" r="2.8" stroke="currentColor" strokeWidth="1.1" />
                <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.22 4.22l1.77 1.77M14.01 14.01l1.77 1.77M4.22 15.78l1.77-1.77M14.01 5.99l1.77-1.77" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: "O₂ Sessions",
        tagline: "Oxygen chamber",
        href: "/hbot",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <rect x="2" y="5" width="16" height="10" rx="5" stroke="currentColor" strokeWidth="1.1" />
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.1" />
                <path d="M10 7.5v5M7.5 10h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: "Normatec",
        tagline: "Compression recovery",
        href: "/normatec",
        icon: (
            <svg viewBox="0 0 22 14" fill="none" width="18" height="12">
                <path d="M1 7 Q3.75 1 6.5 7 Q9.25 13 12 7 Q14.75 1 17.5 7 Q19.25 11 21 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: "Mobility & Stretch",
        tagline: "Guided stretching",
        href: "/guided-stretch",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M7 17v-6l-2-2V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2l-2 2v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 6V4.5a1.5 1.5 0 0 1 3 0V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M8 13h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
        ),
    },
];

const socialLinks = [
    { label: "Facebook", href: "https://www.facebook.com/thelab33.qa", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 4.16v1.957h3.696l-.259 3.667h-3.437v7.98H9.101Z" /></svg> },
    { label: "Instagram", href: "https://www.instagram.com/thelab33.qa/", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
    { label: "TikTok", href: "https://www.tiktok.com/@thelab33.qa", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" /></svg> },
];

export default function MenuButton({ contained = false }: { contained?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [facilitiesOpen, setFacilitiesOpen] = useState(false);

    /* Lock scroll */
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    /* Escape key */
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                className={contained
                    ? "pointer-events-auto"
                    : "fixed top-6 right-6 md:top-8 md:right-8 z-[200] pointer-events-auto"
                }
                style={{ display: isOpen ? "none" : (contained ? "flex" : "block") }}
            >
                <button
                    id="menu-toggle"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(p => !p)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="p-0 border-none bg-transparent cursor-pointer outline-none"
                >
                    <motion.div
                        className={`relative px-4 md:px-5 h-10 md:h-auto md:py-2.5 rounded-xl transition-all duration-700 backdrop-blur-xl flex items-center justify-center gap-3 overflow-hidden ${isHovered ? "bg-[#D4AF77]/10 shadow-[0_0_30px_rgba(212,175,119,0.12)]" : "bg-white/[0.03]"}`}
                    >
                        {/* Kinetic border */}
                        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 rounded-[inherit] border border-white/10" />
                            <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent_0%,black_25%,black_75%,transparent_100%)]">
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <motion.rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="14" ry="14" fill="none" stroke="#D4AF77" strokeWidth="1" strokeDasharray="40 1000" strokeLinecap="round"
                                        animate={{ strokeDashoffset: [0, -1040] }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="opacity-40"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Animated hamburger → X */}
                        <div className="relative z-10 w-5 h-4 flex flex-col justify-between">
                            <motion.span animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className={`block h-[1px] w-full origin-center transition-colors duration-500 ${isOpen || isHovered ? "bg-[#D4AF77]" : "bg-[#F5F5F0]/70"}`} />
                            <motion.span animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.25 }}
                                className={`block h-[1px] w-3/4 origin-left transition-colors duration-500 ${isHovered ? "bg-[#D4AF77]/60" : "bg-[#F5F5F0]/40"}`} />
                            <motion.span animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className={`block h-[1px] w-full origin-center transition-colors duration-500 ${isOpen || isHovered ? "bg-[#D4AF77]" : "bg-[#F5F5F0]/70"}`} />
                        </div>

                        <motion.span
                            key={isOpen ? "close" : "menu"}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className={`hidden md:inline relative z-10 font-serif text-[10px] md:text-xs tracking-[0.4em] uppercase font-light transition-colors duration-500 ${isOpen || isHovered ? "text-[#D4AF77]" : "text-[#F5F5F0]"}`}
                        >
                            {isOpen ? "Close" : "Menu"}
                        </motion.span>

                        <motion.div animate={{ opacity: isOpen || isHovered ? 1 : 0, scale: isOpen || isHovered ? 1.2 : 1 }}
                            className="absolute inset-0 bg-[#D4AF77]/5 blur-[60px] pointer-events-none -z-10 rounded-full" />
                    </motion.div>
                </button>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="full-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[190] flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        <div className="absolute inset-0 overflow-hidden">
                            <Image
                                src="/cinematic-lab-interior.webp"
                                alt=""
                                fill
                                className="object-cover scale-105"
                                quality={60}
                                priority
                                sizes="100vw"
                                style={{ filter: "blur(12px)", transform: "scale(1.1)" }}
                            />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(7,6,5,0.96) 0%, rgba(12,10,8,0.93) 50%, rgba(7,6,5,0.97) 100%)" }} />
                            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                        </div>
                        <div className="absolute top-0 left-0 w-[40vw] h-[40vh] bg-[radial-gradient(circle,rgba(212,175,119,0.06)_0%,transparent_70%)] pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-[radial-gradient(circle,rgba(212,175,119,0.04)_0%,transparent_65%)] pointer-events-none" />

                        <motion.div className="absolute top-0 left-0 right-0 h-[1px]"
                            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,119,0.5) 30%, rgba(212,175,119,0.8) 50%, rgba(212,175,119,0.5) 70%, transparent 100%)" }}
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
                        <motion.div className="absolute bottom-0 left-0 right-0 h-[1px]"
                            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,119,0.3) 50%, transparent 100%)" }}
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />

                        <div className="relative z-10 h-full flex flex-col px-5 md:px-16 lg:px-24">

                            {/* SHARED TOP BAR — matches SiteHUD: Time | Logo | Close */}
                            <motion.div
                                className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center h-20 md:h-24"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
                            >
                                {/* Left — label on desktop, empty spacer on mobile */}
                                <div className="flex items-center">
                                    <span className="hidden md:block text-[9px] tracking-[0.5em] uppercase font-serif font-light text-[#8B7355]">
                                        The Lab 33 · Recovery Lab
                                    </span>
                                </div>
                                {/* Center — smaller on mobile, normal on desktop */}
                                <Image src="/logo-primary.webp" alt="The Lab 33" width={160} height={60}
                                    className="h-5 md:h-9 w-auto select-none pointer-events-none justify-self-center"
                                    style={{ filter: "brightness(0.7) sepia(0.25) saturate(1.1)", opacity: 0.6 }}
                                    draggable={false} priority
                                />
                                {/* Right: close */}
                                <button onClick={() => setIsOpen(false)} aria-label="Close menu"
                                    className="justify-self-end group flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#D4AF77]/10 hover:border-[#D4AF77]/30 transition-all duration-300 cursor-pointer outline-none">
                                    <svg viewBox="0 0 20 20" fill="none" width="14" height="14" className="text-[#8B7355] group-hover:text-[#D4AF77] transition-colors duration-300">
                                        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </motion.div>

                            {/* MOBILE LAYOUT (hidden on md+) */}
                            <div className="flex md:hidden flex-col flex-1 min-h-0 pb-safe">

                                {/* Gold rule */}
                                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF77]/30 to-transparent" />

                                {/* NAV — fills full remaining height evenly */}
                                <nav aria-label="Site navigation" className="flex-1 flex flex-col justify-center">
                                    {[
                                        { index: "01", label: "Home", sub: "Back to the main experience", href: "/" },
                                        { index: "02", label: "About", sub: "Who we are & our story", href: "/about" },
                                    ].map((item, i) => (
                                        <motion.div key={item.label} className="relative"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <Link href={item.href} onClick={() => setIsOpen(false)}
                                                className="group flex items-center gap-4 py-2 border-b border-white/[0.06] no-underline">
                                                <span className="font-serif text-[10px] tracking-[0.3em] text-[#8B7355]/50 w-6 shrink-0 group-active:text-[#D4AF77] transition-colors">
                                                    {item.index}
                                                </span>
                                                <div className="w-[1px] h-9 bg-gradient-to-b from-transparent via-[#8B7355]/20 to-transparent shrink-0" />
                                                <div className="flex-1 flex flex-col gap-0.5">
                                                    <span className="text-[2rem] leading-none font-serif font-light tracking-tight text-[#F5F5F0] group-active:text-[#D4AF77] transition-colors duration-150">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[9px] tracking-[0.28em] uppercase font-serif text-[#8B7355]">
                                                        {item.sub}
                                                    </span>
                                                </div>
                                                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"
                                                    className="text-[#8B7355]/30 group-active:text-[#D4AF77] transition-colors shrink-0">
                                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </Link>
                                        </motion.div>
                                    ))}

                                    {/* Facilities — expandable accordion on mobile */}
                                    <motion.div className="relative"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.24, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <button
                                            onClick={() => setFacilitiesOpen(p => !p)}
                                            className="w-full group flex items-center gap-4 py-2 border-b border-white/[0.06] bg-transparent outline-none cursor-pointer text-left"
                                        >
                                            <span className={`font-serif text-[10px] tracking-[0.3em] w-6 shrink-0 transition-colors ${facilitiesOpen ? "text-[#D4AF77]" : "text-[#8B7355]/50"}`}>
                                                03
                                            </span>
                                            <div className={`w-[1px] h-9 shrink-0 transition-colors ${facilitiesOpen ? "bg-[#D4AF77]/40" : "bg-gradient-to-b from-transparent via-[#8B7355]/20 to-transparent"}`} />
                                            <div className="flex-1 flex flex-col gap-0.5">
                                                <span className={`text-[2rem] leading-none font-serif font-light tracking-tight transition-colors duration-150 ${facilitiesOpen ? "text-[#D4AF77]" : "text-[#F5F5F0]"}`}>
                                                    Facilities
                                                </span>
                                                <span className="text-[9px] tracking-[0.28em] uppercase font-serif text-[#8B7355]">
                                                    Our recovery facilities
                                                </span>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: facilitiesOpen ? 45 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`shrink-0 transition-colors ${facilitiesOpen ? "text-[#D4AF77]" : "text-[#8B7355]/30"}`}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                                </svg>
                                            </motion.div>
                                        </button>

                                        {/* Expandable facility grid */}
                                        <AnimatePresence>
                                            {facilitiesOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-2 gap-2 pt-3 pb-3 pl-9">
                                                        {FACILITIES.map((m, fi) => (
                                                            <motion.div key={m.name}
                                                                initial={{ opacity: 0, y: 6 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: fi * 0.05, duration: 0.3, ease: "easeOut" }}
                                                            >
                                                                <Link href={m.href} onClick={() => setIsOpen(false)}
                                                                    className="flex flex-col gap-1 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] active:bg-[#D4AF77]/[0.06] active:border-[#D4AF77]/20 transition-all duration-300 no-underline"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-[#8B7355] shrink-0">{m.icon}</div>
                                                                        <span className="font-serif text-[12px] font-light text-[#F5F5F0] leading-tight">{m.name}</span>
                                                                    </div>
                                                                </Link>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Contact */}
                                    <motion.div className="relative"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.31, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <Link href="/contact" onClick={() => setIsOpen(false)}
                                            className="group flex items-center gap-4 py-2 border-b border-white/[0.06] no-underline">
                                            <span className="font-serif text-[10px] tracking-[0.3em] text-[#8B7355]/50 w-6 shrink-0 group-active:text-[#D4AF77] transition-colors">
                                                04
                                            </span>
                                            <div className="w-[1px] h-9 bg-gradient-to-b from-transparent via-[#8B7355]/20 to-transparent shrink-0" />
                                            <div className="flex-1 flex flex-col gap-0.5">
                                                <span className="text-[2rem] leading-none font-serif font-light tracking-tight text-[#F5F5F0] group-active:text-[#D4AF77] transition-colors duration-150">
                                                    Contact
                                                </span>
                                                <span className="text-[9px] tracking-[0.28em] uppercase font-serif text-[#8B7355]">
                                                    Get in touch with us
                                                </span>
                                            </div>
                                            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"
                                                className="text-[#8B7355]/30 group-active:text-[#D4AF77] transition-colors shrink-0">
                                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>
                                    </motion.div>
                                </nav>

                                <motion.div className="shrink-0 pb-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45, duration: 0.45, ease: "easeOut" }}
                                >
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <Link href="/waitlist" onClick={() => setIsOpen(false)}
                                            className="group no-underline flex flex-col gap-1 px-3 py-3.5 rounded-xl border border-[#D4AF77]/25 bg-[#D4AF77]/[0.04] active:bg-[#D4AF77]/[0.08] transition-all">
                                            <span className="text-[8px] tracking-[0.4em] uppercase font-serif text-[#8B7355]">Membership</span>
                                            <div className="flex items-center justify-between">
                                                <span className="font-serif text-sm font-light text-[#F5F5F0]/80 group-active:text-[#D4AF77] transition-colors">Join Waitlist</span>
                                                <svg viewBox="0 0 16 16" fill="none" width="10" height="10" className="text-[#D4AF77]/50 shrink-0">
                                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </Link>
                                        <Link href="/hiring" onClick={() => setIsOpen(false)}
                                            className="group no-underline flex flex-col gap-1 px-3 py-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02] active:bg-white/[0.04] transition-all">
                                            <span className="text-[8px] tracking-[0.4em] uppercase font-serif text-[#8B7355]">Careers</span>
                                            <div className="flex items-center justify-between">
                                                <span className="font-serif text-sm font-light text-[#F5F5F0]/80 group-active:text-[#D4AF77] transition-colors">Join the Team</span>
                                                <svg viewBox="0 0 16 16" fill="none" width="10" height="10" className="text-[#8B7355]/50 shrink-0">
                                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="h-[1px] bg-gradient-to-r from-[#D4AF77]/20 via-[#D4AF77]/10 to-transparent mb-3" />
                                    <div className="flex items-center justify-between">
                                        <span className="font-serif text-[10px] text-[#F5F5F0]/35 tracking-wider">The Pearl, Qatar</span>
                                        <div className="flex items-center gap-4">
                                            {socialLinks.map(s => (
                                                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                                                    className="text-[#8B7355] active:text-[#D4AF77] transition-colors">
                                                    {s.icon}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* DESKTOP LAYOUT (hidden below md) */}
                            <div className="hidden md:flex flex-col flex-1 min-h-0">
                                <div className="flex-1 min-h-0 overflow-y-auto flex flex-row gap-8">
                                    {/* LEFT COL */}
                                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                                        <motion.div className="flex items-center gap-4 mb-10"
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}>
                                            <div className="h-[1px] w-8 bg-[#D4AF77]/50" />
                                            <span className="text-[9px] tracking-[0.45em] uppercase font-serif font-light text-[#8B7355]">Navigation</span>
                                        </motion.div>
                                        <nav aria-label="Site navigation" className="flex flex-col gap-0">
                                            <NavItem link={navLinks[0]} index={0} onClose={() => setIsOpen(false)} />
                                            <NavItem link={navLinks[1]} index={1} onClose={() => setIsOpen(false)} />
                                            <FacilitiesItem animIndex={2} isOpen={facilitiesOpen} onToggle={() => setFacilitiesOpen(p => !p)} onClose={() => setIsOpen(false)} />
                                            <NavItem link={navLinks[2]} index={3} onClose={() => setIsOpen(false)} />
                                        </nav>
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.48, duration: 0.5, ease: "easeOut" }} className="mt-8">
                                            <div className="h-[1px] bg-gradient-to-r from-[#D4AF77]/25 via-[#D4AF77]/10 to-transparent mb-5" />
                                            <div className="flex items-stretch gap-3">

                                                <Link href="/waitlist" onClick={() => setIsOpen(false)}
                                                    className="group/w relative no-underline flex-1 overflow-hidden flex flex-col justify-between gap-3 px-5 py-4
                                                               bg-gradient-to-br from-[#D4AF77]/18 via-[#D4AF77]/10 to-[#8B7355]/8
                                                               border border-[#D4AF77]/35 hover:border-[#D4AF77]/70
                                                               hover:from-[#D4AF77]/24 hover:via-[#D4AF77]/14 hover:to-[#8B7355]/10
                                                               transition-all duration-500">
                                                    <div className="absolute inset-0 -translate-x-full group-hover/w:translate-x-full
                                                                    bg-gradient-to-r from-transparent via-[#D4AF77]/10 to-transparent
                                                                    transition-transform duration-[900ms] ease-in-out pointer-events-none" />
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="text-[8px] tracking-[0.45em] uppercase font-sans font-light text-[#D4AF77]/70">Membership</span>
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[#D4AF77]/30 group-hover/w:border-[#D4AF77]/70 group-hover/w:bg-[#D4AF77]/10 transition-all duration-300">
                                                            <svg viewBox="0 0 12 12" fill="none" width="8" height="8" className="text-[#D4AF77]/60 group-hover/w:text-[#D4AF77] transition-colors">
                                                                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="relative z-10">
                                                        <p className="font-serif text-xl font-light leading-tight text-[#F5F5F0] group-hover/w:text-[#D4AF77] transition-colors duration-300">Join Waitlist</p>
                                                        <p className="text-[9px] font-sans text-[#8B7355] tracking-wide mt-0.5">Opening Q2 2026 · Porto Arabia</p>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#D4AF77]/50 via-[#D4AF77]/20 to-transparent
                                                                    scale-x-0 group-hover/w:scale-x-100 origin-left transition-transform duration-500" />
                                                </Link>

                                                <Link href="/hiring" onClick={() => setIsOpen(false)}
                                                    className="group/h relative no-underline flex-1 overflow-hidden flex flex-col justify-between gap-3 px-5 py-4
                                                               border border-white/[0.08] hover:border-[#D4AF77]/30 bg-white/[0.02] hover:bg-[#D4AF77]/[0.04]
                                                               transition-all duration-500">
                                                    <div className="absolute inset-0 -translate-x-full group-hover/h:translate-x-full
                                                                    bg-gradient-to-r from-transparent via-white/[0.03] to-transparent
                                                                    transition-transform duration-[900ms] ease-in-out pointer-events-none" />
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="text-[8px] tracking-[0.45em] uppercase font-sans font-light text-[#8B7355]/70 group-hover/h:text-[#8B7355] transition-colors">Careers</span>
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white/10 group-hover/h:border-[#D4AF77]/30 transition-all duration-300">
                                                            <svg viewBox="0 0 12 12" fill="none" width="8" height="8" className="text-white/25 group-hover/h:text-[#D4AF77]/70 transition-colors">
                                                                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="relative z-10">
                                                        <p className="font-serif text-xl font-light leading-tight text-[#F5F5F0]/70 group-hover/h:text-[#F5F5F0] transition-colors duration-300">Join the Team</p>
                                                        <p className="text-[9px] font-sans text-[#8B7355]/60 tracking-wide mt-0.5">We&apos;re hiring · View open roles</p>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#D4AF77]/30 via-[#D4AF77]/10 to-transparent
                                                                    scale-x-0 group-hover/h:scale-x-100 origin-left transition-transform duration-500" />
                                                </Link>

                                            </div>
                                        </motion.div>

                                    </div>
                                    {/* RIGHT COL — facilities */}
                                    <AnimatePresence>
                                        {facilitiesOpen && (
                                            <motion.div key="facilities-panel"
                                                className="flex items-center justify-center shrink-0 w-[38%] lg:w-[42%]"
                                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                                                <div className="w-full">
                                                    <div className="flex items-center gap-3 mb-5">
                                                        <div className="h-[1px] w-6 bg-[#D4AF77]/50" />
                                                        <span className="text-[9px] tracking-[0.45em] uppercase font-serif font-light text-[#8B7355]">Our Facilities</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {FACILITIES.map((m, i) => (
                                                            <motion.div key={m.name}
                                                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                            >
                                                                <Link
                                                                    href={m.href}
                                                                    onClick={() => setIsOpen(false)}
                                                                    className="group/card flex flex-col gap-2 px-4 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-[#D4AF77]/[0.06] hover:border-[#D4AF77]/25 transition-all duration-300 no-underline block"
                                                                >
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="text-[#8B7355] group-hover/card:text-[#D4AF77] transition-colors shrink-0">{m.icon}</div>
                                                                        <span className="font-serif text-sm font-light text-[#F5F5F0] group-hover/card:text-[#D4AF77] transition-colors leading-tight">{m.name}</span>
                                                                    </div>
                                                                    <span className="font-serif text-[11px] tracking-[0.22em] uppercase font-light text-[#8B7355] group-hover/card:text-[#D4AF77]/70 leading-tight transition-colors">{m.tagline}</span>
                                                                </Link>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {/* BOTTOM BAR */}
                                <motion.div className="shrink-0 pb-10"
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}>
                                    <div className="h-[1px] w-full bg-gradient-to-r from-[#D4AF77]/20 via-[#D4AF77]/10 to-transparent mb-8" />
                                    <div className="flex items-center justify-between">
                                        <span className="font-serif text-sm font-light text-[#F5F5F0]/50 tracking-wide">Porto Arabia · The Pearl, Qatar</span>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[9px] tracking-[0.4em] uppercase font-serif font-light text-[#8B7355]">Follow</span>
                                            <div className="flex items-center gap-5">
                                                {socialLinks.map(s => (
                                                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                                                        className="text-[#8B7355] hover:text-[#D4AF77] hover:scale-110 transition-all duration-300">{s.icon}</a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function FacilitiesItem({
    animIndex,
    isOpen,
    onToggle,
    onClose,
}: {
    animIndex: number;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + animIndex * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
        >
            <button
                onClick={onToggle}
                className="w-full group flex items-center gap-3 md:gap-10 py-2.5 md:py-6 border-b border-white/[0.05] bg-transparent outline-none cursor-pointer text-left"
            >
                {/* Number */}
                <span className={`font-serif text-[10px] md:text-xs tracking-[0.3em] font-light w-6 shrink-0 select-none transition-colors duration-300 ${isOpen ? "text-[#D4AF77]" : "text-[#8B7355]/60 group-hover:text-[#D4AF77]"}`}>
                    03
                </span>

                {/* Vertical separator */}
                <div className={`w-[1px] h-4 md:h-12 shrink-0 transition-colors duration-300 ${isOpen ? "bg-[#D4AF77]/50" : "bg-[#8B7355]/20 group-hover:bg-[#D4AF77]/50"}`} />

                {/* Text */}
                <div className="flex flex-col gap-0 md:gap-1 flex-1">
                    <span className={`text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-light tracking-tight leading-none transition-colors duration-300 ${isOpen ? "text-[#D4AF77]" : "text-[#F5F5F0] group-hover:text-[#D4AF77]"}`}>
                        Facilities
                    </span>
                    <span className="hidden md:block text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.35em] uppercase font-serif font-light text-[#8B7355]">
                        Our facilities
                    </span>
                </div>

                {/* + on mobile, → on desktop */}
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0, opacity: isOpen ? 1 : 0.5 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`shrink-0 pr-1 md:pr-4 transition-colors duration-300 ${isOpen ? "text-[#D4AF77]" : "text-[#8B7355] group-hover:text-[#D4AF77]"}`}
                >
                    <svg className="block md:hidden" viewBox="0 0 24 24" fill="none" width="20" height="20">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <svg className="hidden md:block" viewBox="0 0 24 24" fill="none" width="26" height="26">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>

                {/* Sweep line */}
                <motion.div
                    animate={{ scaleX: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] origin-left"
                    style={{ background: "linear-gradient(90deg, rgba(212,175,119,0.8) 0%, rgba(212,175,119,0.2) 100%)" }}
                />
            </button>

            {/* Mobile inline grid */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden md:hidden"
                    >
                        <div className="grid grid-cols-2 gap-2 pt-3 pb-4 pl-9">
                            {FACILITIES.map((m, i) => (
                                <motion.div
                                    key={m.name}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                                >
                                    <Link
                                        href={m.href}
                                        onClick={onClose}
                                        className="flex flex-col gap-1 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-[#D4AF77]/[0.06] hover:border-[#D4AF77]/20 transition-all duration-300 no-underline block"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="text-[#8B7355] shrink-0">{m.icon}</div>
                                            <span className="font-serif text-[12px] font-light text-[#F5F5F0] leading-tight">{m.name}</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function NavItem({ link, index, onClose }: { link: typeof navLinks[0]; index: number; onClose: () => void }) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + index * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
        >
            <Link
                href={link.href}
                onClick={onClose}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="group flex items-center gap-3 md:gap-10 py-2.5 md:py-6 border-b border-white/[0.05] no-underline overflow-hidden"
            >
                {/* Number tag */}
                <motion.span
                    animate={{ color: hovered ? "#D4AF77" : "rgba(139,115,85,0.6)" }}
                    transition={{ duration: 0.35 }}
                    className="font-serif text-[10px] md:text-xs tracking-[0.3em] font-light w-6 shrink-0 select-none"
                >
                    {link.index}
                </motion.span>

                {/* Vertical separator */}
                <motion.div
                    animate={{ backgroundColor: hovered ? "rgba(212,175,119,0.5)" : "rgba(139,115,85,0.2)" }}
                    transition={{ duration: 0.35 }}
                    className="w-[1px] h-4 md:h-12 shrink-0"
                />

                {/* Text block */}
                <div className="flex flex-col gap-0 md:gap-1 flex-1">
                    <div className="overflow-hidden">
                        <motion.span
                            animate={{ y: hovered ? -2 : 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="block text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-light tracking-tight leading-none"
                            style={{ color: hovered ? "#D4AF77" : "#F5F5F0" }}
                        >
                            {link.label}
                        </motion.span>
                    </div>
                    <motion.span
                        animate={{ opacity: hovered ? 1 : 0.4, x: hovered ? 4 : 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="hidden md:block text-[9px] md:text-xs tracking-[0.3em] md:tracking-[0.35em] uppercase font-serif font-light text-[#8B7355]"
                    >
                        {link.sub}
                    </motion.span>
                </div>

                {/* Arrow → */}
                <motion.div
                    animate={{ x: hovered ? 0 : -10, opacity: hovered ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0 pr-2 md:pr-4"
                >
                    <svg viewBox="0 0 32 32" fill="none" width="32" height="32" className="text-[#D4AF77]">
                        <path d="M6 16h20M19 9l7 7-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>

                {/* Hover underline sweep */}
                <motion.div
                    animate={{ scaleX: hovered ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] origin-left"
                    style={{ background: "linear-gradient(90deg, rgba(212,175,119,0.8) 0%, rgba(212,175,119,0.2) 100%)" }}
                />
            </Link>
        </motion.div>
    );
}
