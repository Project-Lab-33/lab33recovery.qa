"use client";

import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import BackgroundImage from "@/components/shared/BackgroundImage";
import Copyright from "@/components/shared/Copyright";
import CareerModal from "@/components/hiring/CareerModal";
import ReturnButton from "@/components/shared/ReturnButton";
import LocationIndicator from "@/components/shared/LocationIndicator";
import SocialIcons from "@/components/shared/SocialIcons";
import SiteHUD from "@/components/shared/SiteHUD";
import { createClient } from "@/lib/supabase/client";

interface OpenRole {
    id: string;
    code: string;
    title: string;
    segment: string;
    description: string;
    requirements: string[];
    contactEmail: string;
}

export default function HiringClient() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [roles, setRoles] = useState<OpenRole[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    // Fetch active positions from Supabase
    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const { data, error } = await supabase
                    .from("positions")
                    .select("*")
                    .eq("status", "active")
                    .order("created_at", { ascending: true });
                if (error) throw error;
                setRoles((data || []).map((p: { id: string; title: string; code: string; segment: string; description: string; requirements?: string[]; contact_email?: string }) => ({
                    id: p.id,
                    code: p.code,
                    title: p.title,
                    segment: p.segment,
                    description: p.description,
                    requirements: p.requirements || [],
                    contactEmail: p.contact_email || '',
                })));
            } catch (err) { console.error("Failed to load positions:", err); }
            finally { setIsLoadingRoles(false); }
        };
        fetchPositions();
    }, [supabase]);

    const activeRole = roles[currentIndex] || null;

    const nextSlide = () => {
        if (roles.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % roles.length);
    };

    const prevSlide = () => {
        if (roles.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + roles.length) % roles.length);
    };

    // AUTO-PLAY ORCHESTRATION
    useEffect(() => {
        if (roles.length === 0) return;
        const timer = setInterval(() => {
            if (!isModalOpen) {
                nextSlide();
            }
        }, 6000); // Orbital cycle: 6 seconds

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, roles.length]);

    return (
        <main className="min-h-[100dvh] w-full bg-[#050505] text-[#F5F5F0] relative flex flex-col items-center justify-center selection:bg-[#D4AF77]/30 overflow-x-hidden">
            {/* ATMOSPHERIC LAYER */}
            <BackgroundImage alt="The Lab 33 careers and hiring in Doha, Qatar" />

            {/* HEADS UP DISPLAY */}
            <SiteHUD />
            <ReturnButton />
            <LocationIndicator />
            <SocialIcons />
            <Copyright />



            {/* MAIN INTERFACE - MOBILE OPTIMIZED (ZERO SCROLL) */}
            <div className="relative z-10 w-full max-w-[1800px] flex-1 flex flex-col items-center justify-center lg:grid lg:grid-cols-2 gap-6 lg:gap-0 px-6 md:px-16 pt-6 pb-12 md:pt-16 md:pb-24 lg:py-0 -translate-y-[6vh] md:translate-y-0">

                {/* LEFT PANEL: BRANDING & MISSION - HIDDEN ON MOBILE */}
                <div className="hidden md:flex flex-col justify-center items-center lg:items-start lg:pr-20 shrink-0 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="relative max-w-xl flex flex-col items-center lg:items-start"
                    >
                        <h1 className="font-serif text-4xl md:text-8xl xl:text-9xl text-white tracking-tight uppercase mb-1 md:mb-10 leading-[0.85]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#A8A29E]/40">
                                Hiring
                            </span>
                        </h1>
                        <p className="hidden md:block text-xl font-sans text-[#A8A29E] font-light leading-relaxed tracking-wide">
                            We invite distinguished professionals to join Qatar&apos;s premier recovery lab. Collaborate with us.
                        </p>
                    </motion.div>
                </div>

                {/* RIGHT PANEL: OPPORTUNITY QUEUE (SQUARE SLIDER) */}
                <div className="flex flex-col justify-start lg:justify-center items-center lg:border-l border-white/5 pt-0 lg:pl-32 shrink-0 w-full">
                    <div className="w-full px-0 md:px-4 flex flex-col items-center justify-center">
                        <section className="w-full flex flex-col items-center">


                            {/* HEADER */}
                            <div className="w-full flex items-center gap-3 md:gap-4 mb-3 md:mb-16">
                                <div className="w-2 h-2 rounded-full bg-[#D4AF77] animate-pulse shrink-0" />
                                <h3 className="text-[10px] md:text-[11px] font-sans text-[#F5F5F0] tracking-[0.3em] md:tracking-[0.5em] uppercase opacity-70 whitespace-nowrap">
                                    Position {roles.length > 0 ? currentIndex + 1 : 0} / {roles.length}
                                </h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF77]/40 to-transparent" />

                                {/* NAVIGATION BUTTONS */}
                                <div className="flex gap-2 md:gap-4 shrink-0">
                                    <button
                                        onClick={prevSlide}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-white/10 rounded-full hover:border-[#D4AF77]/40 hover:bg-[#D4AF77]/5 transition-all duration-500 group/nav"
                                    >
                                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white/40 group-hover/nav:text-white transition-colors" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-white/10 rounded-full hover:border-[#D4AF77]/40 hover:bg-[#D4AF77]/5 transition-all duration-500 group/nav"
                                    >
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/40 group-hover/nav:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* SLIDER CONTAINER - RESTORED SQUARE GEOMETRY */}
                            <div className="relative w-full aspect-square max-w-[360px] md:max-w-[500px] lg:max-w-[600px]">
                                {isLoadingRoles ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-[#D4AF77] animate-spin" />
                                    </div>
                                ) : !activeRole ? (
                                    <div className="absolute inset-0 flex items-center justify-center border border-white/5 bg-black/30 backdrop-blur-xl">
                                        <p className="text-sm text-[#A8A29E] font-sans tracking-widest uppercase">No open positions</p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeRole.id}
                                            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                            className="group absolute inset-0"
                                        >
                                            {/* PRECISION CORNERS */}
                                            <div className="absolute -top-1 -left-1 w-6 h-6 md:w-8 md:h-8 border-t border-l border-[#D4AF77]/30 group-hover:border-[#D4AF77] group-hover:w-10 group-hover:h-10 md:group-hover:w-12 md:group-hover:h-12 transition-all duration-700 z-20" />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 border-b border-r border-[#D4AF77]/30 group-hover:border-[#D4AF77] group-hover:w-10 group-hover:h-10 md:group-hover:w-12 md:group-hover:h-12 transition-all duration-700 z-20" />

                                            <div className="h-full w-full relative bg-black/50 backdrop-blur-3xl border border-white/5 p-5 md:p-8 lg:p-12 flex flex-col justify-between items-start text-left overflow-hidden hover:bg-black/30 transition-all duration-700">
                                                {/* BACKGROUND DECOR */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#D4AF77]/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />

                                                {/* TOP: METADATA */}
                                                <div className="relative z-10 flex flex-col items-start gap-2 md:gap-4">
                                                    <div className="w-px h-6 md:h-10 bg-[#D4AF77]/50 group-hover:h-8 md:group-hover:h-12 group-hover:bg-[#D4AF77] transition-all duration-700" />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] md:text-xs font-sans text-[#D4AF77] tracking-[0.3em] md:tracking-[0.4em] uppercase block">
                                                            ID: {activeRole.code}
                                                        </span>
                                                        <span className="text-[8px] md:text-[10px] font-sans text-white/40 tracking-[0.2em] md:tracking-[0.3em] uppercase block">
                                                            {activeRole.segment}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* MIDDLE: CONTENT */}
                                                <div className="relative z-10 space-y-2 md:space-y-5 w-full">
                                                    <motion.h2
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2, duration: 0.8 }}
                                                        className="font-serif text-xl md:text-3xl lg:text-5xl text-white tracking-wide uppercase leading-tight font-light group-hover:tracking-wider transition-all duration-700"
                                                    >
                                                        {activeRole.title}
                                                    </motion.h2>
                                                    <motion.p
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4, duration: 0.8 }}
                                                        className="text-[10px] md:text-sm lg:text-lg font-sans text-[#A8A29E] font-light leading-relaxed max-w-[400px] line-clamp-3 md:line-clamp-none"
                                                    >
                                                        {activeRole.description}
                                                    </motion.p>
                                                </div>

                                                {/* BOTTOM: ACTION */}
                                                <div className="relative z-10 w-full pt-2 md:pt-4">
                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="group/btn relative w-full overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF77]/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                                        <div className="relative px-3 md:px-8 py-3 md:py-5 border border-white/10 bg-white/5 flex items-center justify-between group-hover/btn:border-[#D4AF77]/30 group-hover/btn:bg-[#D4AF77]/5 transition-all duration-500">
                                                            <span className="text-[9px] md:text-xs font-serif tracking-[0.3em] md:tracking-[0.4em] uppercase text-white/80 group-hover/btn:text-white">Apply for position</span>
                                                            <div className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center border border-white/10 rounded-full group-hover/btn:border-[#D4AF77]/40 group-hover/btn:scale-110 transition-all duration-500">
                                                                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white/60 group-hover/btn:text-[#D4AF77]" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* HUD SCANNING ACCENT */}
                                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF77]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out" />
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* PAGER INDICATOR */}
                            <div className="flex gap-2 mt-4 md:mt-12">
                                {roles.map((_: OpenRole, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`w-8 md:w-12 h-[1px] transition-all duration-1000 ${i === currentIndex ? "bg-[#D4AF77] w-12 md:w-20" : "bg-white/10 hover:bg-white/20"}`}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* FLOATING HUD ELEMENTS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#D4AF77]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#8B7355]/5 blur-[120px] rounded-full" />
            </div>

            {/* Modal Integration */}
            {activeRole && (
                <CareerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    positionTitle={activeRole.title}
                    positionDescription={activeRole.description}
                    positionRequirements={activeRole.requirements}
                    contactEmail={activeRole.contactEmail}
                />
            )}

            <Copyright />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 119, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 119, 0.2);
                }
            `}</style>
        </main>
    );
}
