"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackgroundImage from "@/components/shared/BackgroundImage";
import LocationIndicator from "@/components/shared/LocationIndicator";
import Copyright from "@/components/shared/Copyright";
import SocialIcons from "@/components/shared/SocialIcons";
import SiteHUD from "@/components/shared/SiteHUD";

export default function NotFound() {
    return (
        <main className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
            <title>404 | NOT FOUND - The Lab 33</title>

            {/* Cinematic Background */}
            <BackgroundImage />

            {/* HUD Elements */}
            <SiteHUD showTimeMobile />
            <LocationIndicator />
            <SocialIcons />
            <Copyright />

            {/* Vertical Scanning Beam */}
            <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF77]/30 to-transparent z-10 pointer-events-none"
            />

            {/* Central Interface */}
            <div className="relative z-20 flex flex-col items-center">

                {/* Large Distorted 404 */}
                <div className="relative mb-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.8, 1] }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 5 }}
                        className="text-[120px] md:text-[220px] font-serif font-black text-white/5 absolute inset-0 blur-sm select-none"
                    >
                        404
                    </motion.div>
                    <h1 className="text-[120px] md:text-[220px] font-serif font-black text-white tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(212,175,119,0.2)]">
                        404
                    </h1>
                </div>

                {/* Status HUD */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF77] to-transparent" />
                        <span className="text-[10px] md:text-[12px] font-sans tracking-[0.8em] text-[#D4AF77] uppercase font-bold">
                            PAGE NOT FOUND
                        </span>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF77] to-transparent" />
                    </div>

                    <p className="max-w-xs text-[10px] md:text-[11px] font-sans text-white/40 tracking-[0.2em] leading-loose uppercase">
                        The page you are looking for doesn&apos;t exist or has been moved.
                    </p>

                    <Link
                        href="/"
                        className="mt-8 group relative flex items-center gap-4 px-10 py-4 bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-3xl hover:border-[#D4AF77]/50 transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <ArrowLeft size={14} className="text-[#D4AF77] group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-sans tracking-[0.4em] text-white uppercase">Go Back Home</span>
                    </Link>
                </div>
            </div>

            {/* Digital Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </main>
    );
}
