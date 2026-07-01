"use client";

import { motion } from "framer-motion";
import { Paperclip, Check } from "lucide-react";
import { useRef } from "react";

interface FileUploaderProps {
    label: string;
    fileName: string;
    onFileSelect: (file: File | null) => void;
    hasError?: boolean;
    accept?: string;
    required?: boolean;
}

export default function FileUploader({
    label,
    fileName,
    onFileSelect,
    hasError,
    accept = ".pdf,.doc,.docx",
    required = true
}: FileUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <motion.div
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                style={{
                    background: "linear-gradient(135deg, rgba(212,175,119,0.2) 0%, transparent 50%, rgba(212,175,119,0.1) 100%)"
                }}
            />

            <div className={`relative h-28 md:h-32 px-4 md:px-6 rounded-xl bg-white/[0.06] border transition-all duration-500 backdrop-blur-xl flex flex-col justify-center gap-1 ${hasError ? "border-red-500/50" : "border-white/[0.12] group-hover:border-[#D4AF77]/40 group-hover:bg-white/[0.08]"}`}>
                <div className="absolute top-4 right-4 z-10">
                    {/* HUD STATUS INDICATOR */}
                    <div className="flex items-center gap-1.5">
                        {required ? (
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${fileName ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"}`} />
                        ) : (
                            <>
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${fileName ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-white/10"}`} />
                                {!fileName && (
                                    <span className="text-[8px] font-sans tracking-[0.2em] font-bold text-white/20 uppercase">
                                        OPTIONAL
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileSelect(file);
                    }}
                    className="hidden"
                    accept={accept}
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center py-4"
                >
                    {fileName ? (
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-2 bg-[#D4AF77]/20 rounded-full"
                            >
                                <Check className="w-5 h-5 text-[#D4AF77]" />
                            </motion.div>
                            <span className="text-sm md:text-base font-serif text-white tracking-wide text-center truncate max-w-[200px] md:max-w-xs">{fileName}</span>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="p-3 rounded-full mb-1"
                            >
                                <Paperclip className={`w-6 h-6 transition-colors ${hasError ? 'text-red-400/60' : 'text-[#D4AF77]/60 group-hover:text-[#D4AF77]'}`} />
                            </motion.div>
                            <span className={`text-[10px] font-sans tracking-[0.2em] uppercase transition-colors ${hasError ? 'text-red-400/80' : 'text-white/30 group-hover:text-white/50'}`}>
                                {label}
                            </span>
                            <span className="text-[8px] font-sans text-white/20 tracking-[0.1em] mt-1 uppercase">PDF, DOC, DOCX up to 10MB</span>
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
