"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeaderLogoProps {
    pathLabel?: string;
    contained?: boolean;
}

export default function HeaderLogo({ contained = false }: HeaderLogoProps) {
    const posClass = contained
        ? "flex items-center"
        : "fixed top-6 md:top-8 z-[70] pointer-events-auto flex items-center gap-2 h-8 md:h-auto left-1/2 -translate-x-1/2";
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className={posClass}
        >
            <Link href="/" aria-label="The Lab 33 — Go to homepage" className="group block">
                <div className="relative">
                    <Image
                        src="/logo-primary.webp"
                        alt="The Lab 33 Logo"
                        width={160}
                        height={40}
                        className="w-24 md:w-32 h-auto brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_25px_rgba(212,175,119,0.2)] transition-all duration-700"
                        priority
                    />
                    {/* Subtle glow effect */}
                    <div className="absolute -inset-2 bg-[#D4AF77]/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>
            </Link>

        </motion.div>
    );
}
