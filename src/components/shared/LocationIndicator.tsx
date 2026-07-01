"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function LocationIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-3 md:gap-4"
        >
            <a
                href="https://www.google.com/maps/place/The+LAB+33/@25.3722422,51.5462962,17z/data=!3m1!4b1!4m6!3m5!1s0x3e45c3b59e7934a9:0xcab011f7508727e9!8m2!3d25.3722422!4d51.5462962!16s%2Fg%2F11mzphny1j"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View The Lab 33 location at The Pearl, Porto Arabia on Google Maps"
                className="flex items-center gap-3 md:gap-4 group cursor-pointer"
            >
                {/* Icon */}
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#8B7355] group-hover:text-[#D4AF77] transition-colors duration-300" />

                {/* Vertical Decor Line - Shorter for Mobile */}
                <div className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-[#8B7355]/0 via-[#8B7355]/40 to-[#8B7355]/0" />

                <div className="flex flex-col items-start text-left">
                    {/* Top Row: Main Location */}
                    <div className="flex flex-col">
                        <span className="text-lg md:text-2xl font-serif font-light text-[#F5F5F0] tracking-wide drop-shadow-2xl leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#D4AF77] group-hover:via-[#F3E5D0] group-hover:to-[#D4AF77] transition-all duration-300 bg-[length:200%_auto] animate-gradient">
                            The Pearl
                        </span>
                        <span className="text-[10px] md:text-base font-serif font-light text-[#A8A29E] tracking-wide group-hover:text-[#D4AF77] transition-colors duration-300">
                            Porto Arabia
                        </span>
                    </div>
                </div>
            </a>
        </motion.div>
    );
}
