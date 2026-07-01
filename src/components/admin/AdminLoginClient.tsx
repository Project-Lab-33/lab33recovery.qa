"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import BackgroundImage from "@/components/shared/BackgroundImage";
import MinimalTime from "@/components/shared/MinimalTime";
import LocationIndicator from "@/components/shared/LocationIndicator";
import Copyright from "@/components/shared/Copyright";
import SocialIcons from "@/components/shared/SocialIcons";
import HUDNavLink from "@/components/shared/HUDNavLink";
import { Lock, User, ArrowRight, Eye, EyeOff, Home, RefreshCw, AlertCircle, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Mount: load remembered email + set up session-only guard
    useEffect(() => {
        setMounted(true);
        document.body.classList.add("admin-layout");

        // Load remembered email
        const savedEmail = localStorage.getItem('lab33_remember_email');
        const savedRemember = localStorage.getItem('lab33_remember_session');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }

        // If user previously logged in WITHOUT "Remember Me", sign them out
        // on fresh page load (browser was closed & reopened).
        // We detect this by checking: session exists BUT no remember flag
        // AND no session-tab marker (sessionStorage survives tab refreshes but not browser close).
        const sessionTabMarker = sessionStorage.getItem('lab33_session_active');
        if (!savedRemember && !sessionTabMarker) {
            // Browser was closed — clear any stale session
            supabase.auth.signOut({ scope: 'local' }).catch(() => { });
        }

        return () => document.body.classList.remove("admin-layout");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keyboard detection for mobile layout
    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const viewport = window.visualViewport;
        const initialHeight = window.innerHeight;

        const handleResize = () => {
            const heightDiff = initialHeight - viewport.height;
            setIsKeyboardOpen(heightDiff > 150);
        };

        viewport.addEventListener('resize', handleResize);
        return () => viewport.removeEventListener('resize', handleResize);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (rememberMe) {
                // Save email for pre-fill + flag to persist session across browser restarts
                localStorage.setItem('lab33_remember_email', email);
                localStorage.setItem('lab33_remember_session', 'true');
            } else {
                // Session-tab marker so refreshes within the same tab don't sign out
                localStorage.removeItem('lab33_remember_email');
                localStorage.removeItem('lab33_remember_session');
                sessionStorage.setItem('lab33_session_active', 'true');
            }

            // Log the login event (fire-and-forget)
            fetch('/api/admin/auth-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login' }),
            }).catch(() => { });

            router.push("/admin/dashboard");
            router.refresh();
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isLight = mounted && (theme === 'light' || resolvedTheme === 'light');

    return (
        <>
            {/* Mobile Gate */}
            <div className="fixed inset-0 z-[9999] flex md:hidden">
                {/* Same cinematic background */}
                <BackgroundImage src="/images/background/admin-login-bg.webp" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-8">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Image
                            src={isLight ? "/logo-black.png" : "/logo-primary.webp"}
                            alt="The Lab 33"
                            width={240}
                            height={75}
                            className={`w-[200px] h-auto ${isLight ? 'drop-shadow-[0_0_20px_rgba(0,0,0,0.1)]' : 'drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]'}`}
                            priority
                        />
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF77]/40 to-transparent mt-10 mb-10"
                    />

                    {/* Icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative mb-8"
                    >
                        <div className="absolute inset-0 bg-[#D4AF77]/20 rounded-2xl blur-xl" />
                        <div className="relative w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                            <Monitor size={28} strokeWidth={1.2} className="text-[#D4AF77]" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-xl font-serif text-[#F5F5F0] text-center leading-tight"
                    >
                        Desktop Experience
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="text-[13px] text-white/50 text-center mt-3 max-w-[280px] leading-relaxed"
                    >
                        The admin panel is optimized for desktop displays. Please switch to a larger screen for the best experience.
                    </motion.p>

                    {/* CTA hint */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="mt-10"
                    >
                        <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.04] border border-[#D4AF77]/15">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF77]/80">
                                Open on desktop
                            </span>
                            <ArrowRight size={13} className="text-[#D4AF77]/60" />
                        </div>
                    </motion.div>

                    {/* Breathing pulse */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ opacity: [0.15, 0.4, 0.15] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-12 h-[1px] bg-[#D4AF77]"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Desktop Login */}
            <main className="relative h-[100dvh] w-full hidden md:flex flex-col items-center justify-center">
                {/* 1. Cinematic Background */}
                <BackgroundImage src="/images/background/admin-login-bg.webp" />

                {/* 2. HUD Elements (Persistent) */}
                <div className={`transition-opacity duration-300 ${isKeyboardOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <MinimalTime />
                    <LocationIndicator />
                    <SocialIcons />
                    <HUDNavLink icon={Home} href="/" />
                </div>

                <div className={`transition-opacity duration-300 ${isKeyboardOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <Copyright />
                </div>

                {/* 3. Login Interface */}
                <div className={`relative z-20 w-full max-w-md md:max-w-xl px-8 py-12 md:px-12 h-full flex flex-col items-center transition-colors duration-500 ${isKeyboardOpen ? 'justify-start pt-12 overflow-y-auto' : 'justify-center'}`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Brand Header */}
                        <div className="mb-12 flex flex-col items-center gap-1">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Image
                                    src={isLight ? "/logo-black.png" : "/logo-primary.webp"}
                                    alt="The Lab 33 Logo"
                                    width={800}
                                    height={250}
                                    className={`w-[280px] md:w-[580px] h-auto ${isLight ? 'drop-shadow-[0_0_20px_rgba(0,0,0,0.1)]' : 'drop-shadow-[0_0_50px_rgba(255,255,255,0.25)]'}`}
                                    priority
                                />
                            </motion.div>
                            <span className="text-[10px] md:text-[11px] font-sans tracking-[0.4em] text-[#D4AF77] font-semibold uppercase">
                                Administrator Access
                            </span>
                        </div>

                        {/* Glassmorphic Form Container */}
                        <form onSubmit={handleLogin} className="w-full space-y-6 relative group pb-10">
                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-sans tracking-wide mb-4"
                                    >
                                        <AlertCircle size={14} />
                                        <span>{error.toUpperCase()}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                {/* Email / Username */}
                                <div className="relative group/field">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#D4AF77] transition-colors duration-500">
                                        <User size={16} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-14 pr-6 text-white text-[11px] font-sans tracking-[0.1em] focus:outline-none focus:border-[#D4AF77]/40 focus:bg-white/[0.05] transition-colors duration-500 placeholder:text-white/20"
                                        required
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative group/field">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#D4AF77] transition-colors duration-500">
                                        <Lock size={16} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-14 pr-12 text-white text-[11px] font-sans tracking-[0.1em] focus:outline-none focus:border-[#D4AF77]/40 focus:bg-white/[0.05] transition-colors duration-500 placeholder:text-white/20"
                                        required
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#D4AF77] focus:text-[#D4AF77] transition-colors duration-500 p-1"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} strokeWidth={1.5} />
                                        ) : (
                                            <Eye size={16} strokeWidth={1.5} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <label className="flex items-center gap-3 cursor-pointer group/remember py-1 -mt-1 select-none">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-[18px] h-[18px] rounded border border-white/15 bg-white/[0.03] peer-checked:border-[#D4AF77]/50 peer-checked:bg-[#D4AF77]/10 transition-all duration-300 flex items-center justify-center peer-focus-visible:ring-1 peer-focus-visible:ring-[#D4AF77]/40">
                                        <svg
                                            className={`w-[10px] h-[10px] text-[#D4AF77] transition-all duration-200 ${rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-[9px] tracking-[0.2em] uppercase text-white/30 group-hover/remember:text-white/50 transition-colors duration-300 font-sans">
                                    Remember Me
                                </span>
                            </label>

                            {/* Login Button */}
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative py-4 rounded-xl flex items-center justify-center gap-3 overflow-hidden group/btn bg-white/[0.03] border border-white/10 transition-colors duration-700 disabled:opacity-50"
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                                <span className="relative z-10 text-[11px] text-[#F5F5F0] tracking-[0.4em] uppercase font-bold group-hover/btn:text-[#D4AF77] transition-colors duration-700">
                                    {isLoading ? "Authenticating..." : "Login Portal"}
                                </span>
                                {isLoading ? (
                                    <RefreshCw size={14} className="animate-spin text-[#D4AF77]" />
                                ) : (
                                    <ArrowRight size={14} className={`relative z-10 transition-colors duration-700 ${isHovered ? 'translate-x-1 text-[#D4AF77]' : 'text-white/20'}`} />
                                )}
                            </motion.button>

                            {/* Auxiliary Actions */}
                            <div className="flex justify-end pt-2">
                                <button type="button" className="text-[9px] text-[#D4AF77]/70 hover:text-[#D4AF77] tracking-[0.2em] uppercase transition-colors duration-500">
                                    Forgot Password?
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>
        </>
    );
}
