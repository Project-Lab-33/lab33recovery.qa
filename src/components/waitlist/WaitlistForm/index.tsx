"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, ArrowRight, ArrowLeft, Check
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { COUNTRIES, Country } from "@/lib/countries";
import { createClient } from "@/lib/supabase/client";
import Copyright from "@/components/shared/Copyright";
import MinimalTime from "@/components/shared/MinimalTime";
import LocationIndicator from "@/components/shared/LocationIndicator";
import SocialIcons from "@/components/shared/SocialIcons";
import HeaderLogo from "@/components/shared/HeaderLogo";
import ReturnButton from "@/components/shared/ReturnButton";
import { useRouter } from "next/navigation";

// Modular Fields
import InputField from "@/components/forms/InputField";
import GenderSelect from "@/components/forms/GenderSelect";
import DateSelect from "@/components/forms/DateSelect";
import PhoneInput from "@/components/forms/PhoneInput";
import CountrySelect from "@/components/forms/CountrySelect";

interface WaitlistFormProps {
    mode?: 'modal' | 'page';
    onClose?: () => void;
}

const STEPS = [
    { id: "personal", label: "PERSONAL", prompt: "Tell us about yourself", placeholder: "" },
    { id: "contact", label: "CONTACT", prompt: "How can we reach you?", placeholder: "" },
    { id: "details", label: "DETAILS", prompt: "A few more details", placeholder: "" }
];

export default function WaitlistForm({ mode = 'page', onClose }: WaitlistFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthdate: "",
        nationality: "",
        gender: ""
    });

    const [birthdateData, setBirthdateData] = useState({ day: "", month: "", year: "" });
    const [nationalitySearch, setNationalitySearch] = useState("");
    const [attemptedContinue, setAttemptedContinue] = useState(false);

    // Phone country code state
    const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES.find((c: Country) => c.code === "+974") || COUNTRIES[0]);
    const [phoneCountrySearch, setPhoneCountrySearch] = useState<string>("");

    // Duplicate check state
    const [duplicateError, setDuplicateError] = useState<string | null>(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    // Keyboard detection for mobile - hide buttons when keyboard is open
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const viewport = window.visualViewport;
        const initialHeight = viewport.height;

        const handleResize = () => {
            const isReduced = viewport.height < initialHeight * 0.85;
            setIsKeyboardOpen(isReduced);
        };

        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setIsKeyboardOpen(true);
            }
        };

        const handleBlur = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    if (document.activeElement?.tagName !== 'INPUT' &&
                        document.activeElement?.tagName !== 'TEXTAREA') {
                        setIsKeyboardOpen(false);
                    }
                }, 50);
            }
        };

        viewport.addEventListener('resize', handleResize);
        window.addEventListener('focusin', handleFocus as EventListener);
        window.addEventListener('focusout', handleBlur as EventListener);

        return () => {
            viewport.removeEventListener('resize', handleResize);
            window.removeEventListener('focusin', handleFocus as EventListener);
            window.removeEventListener('focusout', handleBlur as EventListener);
        };
    }, []);

    const activeStep = STEPS[currentStep];

    const nationalitySuggestion = useMemo(() => {
        if (!nationalitySearch || formData.nationality) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(nationalitySearch.toLowerCase())
        ) ?? null;
    }, [nationalitySearch, formData.nationality]);

    const supabase = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return createClient();
    }, []);

    // Fetch live waitlist count for social proof
    useEffect(() => {
        if (!supabase) return;
        supabase.from("waitlist").select("id", { count: "exact", head: true }).then(({ count }) => {
            if (count !== null) setWaitlistCount(count);
        });
    }, [supabase]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getFieldError = (showEmptyError = false) => {
        if (activeStep.id === "personal") {
            if (showEmptyError) {
                if (!formData.gender) return "Please select your gender";
                if (!formData.firstName) return "First name is required";
                if (!formData.lastName) return "Last name is required";
            }
        }

        if (activeStep.id === "contact") {
            if (!formData.email && showEmptyError) return "Email is required";
            if (formData.email && !validateEmail(formData.email)) return "Please enter a valid email";
            if (!formData.phone && showEmptyError) return "Phone number is required";
            if (duplicateError) return duplicateError;
        }

        if (activeStep.id === "details") {
            if (showEmptyError && (!birthdateData.day || !birthdateData.month || !birthdateData.year)) {
                return "Complete date of birth is required";
            }
            if (!formData.nationality && showEmptyError) return "Nationality is required";
        }

        return null;
    };

    const checkDuplicate = async (field: 'email' | 'phone', value: string): Promise<boolean> => {
        if (!supabase || !value) return false;

        setIsCheckingDuplicate(true);
        try {
            const { data } = await supabase
                .from("waitlist")
                .select("id")
                .eq(field, value)
                .maybeSingle();

            if (data) {
                setDuplicateError(`This ${field} is already registered`);
                return true;
            }
            setDuplicateError(null);
            return false;
        } catch {
            return false;
        } finally {
            setIsCheckingDuplicate(false);
        }
    };

    const handleNext = async () => {
        setAttemptedContinue(true);

        const error = getFieldError(true);
        if (error) return;

        if (activeStep.id === "contact") {
            const isDuplicateEmail = await checkDuplicate("email", formData.email);
            if (isDuplicateEmail) return;
            const fullPhone = `${phoneCountry.code}${formData.phone}`;
            const isDuplicatePhone = await checkDuplicate("phone", fullPhone);
            if (isDuplicatePhone) return;
        }

        if (currentStep < STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            setAttemptedContinue(false);
            setDuplicateError(null);
        } else {
            handleSubmit();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, formData, birthdateData]);

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setAttemptedContinue(false);
            setDuplicateError(null);
        }
    };

    const handleSubmit = async () => {
        if (!supabase) return;

        setIsSubmitting(true);

        try {
            let fullPhone = `${phoneCountry.code} ${formData.phone}`;
            if (phoneCountry.code === "+974" && formData.phone.length === 8) {
                fullPhone = `${phoneCountry.code} ${formData.phone.slice(0, 4)} ${formData.phone.slice(4)}`;
            }

            const { error } = await supabase.from("waitlist").insert({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: fullPhone,
                phone_iso: phoneCountry.iso,
                birthdate: formData.birthdate || null,
                nationality: formData.nationality,
                gender: formData.gender,
            });

            if (error) {
                if (error.code === "23505") {
                    setDuplicateError("You are already on the waitlist.");
                    return;
                }
                throw error;
            }

            // Send notifications - awaited to ensure they actually fire
            await Promise.allSettled([
                fetch('/api/send-welcome', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        firstName: formData.firstName
                    }),
                    signal: AbortSignal.timeout(8000),
                })
                    .then(r => r.json())
                    .catch(err => console.error('[Waitlist] Email error:', err)),
            ]);

            setIsSuccess(true);
            if (waitlistCount !== null) setWaitlistCount(waitlistCount + 1);

            if (mode === 'modal' && onClose) {
                setTimeout(() => onClose(), 4000);
            }

        } catch (err: unknown) {
            const e = err as { message?: string; code?: string; details?: string };
            console.error("Submission error:", e?.message || e?.code || JSON.stringify(err));
            setDuplicateError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFormattedBirthdateDisplay = () => {
        const { day, month, year } = birthdateData;
        if (!day || !month || !year) return null;

        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        if (!d || d < 1 || d > 31 || !m || m < 1 || m > 12 || !y || y < 1900 || y > new Date().getFullYear()) return null;

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const getSuffix = (n: number) => {
            if (n > 3 && n < 21) return 'th';
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${months[m - 1]}, ${d}${getSuffix(d)} ${y}`;
    };

    const fieldError = getFieldError(attemptedContinue);
    const formattedBirthdate = getFormattedBirthdateDisplay();
    const isNextDisabled = isSubmitting || isCheckingDuplicate || !!fieldError;

    const handleCloseAction = () => {
        if (mode === 'modal' && onClose) {
            onClose();
        } else {
            router.push('/');
        }
    };

    return (
        <div className={`relative ${mode === 'page' ? 'min-h-[100dvh]' : 'h-full'} w-full overflow-hidden flex flex-col`}>
            {/* SEO: Hidden h1 and content for crawlers — waitlist page had no h1 tag at all */}
            {mode === 'page' && (
                <div className="sr-only" role="region" aria-label="Join The Lab 33 Waitlist">
                    <h1>Join The Lab 33 Waitlist — Exclusive Early Access to Doha&apos;s Premier Recovery Lab</h1>
                    <p>
                        Be the first to experience Qatar&apos;s most advanced biohacking and recovery facility. The Lab 33 is located
                        in Porto Arabia, The Pearl-Qatar, Doha — offering Cold Plunge, Red Light Sauna,
                        Normatec Therapy, Hyperbaric Oxygen Therapy (HBOT), and Guided Stretch (Massage, Cupping & Kinesiology Taping).
                    </p>
                    <p>
                        By joining our waitlist, you secure priority access and exclusive pre-launch benefits. The Lab 33 is designed
                        for executives, athletes, and high-performers seeking measurable performance improvements and longevity
                        through medical-grade recovery technology.
                    </p>
                </div>
            )}
            {/* THE OBSIDIAN BACKDROP */}
            {mode === 'page' && (
                <div className="absolute inset-0 bg-[#050505] z-0">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10">
                        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fff_1px,#fff_2px)] bg-[length:100%_2px]" />
                    </div>
                    {/* Atmospheric Glow */}
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#D4AF77]/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#8B7355]/5 blur-[120px] rounded-full" />
                </div>
            )}

            <motion.div
                initial={mode === 'page' ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(40px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 w-full h-full flex-1 flex flex-col"
            >
                {/* HEADER HUD */}
                <div className={`fixed top-0 left-0 right-0 h-24 px-10 hidden md:flex items-center justify-end z-[150] pointer-events-none`}>
                    <div className="pointer-events-auto">
                        {mode === 'page' ? (
                            <ReturnButton />
                        ) : (
                            <button
                                onClick={handleCloseAction}
                                className="group flex items-center justify-center transition-all duration-500 hover:rotate-90"
                            >
                                <div className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-full bg-black/20 backdrop-blur-xl group-hover:bg-[#D4AF77]/10 group-hover:border-[#D4AF77]/30 transition-all duration-500">
                                    <X className="w-5 h-5 text-white/40 group-hover:text-[#D4AF77] transition-colors" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* LOGO */}
                <div className="hidden md:block">
                    <HeaderLogo pathLabel="/waitlist" />
                </div>

                {/* STEP INDICATOR HUD (Unified Mother Unit) */}
                <div className={`fixed top-24 md:top-28 left-0 right-0 flex flex-col items-center justify-center z-[60] pointer-events-none px-6 transition-all duration-400 ease-out ${isKeyboardOpen ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center p-1.5 md:p-2 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] pointer-events-auto"
                    >
                        {/* Mother Header: Portal ID */}
                        <div className="w-full flex items-center justify-center px-4 py-2 border-b border-white/5 mb-3 md:mb-4">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-1.5 h-1.5 rounded-full bg-[#D4AF77] shadow-[0_0_10px_#D4AF77]"
                                />
                                <span className="text-[9px] md:text-[11px] font-sans tracking-[0.4em] text-white/50 font-bold uppercase">
                                    Waitlist Portal
                                </span>
                            </div>
                        </div>

                        {/* Child Steps */}
                        <div className="flex items-center gap-4 md:gap-14 px-4 pb-2 relative">
                            {STEPS.map((step, idx) => (
                                <div key={step.id} className="relative flex items-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className={`text-[9px] md:text-[11px] font-sans tracking-[0.2em] md:tracking-[0.3em] font-bold transition-all duration-700 ${currentStep === idx ? 'text-white' : 'text-white/20'}`}>
                                            {step.label}
                                        </span>
                                        <div className="relative flex items-center justify-center w-14 md:w-20">
                                            <div className="absolute h-[1px] w-full bg-white/5" />
                                            <motion.div
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{
                                                    scaleX: currentStep >= idx ? 1 : 0,
                                                    opacity: currentStep >= idx ? 1 : 0
                                                }}
                                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                                className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF77]/60 to-transparent origin-center"
                                            />
                                            <div className={`absolute w-1 md:w-1.5 h-1 md:h-1.5 rounded-full transition-all duration-700 ${currentStep === idx ? 'bg-[#D4AF77] scale-110 md:scale-125 shadow-[0_0_15px_rgba(212,175,119,1)]' : currentStep > idx ? 'bg-[#D4AF77]/60' : 'bg-white/10'}`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* MAIN FORM PANEL */}
                <div className={`w-full h-full flex flex-col items-center px-6 transition-all duration-400 ease-out ${mode === 'page' ? 'bg-transparent' : 'bg-black/95 md:bg-gradient-to-b md:from-white/[0.03] md:via-transparent md:to-white/[0.02]'} backdrop-blur-3xl overflow-y-auto overflow-x-hidden ${isKeyboardOpen ? 'justify-start pt-28' : 'justify-center py-16'} md:p-24 md:justify-center`} style={{ height: '100dvh' }}>
                    {!isSuccess ? (
                        <div className="w-full max-w-2xl flex flex-col h-full md:h-auto md:block">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep.id}
                                    initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -40, filter: "blur(20px)" }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex flex-col h-full md:h-auto md:space-y-16"
                                >
                                    <div className="flex-1 flex flex-col justify-center md:flex-initial md:block space-y-4 md:space-y-8">
                                        {/* Social proof + urgency on first step */}
                                        {currentStep === 0 && (
                                            <div className="space-y-3 mb-2">
                                                <p className="text-[10px] md:text-[11px] font-sans tracking-[0.35em] uppercase text-[#D4AF77]/70">
                                                    Opening after Eid &middot; Limited early access
                                                </p>
                                                {waitlistCount !== null && waitlistCount > 0 && (
                                                    <p className="text-[11px] md:text-[12px] font-sans text-white/40 tracking-wide">
                                                        Join {waitlistCount}+ people already on the list
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <h2 className="text-lg md:text-2xl lg:text-3xl font-serif text-white tracking-tight leading-snug">
                                            {activeStep.prompt}
                                        </h2>

                                        {/* Modular Form Fields */}
                                        <WaitlistFields
                                            activeStep={activeStep}
                                            formData={formData}
                                            setFormData={setFormData}
                                            birthdateData={birthdateData}
                                            setBirthdateData={setBirthdateData}
                                            nationalitySearch={nationalitySearch}
                                            setNationalitySearch={setNationalitySearch}
                                            nationalitySuggestion={nationalitySuggestion}
                                            phoneCountry={phoneCountry}
                                            setPhoneCountry={setPhoneCountry}
                                            phoneCountrySearch={phoneCountrySearch}
                                            setPhoneCountrySearch={setPhoneCountrySearch}
                                            duplicateError={duplicateError}
                                            setDuplicateError={setDuplicateError}
                                            dayRef={dayRef}
                                            monthRef={monthRef}
                                            yearRef={yearRef}
                                            formattedBirthdate={formattedBirthdate}
                                            fieldError={fieldError}
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className={`fixed bottom-24 left-0 right-0 px-6 z-50 md:relative md:bottom-auto md:left-auto md:right-auto md:px-0 md:z-auto flex items-center gap-3 md:gap-4 md:pt-20 md:mt-4 transition-all duration-400 ease-out ${isKeyboardOpen ? 'opacity-0 pointer-events-none translate-y-4 md:opacity-100 md:pointer-events-auto md:translate-y-0' : 'opacity-100 translate-y-0'}`}>
                                <motion.button
                                    onClick={handlePrev}
                                    disabled={currentStep === 0}
                                    className={`group relative flex-1 h-12 md:h-14 px-4 md:px-6 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl transition-all duration-500 flex items-center justify-center gap-2 md:gap-3 ${currentStep === 0 ? "opacity-0 pointer-events-none" : "hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-[0.98]"}`}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                    <span className="text-xs md:text-sm font-sans text-white/40 group-hover:text-white tracking-[0.1em] capitalize transition-colors">Back</span>
                                </motion.button>

                                <motion.button
                                    onClick={handleNext}
                                    disabled={isNextDisabled}
                                    className="group relative flex-1 h-12 md:h-14 px-6 md:px-8 rounded-xl bg-gradient-to-r from-[#D4AF77]/15 to-[#D4AF77]/5 border border-[#D4AF77]/30 backdrop-blur-xl transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 overflow-hidden hover:border-[#D4AF77]/50 hover:from-[#D4AF77]/20 hover:to-[#D4AF77]/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative text-xs md:text-sm font-sans text-[#D4AF77] tracking-[0.1em] capitalize font-medium">
                                        {isSubmitting ? "Processing..." : (currentStep === STEPS.length - 1 ? "Join Waitlist" : "Continue")}
                                    </span>
                                    <ArrowRight className="relative w-4 h-4 text-[#D4AF77] group-hover:translate-x-0.5 transition-transform" />
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#D4AF77]/20 to-transparent border border-[#D4AF77]/30 flex items-center justify-center">
                                <Check className="w-10 h-10 text-[#D4AF77]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">You&apos;re In</h2>
                            <p className="text-white/50 font-sans mb-2">
                                You&apos;ll be the first to know when the doors open.
                            </p>
                            <p className="text-[11px] font-sans text-[#D4AF77]/60 tracking-[0.2em] uppercase mb-10">
                                Priority access &middot; Exclusive launch offers &middot; Opening after Eid
                            </p>

                            {/* Share CTA — Reciprocity + Network Effect */}
                            <div className="space-y-4">
                                <p className="text-[12px] font-sans text-white/30 tracking-wide">
                                    Know someone who&apos;d want early access?
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => {
                                            const text = "Qatar's first recovery lab is opening in The Pearl. I just joined the waitlist — Cold Plunge, HBOT, Red Light Sauna, and more. Get early access:";
                                            const url = "https://lab33recovery.qa/waitlist";
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                                        }}
                                        className="group px-5 py-3 border border-[#D4AF77]/30 bg-[#D4AF77]/[0.06] hover:border-[#D4AF77]/50 hover:bg-[#D4AF77]/10 transition-all duration-500 flex items-center gap-2"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#D4AF77]/70 group-hover:text-[#D4AF77] transition-colors">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        <span className="text-[11px] font-sans tracking-[0.15em] uppercase text-[#D4AF77]/80 group-hover:text-[#D4AF77] transition-colors">
                                            Share via WhatsApp
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText("https://lab33recovery.qa/waitlist");
                                        }}
                                        className="group px-5 py-3 border border-white/[0.08] hover:border-white/20 transition-all duration-500 flex items-center gap-2"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors">
                                            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="text-[11px] font-sans tracking-[0.15em] uppercase text-white/30 group-hover:text-white/60 transition-colors">
                                            Copy Link
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Return home */}
                            <button
                                onClick={() => router.push('/')}
                                className="mt-10 text-[10px] font-sans tracking-[0.3em] uppercase text-white/20 hover:text-white/40 transition-colors"
                            >
                                Return to The Lab 33
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* MOBILE HEADER */}
                <div className="fixed top-0 left-0 w-full md:hidden bg-gradient-to-b from-black via-black/90 to-transparent px-5 pt-4 pb-6 z-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF77] animate-pulse" />
                            <span className="text-[10px] font-serif text-white/70 tracking-[0.2em] uppercase">
                                {currentStep + 1} <span className="text-white/30">/</span> {STEPS.length}
                            </span>
                        </div>
                        <Image src="/logo-primary.webp" alt="The Lab 33" width={80} height={20} className="h-5 w-auto brightness-110" />
                        <button onClick={handleCloseAction} className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-full hover:bg-white/5 active:scale-95 transition-all">
                            <X className="w-4 h-4 text-white/50" />
                        </button>
                    </div>
                    <div className="mt-4 h-[2px] w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="h-full bg-gradient-to-r from-transparent via-[#D4AF77] to-[#D4AF77]/30 transition-all duration-700 ease-out" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
                    </div>
                </div>
            </motion.div>

            {/* HUD Elements */}
            <div className="hidden md:block">
                <MinimalTime />
                <SocialIcons />
                <LocationIndicator />
            </div>

            <div className={`transition-all duration-400 ease-out md:opacity-100 md:pointer-events-auto ${isKeyboardOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Copyright />
            </div>
        </div>
    );
}

// Sub-component for form fields to keep the main component cleaner
interface WaitlistFieldsProps {
    activeStep: { id: string; label: string; prompt: string; placeholder: string };
    formData: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    birthdateData: { day: string; month: string; year: string };
    setBirthdateData: React.Dispatch<React.SetStateAction<{ day: string; month: string; year: string }>>;
    nationalitySearch: string;
    setNationalitySearch: (val: string) => void;
    nationalitySuggestion: Country | null;
    phoneCountry: Country;
    setPhoneCountry: (country: Country) => void;
    phoneCountrySearch: string;
    setPhoneCountrySearch: (val: string) => void;
    duplicateError: string | null;
    setDuplicateError: (val: string | null) => void;
    dayRef: React.RefObject<HTMLInputElement | null>;
    monthRef: React.RefObject<HTMLInputElement | null>;
    yearRef: React.RefObject<HTMLInputElement | null>;
    formattedBirthdate: string | null;
    fieldError: string | null;
}

function WaitlistFields({
    activeStep,
    formData,
    setFormData,
    birthdateData,
    setBirthdateData,
    nationalitySearch,
    setNationalitySearch,
    nationalitySuggestion,
    phoneCountry,
    setPhoneCountry,
    phoneCountrySearch,
    setPhoneCountrySearch,
    duplicateError,
    setDuplicateError,
    dayRef,
    monthRef,
    yearRef,
    formattedBirthdate,
    fieldError
}: WaitlistFieldsProps) {
    return (
        <div className="relative group">
            {activeStep.id === "details" ? (
                <div className="relative space-y-3 md:space-y-4">
                    <DateSelect
                        dayValue={birthdateData.day}
                        monthValue={birthdateData.month}
                        yearValue={birthdateData.year}
                        onDayChange={(val: string) => setBirthdateData(prev => ({ ...prev, day: val }))}
                        onMonthChange={(val: string) => setBirthdateData(prev => ({ ...prev, month: val }))}
                        onYearChange={(val: string) => {
                            setBirthdateData(prev => ({ ...prev, year: val }));
                            if (val.length === 4 && birthdateData.day && birthdateData.month) {
                                setFormData(prev => ({ ...prev, birthdate: `${val}-${birthdateData.month.padStart(2, '0')}-${birthdateData.day.padStart(2, '0')}` }));
                            }
                        }}
                        dayRef={dayRef}
                        monthRef={monthRef}
                        yearRef={yearRef}
                        hasError={!!fieldError && fieldError.includes("date of birth")}
                    />

                    <CountrySelect
                        value={formData.nationality}
                        searchValue={nationalitySearch}
                        onSearchChange={setNationalitySearch}
                        suggestion={nationalitySuggestion}
                        onSelect={(val: string) => setFormData(prev => ({ ...prev, nationality: val }))}
                        hasError={!!fieldError && fieldError.includes("Nationality")}
                    />
                </div>
            ) : activeStep.id === "contact" ? (
                <div className="relative space-y-3 md:space-y-4">
                    <InputField
                        label="Email"
                        value={formData.email}
                        onChange={(e) => {
                            if (setDuplicateError) setDuplicateError(null);
                            setFormData({ ...formData, email: e.target.value });
                        }}
                        placeholder="contact@email.com"
                        hasError={!!fieldError && fieldError.includes("email")}
                    />

                    <PhoneInput
                        value={formData.phone}
                        onChange={(val: string) => {
                            if (setDuplicateError) setDuplicateError(null);
                            setFormData({ ...formData, phone: val });
                        }}
                        country={phoneCountry}
                        countrySearchValue={phoneCountrySearch}
                        onCountrySearch={(val: string) => {
                            setPhoneCountrySearch(val);
                            const exactMatch = COUNTRIES.find((c: Country) => c.code.toLowerCase() === val.toLowerCase() || c.name.toLowerCase() === val.toLowerCase());
                            if (exactMatch) {
                                setPhoneCountry(exactMatch);
                                setPhoneCountrySearch(exactMatch.code);
                            }
                        }}
                        hasError={!!fieldError && fieldError.includes("Phone")}
                        duplicateError={duplicateError}
                    />
                </div>
            ) : activeStep.id === "personal" ? (
                <div className="relative space-y-6 md:space-y-8">
                    <GenderSelect
                        value={formData.gender}
                        onChange={(val: string) => setFormData({ ...formData, gender: val })}
                        hasError={!!fieldError && fieldError.includes("gender")}
                    />

                    <div className="space-y-3 md:space-y-4">
                        <InputField
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="Enter your first name"
                            hasError={!!fieldError && fieldError.includes("First name")}
                        />
                        <InputField
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Enter your last name"
                            hasError={!!fieldError && fieldError.includes("Last name")}
                        />
                    </div>
                </div>
            ) : null}

            <AnimatePresence mode="wait">
                {fieldError ? (
                    <motion.div key="error" initial={{ opacity: 0, y: -4, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -4, filter: "blur(4px)" }} className="mt-4 w-full flex items-center gap-2">
                        <div className="relative flex items-center gap-1.5 py-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                            <span className="text-[10px] md:text-[11px] font-sans tracking-[0.1em] font-bold text-red-600 uppercase">{fieldError}</span>
                            <div className="absolute -inset-2 blur-xl bg-red-500/5 pointer-events-none -z-10" />
                        </div>
                    </motion.div>
                ) : activeStep.id === "details" && formattedBirthdate ? (
                    <motion.div key="preview" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                        <div className="py-1"><span className="text-[10px] font-sans text-white/40 tracking-[0.2em] uppercase">{formattedBirthdate}</span></div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
