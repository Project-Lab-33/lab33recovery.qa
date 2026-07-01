"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { LucideIcon } from "lucide-react";

interface HUDNavLinkProps {
    label?: string;
    href: string;
    icon?: LucideIcon;
    delay?: number;
}

/**
 * HUD NAV LINK
 * Reusable minimalist link for top corners
 */
export default function HUDNavLink({ label, href, icon: Icon, delay = 1.5 }: HUDNavLinkProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay }}
            className="fixed top-6 right-6 md:top-8 md:right-8 z-50 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                href={href}
                aria-label={label ? `Navigate to ${label}` : undefined}
                className="group relative flex items-center gap-5 md:gap-6"
            >
                {/* 1. THE SIGNATURE (Main Label or Icon) */}
                <div className="relative flex items-center justify-center">
                    {Icon ? (
                        <Icon
                            size={18}
                            strokeWidth={1.2}
                            className="text-[#F5F5F0] transition-colors duration-700 group-hover:text-[#D4AF77]"
                        />
                    ) : (
                        <span className="font-serif text-[13px] md:text-[15px] text-[#F5F5F0] tracking-[0.2em] uppercase font-light transition-all duration-700 group-hover:tracking-[0.25em] group-hover:text-[#D4AF77]">
                            {label}
                        </span>
                    )}

                    {/* Minimal Underline (Precision Stroke) */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isHovered ? 1 : 0 }}
                        className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF77]/40 to-transparent origin-center"
                    />
                </div>

                {/* 2. THE PRECISION ANCHOR (Fading Vertical Line) */}
                <div className="relative h-8 md:h-10 w-[1px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                    <motion.div
                        animate={{
                            y: isHovered ? ["-100%", "100%"] : "0%"
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF77]/80 to-transparent"
                    />
                </div>
            </Link>

            {/* Subtle Reflection Overlay */}
            <div className="absolute -inset-4 bg-[#D4AF77]/0 group-hover:bg-[#D4AF77]/2 transition-colors duration-1000 blur-2xl pointer-events-none" />
        </motion.div>
    );
}
