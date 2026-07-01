"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundImage from "@/components/shared/BackgroundImage";
import Copyright from "@/components/shared/Copyright";
import LocationIndicator from "@/components/shared/LocationIndicator";
import SocialIcons from "@/components/shared/SocialIcons";
import SiteHUD from "@/components/shared/SiteHUD";

const PHONE = "+97466063343";
const PHONE_DISPLAY = "+974 6606 3343";
const EMAIL = "support@thelab33recovery.com";
const WA_URL = `https://wa.me/${PHONE.replace("+", "")}`;
const IG_URL = "https://www.instagram.com/thelab33.qa/";

// The LAB 33 — exact Google Maps listing
// Place ID: 0x3e45c3b59e7934a9:0xcab011f7508727e9
// Coords: 25.3722422°N, 51.5462962°E
const MAP_SRC =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d51.5462962!3d25.3722422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45c3b59e7934a9%3A0xcab011f7508727e9!2sThe+LAB+33!5e0!3m2!1sen!2sqa!4v1741400000000!5m2!1sen!2sqa";
const MAPS_URL =
    "https://www.google.com/maps/place/The+LAB+33/@25.3722422,51.5462962,17z/data=!3m1!4b1!4m6!3m5!1s0x3e45c3b59e7934a9:0xcab011f7508727e9!8m2!3d25.3722422!4d51.5462962!16s%2Fg%2F11mzphny1j";

type FormState = "idle" | "sending" | "sent";

export default function ContactClient() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [state, setState] = useState<FormState>("idle");

    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setState("sending");
        try {
            const res = await fetch("/api/send-contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                setState("idle");
            } else {
                setState("sent");
            }
        } catch {
            setError("Network error. Please check your connection.");
            setState("idle");
        }
    };

    return (
        /*
         * Mobile  → single column, scrollable, proper top padding to clear HUD
         * Desktop → side-by-side, locked to 100dvh, no scroll
         */
        <main className="
      w-full bg-[#050505] text-[#F5F5F0] relative
      flex flex-col
      h-[100dvh] overflow-hidden
      lg:flex-row
      selection:bg-[#D4AF77]/30
    ">
            {/* Shared HUD */}
            <BackgroundImage alt="The Lab 33 recovery lab in Porto Arabia, Doha" />
            <SiteHUD />
            <LocationIndicator />
            <SocialIcons />
            <Copyright />

            {/* LEFT PANEL — Mobile: full width, padding clears HUD; Desktop: 50% width, full height, vertically centred */}
            <div className="
        relative z-10 flex flex-col justify-center w-full shrink-0
        px-5 pt-[72px] pb-3
        md:px-14 md:pt-28 md:pb-12
        lg:w-[50%] lg:h-full lg:px-20 lg:pt-0 lg:pb-0
      ">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_70%_50%_at_0%_40%,rgba(212,175,119,0.05)_0%,transparent_100%)]" />

                {/* Gold scan — top edge */}
                <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 left-0 right-0 h-[1px] origin-left hidden lg:block"
                    style={{ background: "linear-gradient(90deg,rgba(212,175,119,.7) 0%,rgba(212,175,119,.25) 60%,transparent 100%)" }}
                />

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-3 lg:mb-6"
                >
                    <p className="text-[8px] font-sans tracking-[0.55em] uppercase text-[#D4AF77]/80 mb-3">
                        The Lab 33 · Porto Arabia · Q2 2026
                    </p>

                    {/* clamp keeps it proportional on every screen size */}
                    <h1 className="font-serif font-light tracking-tight uppercase leading-[0.88] mb-3"
                        style={{ fontSize: "clamp(1.75rem, 5vw, 4.5rem)" }}>
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                            Get in
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#D4AF77] to-[#8B7355]/60">
                            Touch
                        </span>
                    </h1>

                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="h-[1px] w-7 bg-[#D4AF77] origin-left"
                        />
                        <span className="text-[8px] font-sans tracking-[0.38em] uppercase text-[#8B7355]">
                            Recovery Lab · Doha, Qatar
                        </span>
                    </div>
                </motion.div>

                {/* Contact tiles */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.8 }}
                    className="grid grid-cols-2 gap-2 mb-3"
                >
                    {[
                        { label: "Phone", val: PHONE_DISPLAY, href: `tel:${PHONE}`, green: false },
                        { label: "WhatsApp", val: PHONE_DISPLAY, href: WA_URL, ext: true, green: true },
                        { label: "Email", val: EMAIL, href: `mailto:${EMAIL}`, green: false },
                        { label: "Instagram", val: "@thelab33.qa", href: IG_URL, ext: true, green: false },
                    ].map((t, i) => (
                        <motion.a
                            key={t.label}
                            href={t.href}
                            target={t.ext ? "_blank" : undefined}
                            rel={t.ext ? "noopener noreferrer" : undefined}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 + i * 0.06, duration: 0.55 }}
                            className="group no-underline relative flex flex-col gap-1 px-3 py-3 border border-white/[0.05]
                         bg-white/[0.02] hover:border-[#D4AF77]/25 hover:bg-[#D4AF77]/[0.04]
                         transition-all duration-500 overflow-hidden"
                        >
                            {/* sweep */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                              bg-gradient-to-r from-transparent via-white/[0.02] to-transparent
                              transition-transform duration-[1100ms] pointer-events-none" />
                            <span className={`text-[7px] tracking-[0.42em] uppercase font-sans font-light
                ${t.green ? "text-[#25D366]/70" : "text-[#8B7355]"}`}>
                                {t.label}
                            </span>
                            <span className={`font-serif font-light text-[11px] truncate transition-colors duration-300
                ${t.green
                                    ? "text-[#25D366]/75 group-hover:text-[#25D366]"
                                    : "text-white/50 group-hover:text-[#D4AF77]"}`}>
                                {t.val}
                            </span>
                        </motion.a>
                    ))}
                </motion.div>

                {/* Form divider */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="flex items-center gap-3 mb-2"
                >
                    <span className="w-1 h-1 rounded-full bg-[#D4AF77] animate-pulse shrink-0" />
                    <span className="text-[8px] font-sans tracking-[0.42em] uppercase text-white/35">Send a Message</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF77]/20 to-transparent" />
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                >
                    <AnimatePresence mode="wait">
                        {state === "sent" ? (
                            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-4 px-5 py-5 border border-[#D4AF77]/20 bg-[#D4AF77]/[0.03]">
                                <div className="w-8 h-8 border border-[#D4AF77]/35 flex items-center justify-center shrink-0">
                                    <svg viewBox="0 0 20 20" fill="none" width="14" height="14" className="text-[#D4AF77]">
                                        <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-serif font-light text-sm text-white/80">Message received.</p>
                                    <p className="text-[11px] text-[#8B7355] mt-0.5 font-sans">We&apos;ll reply within 24 hours.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={submit} noValidate className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" required placeholder="Your name"
                                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className={iCls} />
                                    <input type="email" required placeholder="Email"
                                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className={iCls} />
                                </div>
                                <textarea required rows={3} placeholder="How can we help?"
                                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    className={iCls + " resize-none"} />

                                <div className="flex gap-2">
                                    {/* Send button */}
                                    <button type="submit" disabled={state === "sending"}
                                        className="group/s flex-1 relative overflow-hidden disabled:opacity-40">
                                        <div className="absolute inset-0 -translate-x-full group-hover/s:translate-x-full
                                    bg-gradient-to-r from-transparent via-[#D4AF77]/8 to-transparent
                                    transition-transform duration-1000 pointer-events-none" />
                                        <div className="relative flex items-center justify-between px-4 py-3
                                    border border-white/10 bg-white/[0.025]
                                    hover:border-[#D4AF77]/25 transition-all duration-400">
                                            {state === "sending" ? (
                                                <span className="flex items-center gap-2 mx-auto">
                                                    <svg className="animate-spin" viewBox="0 0 20 20" fill="none" width="13" height="13">
                                                        <circle cx="10" cy="10" r="7" stroke="#D4AF77" strokeWidth="1.5" strokeOpacity="0.3" />
                                                        <path d="M10 3a7 7 0 0 1 7 7" stroke="#D4AF77" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="text-[10px] font-serif tracking-[0.28em] uppercase text-white/40">Sending</span>
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-[10px] font-serif tracking-[0.32em] uppercase text-white/60 group-hover/s:text-white transition-colors">
                                                        Send
                                                    </span>
                                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11"
                                                        className="text-[#D4AF77]/40 group-hover/s:text-[#D4AF77] transition-colors">
                                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* WhatsApp */}
                                    <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                                        className="no-underline flex items-center gap-1.5 px-4 py-3
                               border border-[#25D366]/20 hover:border-[#25D366]/50
                               hover:bg-[#25D366]/[0.06] transition-all duration-400">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" className="text-[#25D366]">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.857L.057 23.116a.75.75 0 0 0 .92.92l5.26-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.03 1.03-3.676-.212-.355A9.713 9.713 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                                        </svg>
                                        <span className="text-[9px] font-sans text-[#25D366] tracking-wider hidden sm:inline">WA</span>
                                    </a>

                                    {/* Call */}
                                    <a href={`tel:${PHONE}`}
                                        className="no-underline flex items-center justify-center px-4 py-3
                               border border-white/[0.07] hover:border-[#D4AF77]/30
                               hover:bg-[#D4AF77]/[0.04] transition-all duration-400">
                                        <svg viewBox="0 0 24 24" fill="none" width="13" height="13" className="text-[#D4AF77]/50">
                                            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                        </svg>
                                    </a>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <p className="mt-2 text-[11px] font-sans text-red-400/80 tracking-wide">
                                        {error}
                                    </p>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Mobile-only bottom breathing room above map */}
                <div className="h-2 lg:hidden" />
            </div>

            {/* RIGHT PANEL — Map. Mobile: full-width strip; Desktop: centered smaller rectangle */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 1.2 }}
                className="
          relative w-full flex-1 min-h-0
          pb-10 lg:pb-0
          lg:w-[50%] lg:flex lg:items-center lg:justify-center
        "
            >
                {/* Desktop: contained map box */}
                <div className="w-full h-full lg:w-[520px] lg:h-[340px] relative flex flex-col min-h-0">

                    {/* Map */}
                    <div className="relative flex-1 overflow-hidden">
                        {/* Top fade */}
                        <div className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-none
                                bg-gradient-to-b from-[#050505]/90 to-transparent" />
                        {/* Bottom fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 z-10 pointer-events-none
                                bg-gradient-to-t from-[#050505]/90 to-transparent" />
                        {/* Inner shadow */}
                        <div className="absolute inset-0 z-[5] pointer-events-none
                                shadow-[inset_0_0_40px_rgba(5,5,5,0.5)]" />

                        <iframe
                            title="The LAB 33 — Porto Arabia, The Pearl, Doha"
                            src={MAP_SRC}
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            style={{ filter: "invert(92%) hue-rotate(180deg) saturate(0.25) brightness(0.72) contrast(1.1)" }}
                        />
                    </div>

                    {/* Location bar */}
                    <div className="
                        relative z-10 shrink-0
                        flex items-center justify-between gap-3
                        px-4 py-2.5
                        bg-[#050505]/95 border border-t-0 border-[#D4AF77]/10
                    ">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF77] animate-pulse shrink-0" />
                            <span className="font-serif font-light text-white/55 text-[10px]">
                                Porto Arabia, The Pearl · Doha
                            </span>
                        </div>
                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                no-underline shrink-0 flex items-center gap-1.5
                                px-2.5 py-1
                                border border-[#D4AF77]/20 hover:border-[#D4AF77]/50
                                hover:bg-[#D4AF77]/[0.06] transition-all duration-300
                            "
                        >
                            <svg viewBox="0 0 16 16" fill="none" width="9" height="9" className="text-[#D4AF77]/60">
                                <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.485-2.015-4.5-4.5-4.5zM8 7.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5z" fill="currentColor" />
                            </svg>
                            <span className="text-[7px] font-sans tracking-[0.28em] uppercase text-[#D4AF77]/60 hover:text-[#D4AF77] transition-colors">
                                Visit in Maps
                            </span>
                        </a>
                    </div>
                </div>
            </motion.div>

        </main>
    );
}

const iCls =
    "w-full px-3.5 py-3 border border-white/[0.07] bg-black/30 " +
    "text-white/75 placeholder:text-white/20 font-serif font-light text-sm " +
    "focus:outline-none focus:border-[#D4AF77]/30 focus:bg-[#D4AF77]/[0.025] transition-all duration-300";
