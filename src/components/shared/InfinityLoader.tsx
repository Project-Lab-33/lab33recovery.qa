"use client";

import { motion } from "framer-motion";

export default function InfinityLoader() {
    return (
        <div className="relative w-[70vmin] h-[70vmin] md:w-[40rem] md:h-[40rem] flex items-center justify-center pointer-events-none select-none">
            {/* Horizontal Fade Mask Only */}
            <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent_0%,black_20%,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_20%,black_80%,transparent_100%)]">
                {/* Single Rotating Ring - Minimal */}
                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient-loader)"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        style={{ originX: "50px", originY: "50px" }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    />
                    <defs>
                        <linearGradient id="gradient-loader" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(212, 175, 119, 0)" />
                            <stop offset="50%" stopColor="rgba(212, 175, 119, 0.4)" />
                            <stop offset="100%" stopColor="rgba(212, 175, 119, 0)" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Simple dark overlay behind logo - NO blur */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[70vmin] h-[15rem] md:w-[40rem] md:h-[15rem] bg-[#0F0E0D]/40 rounded-full [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            </div>
        </div>
    );
}
