"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Command } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { CommandPalette } from "./shared/CommandPalette";


export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { theme, resolvedTheme } = useTheme();

    // Add admin-layout class to body so CSS restores the native cursor
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        document.body.classList.add("admin-layout");
        return () => document.body.classList.remove("admin-layout");
    }, []);

    const isLight = mounted && (theme === 'light' || resolvedTheme === 'light');

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    return (
        <div className="h-screen w-full bg-[var(--background)] overflow-hidden text-[var(--foreground)] font-sans flex flex-col md:flex-row relative">

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-[var(--border-medium)] bg-[var(--surface-mid)] z-[70]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)] transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Image
                        src={isLight ? "/logo-black.png" : "/logo-primary.webp"}
                        alt="The Lab 33"
                        width={120}
                        height={32}
                        className="h-5 w-auto contrast-[1.1]"
                    />
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-high)] transition-colors"
                    >
                        <Command size={18} />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop is statically flex, Mobile is off-canvas absolute) */}
            <div className={`fixed mt-16 md:mt-0 md:relative h-[calc(100vh-4rem)] md:h-screen z-[65] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full w-[280px]">
                    <AdminSidebar />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-[var(--background)] z-10">
                {/* 0. Grain Texture Overlay */}
                <div className="grain-overlay mix-blend-overlay opacity-30 pointer-events-none z-0" />

                {/* 1. Ambient Background (Subtle Depth) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--surface-high)_0%,var(--background)_100%)] pointer-events-none opacity-50" />

                {/* 2. Gold Spotlight (Single, Static) */}
                <div className="absolute -top-[10%] left-[10%] w-[50%] h-[50%] bg-[var(--accent-gold)]/[0.03] blur-[80px] rounded-full pointer-events-none" />

                {/* 3. Top Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--background)] to-transparent pointer-events-none z-10" />

                <div className="flex-1 relative z-20 w-full flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="px-4 pt-6 pb-6 md:px-10 md:pt-8 md:pb-4 flex flex-col"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Global Admin Overlays */}
            <CommandPalette />


        </div>
    );
}

