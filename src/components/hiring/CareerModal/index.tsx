"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { COUNTRIES, Country } from "@/lib/countries";
import { createClient } from "@/lib/supabase/client";

// Modular Components
import InputField from "@/components/forms/InputField";
import DateSelect from "@/components/forms/DateSelect";
import PhoneInput from "@/components/forms/PhoneInput";
import CountrySelect from "@/components/forms/CountrySelect";
import FileUploader from "@/components/forms/FileUploader";
import Copyright from "@/components/shared/Copyright";
import MinimalTime from "@/components/shared/MinimalTime";
import LocationIndicator from "@/components/shared/LocationIndicator";
import SocialIcons from "@/components/shared/SocialIcons";
import HeaderLogo from "@/components/shared/HeaderLogo";

interface CareerModalProps {
    isOpen: boolean;
    onClose: () => void;
    positionTitle: string;
    positionDescription: string;
    positionRequirements?: string[];
    contactEmail?: string;
}

const STEPS = [
    { id: "personal", label: "IDENTITY", prompt: "Personal & Contact Information", placeholder: "" },
    { id: "legal", label: "LEGAL", prompt: "Birthdate & Nationality", placeholder: "" },
    { id: "professional", label: "CREDENTIALS", prompt: "Professional Profile & Documents", placeholder: "" }
];

export default function CareerModal({
    isOpen,
    onClose,
    positionTitle,
    positionDescription,
    positionRequirements = []
}: CareerModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const submitLockRef = useRef(false);
    const [formData, setFormData] = useState<Record<string, string>>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        birthdate: "",
        nationality: "",
        linkedin: "",
        cv: "",
        coverLetter: ""
    });

    const [birthdateData, setBirthdateData] = useState({ day: "", month: "", year: "" });
    const [nationalitySearch, setNationalitySearch] = useState("");
    const [attemptedContinue, setAttemptedContinue] = useState(false);

    // Phone country code state
    const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES.find((c: Country) => c.code === "+974") || COUNTRIES[0]);
    const [phoneCountrySearch, setPhoneCountrySearch] = useState("");

    // File objects for upload
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

    // Duplicate check state
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    // Keyboard detection for mobile - hide buttons when keyboard is open
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

    const activeStep = STEPS[currentStep];

    const nationalitySuggestion = useMemo(() => {
        if (!nationalitySearch || formData.nationality) return null;
        return COUNTRIES.find((c: Country) =>
            c.name.toLowerCase().startsWith(nationalitySearch.toLowerCase())
        );
    }, [nationalitySearch, formData.nationality]);

    useEffect(() => {
        if (birthdateData.day && birthdateData.month && birthdateData.year) {
            setFormData(prev => ({ ...prev, birthdate: `${birthdateData.year}-${birthdateData.month.padStart(2, '0')}-${birthdateData.day.padStart(2, '0')}` }));
        }
    }, [birthdateData]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';

            // Reset form when modal opens
            setCurrentStep(0);
            setIsSubmitting(false);
            setIsSuccess(false);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                gender: "",
                birthdate: "",
                nationality: "",
                linkedin: "",
                cv: "",
                coverLetter: ""
            });
            setBirthdateData({ day: "", month: "", year: "" });
            setNationalitySearch("");
            setAttemptedContinue(false);
            setCvFile(null);
            setCoverLetterFile(null);
            setDuplicateError(null);
            setPhoneCountry(COUNTRIES.find(c => c.code === "+974") || COUNTRIES[0]);
            setPhoneCountrySearch("");
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, [isOpen]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const getFieldError = (showEmptyError = false) => {
        if (activeStep.id === "personal") {
            if (showEmptyError) {
                if (!formData.firstName) return "First name is required.";
                if (!formData.lastName) return "Last name is required.";
                if (!formData.email) return "Email is required.";
                if (!formData.phone) return "Phone number is required.";
                if (!formData.gender) return "Gender is required.";
            }
            if (formData.email && !validateEmail(formData.email)) return "Invalid email address.";
            if (formData.phone && formData.phone.replace(/\D/g, "").length < 8) return "Invalid phone number.";
        }

        if (activeStep.id === "legal") {
            if (showEmptyError) {
                if (!birthdateData.day || !birthdateData.month || !birthdateData.year) return "Date of birth is required.";
                if (!formData.nationality) return "Nationality is required.";
            }
            if (birthdateData.day || birthdateData.month || birthdateData.year) {
                const d = parseInt(birthdateData.day);
                const m = parseInt(birthdateData.month);
                const y = parseInt(birthdateData.year);
                if (!d || d < 1 || d > 31 || !m || m < 1 || m > 12 || !y || y < 1900 || y > new Date().getFullYear()) return "Invalid birthdate.";
            }
        }

        if (activeStep.id === "professional") {
            if (showEmptyError && !formData.cv) return "CV upload is required.";
        }

        return null;
    };

    const fieldError = duplicateError || getFieldError(attemptedContinue);

    const checkDuplicate = async (field: 'email' | 'phone', value: string): Promise<boolean> => {
        const supabase = createClient();
        try {
            const queryValue = field === 'phone' ? `${phoneCountry.code}${value.replace(/\D/g, '')}` : value.toLowerCase().trim();
            let query = supabase.from('job_applications').select('id');
            // Use case-insensitive match for email to align with the DB unique index on LOWER(email)
            if (field === 'email') {
                query = query.ilike('email', queryValue);
            } else {
                query = query.eq(field, queryValue);
            }
            const { data } = await query.maybeSingle();

            if (data) {
                setDuplicateError(`This ${field} has already been used.`);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Duplicate check error:", err);
            return false;
        }
    };

    const handleNext = async () => {
        setDuplicateError(null);
        const error = getFieldError(true);
        if (error) {
            setAttemptedContinue(true);
            return;
        }

        if (activeStep.id === 'personal') {
            if (await checkDuplicate('email', formData.email)) return;
            if (await checkDuplicate('phone', formData.phone)) return;
        }

        setAttemptedContinue(false);
        if (currentStep < STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setAttemptedContinue(false);
            setDuplicateError(null);
        }
    };

    const handleSubmit = async () => {
        // Prevent double-submit from rapid clicks
        if (submitLockRef.current) return;
        submitLockRef.current = true;
        setIsSubmitting(true);
        try {
            const supabase = createClient();
            const timestamp = Date.now();
            const sanitizedName = `${formData.firstName}_${formData.lastName}`.replace(/\s+/g, '_');
            const sanitizedPosition = positionTitle.replace(/\s+/g, '_');

            // Resolve correct MIME type - mobile browsers sometimes report wrong types
            const getMimeType = (file: File): string => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                const mimeMap: Record<string, string> = {
                    pdf: 'application/pdf',
                    doc: 'application/msword',
                    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                };
                return mimeMap[ext || ''] || file.type || 'application/pdf';
            };

            let cvPath = null;
            if (cvFile) {
                const ext = cvFile.name.split('.').pop();
                const path = `${sanitizedPosition}/${sanitizedName}_CV_${timestamp}.${ext}`;
                const { data, error: uploadError } = await supabase.storage.from('job-documents').upload(path, cvFile, {
                    contentType: getMimeType(cvFile),
                    cacheControl: '3600',
                });
                if (uploadError) {
                    console.error('[CareerModal] CV upload error:', uploadError.message);
                    throw new Error(`CV upload failed: ${uploadError.message}`);
                }
                cvPath = data?.path;
            }

            let coverPath = null;
            if (coverLetterFile) {
                const ext = coverLetterFile.name.split('.').pop();
                const path = `${sanitizedPosition}/${sanitizedName}_CL_${timestamp}.${ext}`;
                const { data, error: uploadError } = await supabase.storage.from('job-documents').upload(path, coverLetterFile, {
                    contentType: getMimeType(coverLetterFile),
                    cacheControl: '3600',
                });
                if (uploadError) {
                    console.error('[CareerModal] Cover letter upload error:', uploadError.message);
                    // Non-critical — continue without cover letter
                }
                coverPath = data?.path;
            }

            const fullPhone = `${phoneCountry.code}${formData.phone.replace(/\D/g, '')}`;

            const { error } = await supabase.from('job_applications').insert({
                position_title: positionTitle,
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                email: formData.email.toLowerCase().trim(),
                phone: fullPhone,
                gender: formData.gender,
                birthdate: formData.birthdate || null,
                nationality: formData.nationality,
                linkedin_url: formData.linkedin || null,
                cv_filename: cvPath || null,
                cover_letter_filename: coverPath || null,
                status: 'pending'
            });

            if (error) {
                console.error('[CareerModal] DB insert error:', error.message, error.code, error.details);
                if (error.code === '23505') {
                    setDuplicateError("You have already applied for this position.");
                    return;
                }
                throw new Error(`Database error: ${error.message}`);
            }



            // Send notifications - awaited with timeout to ensure they actually fire
            await Promise.allSettled([
                fetch('/api/send-application', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        firstName: formData.firstName,
                        position: positionTitle,
                    }),
                    signal: AbortSignal.timeout(8000),
                })
                    .then(r => r.json())
                    .catch(err => console.error('[CareerModal] Email error:', err)),
            ]);

            setIsSuccess(true);
            setTimeout(() => onClose(), 4000);
        } catch (error) {
            const msg = error instanceof Error ? error.message : JSON.stringify(error);
            console.error('[CareerModal] Submission failed:', msg);
            if (!duplicateError) {
                setDuplicateError("Submission failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
            submitLockRef.current = false;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !isSubmitting && isOpen) {
                handleNext();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isSubmitting, activeStep.id]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[80px]" />

                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10">
                        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fff_1px,#fff_2px)] bg-[length:100%_2px]" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(40px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, filter: "blur(40px)" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-20 w-full h-full flex flex-col md:flex-row"
                    >
                        {/* HEADER HUD */}
                        <div className={`fixed top-0 left-0 right-0 h-24 px-10 hidden md:flex items-center justify-end z-[150] pointer-events-none`}>
                            <div className="pointer-events-auto">
                                <button
                                    onClick={onClose}
                                    className="group flex items-center justify-center transition-all duration-500 hover:rotate-90"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-full bg-black/20 backdrop-blur-xl group-hover:bg-[#D4AF77]/10 group-hover:border-[#D4AF77]/30 transition-all duration-500">
                                        <X className="w-5 h-5 text-white/40 group-hover:text-[#D4AF77] transition-colors" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* LOGO */}
                        <div className="hidden md:block">
                            <HeaderLogo pathLabel="/hiring" />
                        </div>


                        {/* LEFT: SHOWCASE */}
                        <div className="hidden md:flex w-1/2 h-full p-24 lg:p-32 flex-col justify-center bg-black/30 backdrop-blur-3xl relative">
                            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5 }} className="space-y-10">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="h-px w-16 bg-[#D4AF77]" />
                                        <span className="text-[10px] font-sans text-[#D4AF77] tracking-[0.6em] uppercase">Open Position</span>
                                    </div>
                                    <h2 className="font-serif text-5xl md:text-6xl text-white tracking-tight leading-[0.9] uppercase">{positionTitle}</h2>
                                </div>
                                <div className="space-y-8 border-t border-white/5 pt-12">
                                    <p className="text-lg font-sans text-[#A8A29E] font-light leading-relaxed">{positionDescription}</p>
                                </div>
                                <ul className="space-y-3">
                                    {positionRequirements.map((req, i) => (
                                        <li key={i} className="flex gap-6 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF77]/40 mt-2.5" />
                                            <span className="text-base font-sans text-[#A8A29E] group-hover:text-white transition-colors">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>

                        {/* VERTICAL DIVIDER */}
                        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-[70vh] z-30 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-px bg-gradient-to-b from-transparent via-[#D4AF77]/40 to-transparent" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#D4AF77] shadow-[0_0_15px_#D4AF77]" />
                        </div>

                        {/* RIGHT: FORM */}
                        <div className={`w-full md:w-1/2 h-full flex flex-col items-center justify-center px-5 sm:px-6 md:p-24 bg-black/30 backdrop-blur-3xl overflow-y-auto overflow-x-hidden transition-all duration-300 ${isKeyboardOpen ? 'py-4' : 'py-24'}`}>
                            {!isSuccess ? (
                                <div className="w-full max-w-full md:max-w-2xl">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep.id}
                                            initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: -40, filter: "blur(20px)" }}
                                            className="space-y-12 md:space-y-16 w-full"
                                        >

                                            <div className="space-y-8">
                                                <h3 className={`text-2xl md:text-3xl font-serif text-white tracking-tight transition-all duration-300 md:!max-h-20 md:!opacity-100 md:!mb-0 ${isKeyboardOpen ? 'max-h-0 opacity-0 overflow-hidden mb-0' : 'max-h-20 opacity-100 mb-0'}`}>{activeStep.prompt}</h3>

                                                <div className="space-y-1">
                                                    <CareerFormFields
                                                        activeStep={activeStep}
                                                        formData={formData}
                                                        setFormData={setFormData}
                                                        birthdateData={birthdateData}
                                                        setBirthdateData={setBirthdateData}
                                                        nationalitySearch={nationalitySearch}
                                                        setNationalitySearch={setNationalitySearch}
                                                        nationalitySuggestion={nationalitySuggestion ?? null}
                                                        phoneCountry={phoneCountry}
                                                        setPhoneCountry={setPhoneCountry}
                                                        phoneCountrySearch={phoneCountrySearch}
                                                        setPhoneCountrySearch={setPhoneCountrySearch}
                                                        dayRef={dayRef}
                                                        monthRef={monthRef}
                                                        yearRef={yearRef}
                                                        fieldError={fieldError}
                                                        setCvFile={setCvFile}
                                                        setCoverLetterFile={setCoverLetterFile}
                                                    />

                                                    <AnimatePresence mode="wait">
                                                        {fieldError ? (
                                                            <motion.div
                                                                key="error"
                                                                initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
                                                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                                                exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <div className="flex items-center gap-1.5 py-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                                                    <span className="text-[10px] md:text-[11px] font-sans tracking-[0.1em] font-bold text-red-600 uppercase">{fieldError}</span>
                                                                </div>
                                                            </motion.div>
                                                        ) : activeStep.id === "legal" && (birthdateData.day || birthdateData.month || birthdateData.year) ? (
                                                            <motion.div
                                                                key="preview"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="py-1"
                                                            >
                                                                <span className="text-[10px] font-sans text-white/40 tracking-[0.2em] uppercase">
                                                                    Birthdate: {birthdateData.day || 'DD'} / {birthdateData.month || 'MM'} / {birthdateData.year || 'YYYY'}
                                                                </span>
                                                            </motion.div>
                                                        ) : null}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className={`fixed bottom-24 md:bottom-auto left-0 right-0 px-6 z-50 md:relative md:left-auto md:right-auto md:px-0 md:z-auto flex items-center gap-3 md:gap-4 md:pt-20 md:mt-4 transition-all duration-400 ease-out ${isKeyboardOpen ? 'opacity-0 pointer-events-none translate-y-4 md:opacity-100 md:pointer-events-auto md:translate-y-0' : 'opacity-100 translate-y-0'}`}>
                                        <motion.button
                                            onClick={handlePrev}
                                            disabled={currentStep === 0}
                                            className={`group relative flex-1 h-12 md:h-14 px-4 md:px-6 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl transition-all duration-500 flex items-center justify-center gap-2 md:gap-3 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-[0.98]'}`}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                            <span className="text-xs md:text-sm font-sans text-white/40 group-hover:text-white tracking-[0.1em] capitalize transition-colors">Back</span>
                                        </motion.button>
                                        <motion.button
                                            onClick={handleNext}
                                            disabled={isSubmitting}
                                            className="group relative flex-1 h-12 md:h-14 px-6 md:px-8 rounded-xl bg-gradient-to-r from-[#D4AF77]/15 to-[#D4AF77]/5 border border-[#D4AF77]/30 backdrop-blur-xl transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 overflow-hidden hover:border-[#D4AF77]/50 hover:from-[#D4AF77]/20 hover:to-[#D4AF77]/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            <span className="relative text-xs md:text-sm font-sans text-[#D4AF77] tracking-[0.1em] capitalize font-medium">
                                                {isSubmitting ? "Processing..." : (currentStep === STEPS.length - 1 ? "Submit" : "Continue")}
                                            </span>
                                            <ArrowRight className="relative w-4 h-4 text-[#D4AF77] group-hover:translate-x-0.5 transition-transform" />
                                        </motion.button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-8">
                                    <div className="w-24 h-24 mx-auto border border-[#D4AF77]/30 rounded-full flex items-center justify-center bg-[#D4AF77]/10">
                                        <Check className="w-10 h-10 text-[#D4AF77]" />
                                    </div>
                                    <h2 className="text-4xl font-serif text-white">Application Received</h2>
                                    <p className="text-white/40 font-sans max-w-sm mx-auto">Your credentials have been securely transmitted. Our talent acquisition team will review your profile shortly.</p>
                                </div>
                            )}
                        </div>

                        {/* MOBILE HEADER */}
                        <div className={`fixed top-0 left-0 w-full md:hidden bg-gradient-to-b from-black via-black/90 to-transparent px-5 pt-4 pb-6 z-50 transition-all duration-300 ease-out ${isKeyboardOpen ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#D4AF77] animate-pulse" />
                                    <span className="text-[10px] font-serif text-white/70 tracking-[0.2em] uppercase">
                                        {currentStep + 1} <span className="text-white/30">/</span> {STEPS.length}
                                    </span>
                                </div>
                                <Image src="/logo-primary.webp" alt="The Lab 33" width={80} height={20} className="h-5 w-auto brightness-110" />
                                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-full hover:bg-white/5 active:scale-95 transition-all">
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-center">
                                <span className="text-[9px] font-sans tracking-[0.3em] text-[#D4AF77]/60 uppercase">
                                    Applying for: <span className="text-[#D4AF77] font-medium">{positionTitle}</span>
                                </span>
                            </div>
                            <div className="mt-3 h-[2px] w-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <div className="h-full bg-gradient-to-r from-transparent via-[#D4AF77] to-[#D4AF77]/30 transition-all duration-700 ease-out" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* HUD Elements */}
                    <div className="hidden md:block text-white">
                        <MinimalTime />
                        <SocialIcons />
                        <LocationIndicator />
                    </div>
                    <div className={`transition-all duration-300 ${isKeyboardOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <Copyright />
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

interface CareerFormFieldsProps {
    activeStep: { id: string; label: string; prompt: string; placeholder: string };
    formData: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    birthdateData: { day: string; month: string; year: string };
    setBirthdateData: React.Dispatch<React.SetStateAction<{ day: string; month: string; year: string }>>;
    nationalitySearch: string;
    setNationalitySearch: (val: string) => void;
    nationalitySuggestion: Country | null;
    phoneCountry: Country;
    setPhoneCountry: (c: Country) => void;
    phoneCountrySearch: string;
    setPhoneCountrySearch: (val: string) => void;
    dayRef: React.RefObject<HTMLInputElement | null>;
    monthRef: React.RefObject<HTMLInputElement | null>;
    yearRef: React.RefObject<HTMLInputElement | null>;
    fieldError: string | null;
    setCvFile: (file: File | null) => void;
    setCoverLetterFile: (file: File | null) => void;
}

function CareerFormFields({
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
    dayRef,
    monthRef,
    yearRef,
    fieldError,
    setCvFile,
    setCoverLetterFile
}: CareerFormFieldsProps) {
    if (activeStep.id === "personal") {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                    <InputField label="First Name" value={formData.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First name" hasError={!!fieldError && fieldError.includes("First name")} />
                    <InputField label="Last Name" value={formData.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last name" hasError={!!fieldError && fieldError.includes("Last name")} />
                </div>
                <InputField label="Email" type="email" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, email: e.target.value })} placeholder="professional@email.com" hasError={!!fieldError && fieldError.includes("Email")} />
                <PhoneInput
                    value={formData.phone}
                    onChange={(val: string) => setFormData({ ...formData, phone: val })}
                    country={phoneCountry}
                    countrySearchValue={phoneCountrySearch}
                    onCountrySearch={(val: string) => {
                        setPhoneCountrySearch(val);
                        const match = COUNTRIES.find((c: Country) => c.code === val || c.name.toLowerCase() === val.toLowerCase());
                        if (match) setPhoneCountry(match);
                    }}
                    hasError={!!fieldError && (fieldError.includes("Phone") || fieldError.includes("used"))}
                />
                {/* Gender selector */}
                <div className={`relative px-3 sm:px-4 md:px-6 h-12 md:h-14 rounded-xl bg-white/[0.06] border transition-all duration-500 backdrop-blur-xl flex items-center gap-3 md:gap-4 ${fieldError && !formData.gender ? "border-red-500/50" : "border-white/[0.12]"}`}>
                    <span className={`text-[10px] md:text-xs font-sans tracking-[0.1em] uppercase transition-colors duration-300 ${fieldError && !formData.gender ? "text-red-400" : "text-[#D4AF77]/80"}`}>Gender</span>
                    <div className="w-px h-4 bg-white/10 shrink-0" />
                    <div className="flex-1 flex gap-2">
                        {['Male', 'Female'].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setFormData({ ...formData, gender: g.toLowerCase() })}
                                className={`flex-1 h-8 md:h-9 rounded-lg text-[10px] font-sans font-bold tracking-[0.1em] uppercase transition-all duration-300 border ${formData.gender === g.toLowerCase()
                                    ? 'bg-[#D4AF77]/15 border-[#D4AF77]/40 text-[#D4AF77] shadow-[0_0_10px_rgba(212,175,119,0.1)]'
                                    : 'bg-white/[0.03] border-white/[0.06] text-white/25 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/40'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                    {/* HUD Indicator */}
                    <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${formData.gender ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500/80 shadow-[0_0_6px_rgba(220,38,38,0.3)]"}`} />
                    </div>
                </div>
            </div>
        );
    }
    if (activeStep.id === "legal") {
        return (
            <div className="space-y-4">
                <DateSelect dayValue={birthdateData.day} monthValue={birthdateData.month} yearValue={birthdateData.year} onDayChange={(val: string) => setBirthdateData((p) => ({ ...p, day: val }))} onMonthChange={(val: string) => setBirthdateData((p) => ({ ...p, month: val }))} onYearChange={(val: string) => setBirthdateData((p) => ({ ...p, year: val }))} dayRef={dayRef} monthRef={monthRef} yearRef={yearRef} hasError={!!fieldError && fieldError.includes("birthdate")} />
                <CountrySelect value={formData.nationality} searchValue={nationalitySearch} onSearchChange={setNationalitySearch} suggestion={nationalitySuggestion} onSelect={(val: string) => setFormData((p) => ({ ...p, nationality: val }))} hasError={!!fieldError && fieldError.includes("Nationality")} />
            </div>
        );
    }
    if (activeStep.id === "professional") {
        return (
            <div className="space-y-4">
                <InputField label="LinkedIn" required={false} value={formData.linkedin} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="linkedin.com/in/profile" />
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <FileUploader label="Attach CV" fileName={formData.cv} onFileSelect={(file: File | null) => { setCvFile(file); setFormData({ ...formData, cv: file?.name || "" }); }} hasError={!!fieldError && fieldError.includes("CV")} />
                    <FileUploader label="Attach CL" required={false} fileName={formData.coverLetter} onFileSelect={(file: File | null) => { setCoverLetterFile(file); setFormData({ ...formData, coverLetter: file?.name || "" }); }} />
                </div>
            </div>
        );
    }
    return null;
}
