"use client";

import Image from "next/image";

interface BackgroundImageProps {
    src?: string;
    alt?: string;
}

export default function BackgroundImage({ src = "/cinematic-lab-interior.webp", alt = "The Lab 33 recovery facility interior" }: BackgroundImageProps) {
    return (
        <div
            className="fixed inset-0 z-0 overflow-hidden bg-black animate-[fadeIn_0.8s_ease-out_forwards]"
            style={{ opacity: 0 }}
        >
            <div className="absolute inset-0 scale-105">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover blur-[8px] scale-105"
                    quality={75}
                    sizes="100vw"
                    priority
                />
            </div>

            {/* Overlay - Darken significantly */}
            <div className="absolute inset-0 bg-[#0F0E0D]/85 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />

            {/* Cinematic Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* God Rays / Ambient Light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_60%)] z-10 pointer-events-none" />

        </div>
    );
}

