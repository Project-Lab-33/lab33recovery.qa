"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Raw mouse position
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smoothed position for the ring (slight lag = feels premium)
    const springX = useSpring(mouseX, { stiffness: 500, damping: 40, mass: 0.3 });
    const springY = useSpring(mouseY, { stiffness: 500, damping: 40, mass: 0.3 });

    // Use a ref so the moveCursor handler always reads the live value,
    // avoiding the stale-closure bug that prevented visibility from restoring.
    const isVisibleRef = useRef(false);

    useEffect(() => {
        if (isAdmin) return;

        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisibleRef.current) {
                isVisibleRef.current = true;
                setIsVisible(true);
            }
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'A' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.closest('button') !== null ||
                target.closest('a') !== null ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(isInteractive);
        };

        const handleMouseLeave = () => {
            isVisibleRef.current = false;
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            isVisibleRef.current = true;
            setIsVisible(true);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        document.documentElement.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    // Don't render on admin pages or touch devices
    if (isAdmin) return null;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

    return (
        <>
            {/* Dot — snaps exactly to pointer */}
            <motion.div
                aria-hidden="true"
                className="fixed top-0 left-0 z-[9999] pointer-events-none"
                style={{ x: mouseX, y: mouseY }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isHovering ? 0 : 1 }}
                transition={{ duration: 0.08 }}
            >
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#D4AF77]" />
            </motion.div>

            {/* Ring — slightly lagged */}
            <motion.div
                aria-hidden="true"
                className="fixed top-0 left-0 z-[9998] pointer-events-none"
                style={{ x: springX, y: springY }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.15 }}
            >
                <motion.div
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D4AF77]/50 bg-[#D4AF77]/[0.04]"
                    animate={{
                        width: isHovering ? 44 : 28,
                        height: isHovering ? 44 : 28,
                    }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                />
            </motion.div>
        </>
    );
}
