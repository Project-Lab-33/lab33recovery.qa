"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle, AlertTriangle, Radio, ExternalLink,
    Pencil, X, Save, RefreshCcw, Eye, EyeOff,
} from "lucide-react";
import { ToggleSwitch } from "@/components/admin/shared";

const ACCENT = "#b48c50";

interface ConnectionStatusHeaderProps {
    configured: boolean;
    enabled?: boolean;
    title: string;
    subtitle: string;
    tokenPreview?: string;
    portalUrl?: string;
    portalLabel?: string;
    accent?: string;
    serviceIcon?: React.ElementType;
    onToggle?: (value: boolean) => void;
    isToggling?: boolean;
}

export function ConnectionStatusHeader({
    configured,
    enabled,
    title,
    subtitle,
    tokenPreview,
    portalUrl,
    portalLabel = "Developer Portal",
    accent = ACCENT,
    serviceIcon: ServiceIcon,
    onToggle,
    isToggling,
}: ConnectionStatusHeaderProps) {
    return (
        <div className="px-8 py-6 border-b border-[var(--border-strong)]/40">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl border flex items-center justify-center" style={{
                        backgroundColor: configured ? `${accent}15` : undefined,
                        borderColor: configured ? `${accent}30` : "var(--border-subtle)",
                        color: configured ? accent : "var(--text-muted)",
                    }}>
                        {configured ? <CheckCircle size={18} strokeWidth={1.5} /> : <AlertTriangle size={18} strokeWidth={1.5} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-medium text-[var(--text-primary)]">
                                {configured ? title : 'Not Configured'}
                            </h3>
                            {configured && enabled !== undefined && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${accent}15`, color: accent }}>
                                    <Radio size={8} /> {enabled ? 'Active' : 'Paused'}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)]/50 tracking-wide mt-0.5">
                            {configured ? subtitle : 'Configure credentials to connect'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {tokenPreview && (
                        <code className="text-[12px] text-[var(--text-secondary)] font-mono bg-[var(--surface-high)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                            {tokenPreview}
                        </code>
                    )}
                    {portalUrl && (
                        <a href={portalUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-secondary)] transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <ExternalLink size={10} />{portalLabel}
                        </a>
                    )}
                </div>
            </div>

            {/* Toggle row — only if onToggle provided */}
            {onToggle && configured && (
                <div className="mt-4 pt-4 border-t border-[var(--border-strong)]/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${enabled
                            ? 'bg-[#b48c50]/15 border border-[#b48c50]/30 text-[#b48c50] shadow-[0_0_20px_rgba(180,140,80,0.15)]'
                            : 'bg-[var(--surface-high)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                            }`}>
                            {ServiceIcon ? <ServiceIcon size={18} /> : <Radio size={18} />}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{enabled ? 'Integration Active' : 'Integration Paused'}</h3>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{enabled ? 'Data flowing normally' : 'Toggle to enable'}</p>
                        </div>
                    </div>
                    <ToggleSwitch enabled={enabled || false} onToggle={() => onToggle(!enabled)} disabled={isToggling} accentColor={accent} />
                </div>
            )}
        </div>
    );
}


// InfoField — read-only key/value row
interface InfoFieldProps {
    icon: React.ElementType;
    label: string;
    value: string;
    mono?: boolean;
    accent?: string;
    statusDot?: 'green' | 'red' | 'gold' | null;
}

export function InfoField({ icon: Icon, label, value, mono = false, statusDot = null }: InfoFieldProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon size={14} className="text-[var(--text-muted)]" />
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {statusDot && (
                    <div className={`w-2 h-2 rounded-full ${statusDot === 'green' ? 'bg-emerald-400' : statusDot === 'red' ? 'bg-rose-400' : 'bg-[#b48c50]'}`} />
                )}
                <code className={`text-[12px] text-[var(--text-secondary)] bg-[var(--surface-high)] px-3 py-1 rounded-lg border border-[var(--border-subtle)] ${mono ? 'font-mono' : ''}`}>{value}</code>
            </div>
        </div>
    );
}


// CredentialInput — labelled input with gold focus ring
interface CredentialInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    hint?: string;
    accent?: string;
    type?: 'text' | 'textarea';
    rows?: number;
    secret?: boolean;
}

export function CredentialInput({ label, value, onChange, placeholder, hint, accent = ACCENT, type = 'text', rows = 3, secret = false }: CredentialInputProps) {
    const [visible, setVisible] = useState(false);
    const inputType = secret && !visible ? 'password' : 'text';

    return (
        <div>
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-2 block">{label}</label>
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
                        className="w-full px-4 py-2.5 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-[12px] text-[var(--text-primary)] font-mono placeholder:text-[var(--text-muted)] outline-none transition-colors resize-none"
                        onFocus={(e) => e.target.style.borderColor = accent} onBlur={(e) => e.target.style.borderColor = ''} />
                ) : (
                    <>
                        <input type={inputType} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                            className="w-full px-4 py-2.5 bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] font-mono placeholder:text-[var(--text-muted)] outline-none transition-colors pr-10"
                            onFocus={(e) => e.target.style.borderColor = accent} onBlur={(e) => e.target.style.borderColor = ''} />
                        {secret && (
                            <button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        )}
                    </>
                )}
            </div>
            {hint && <p className="text-[10px] text-[var(--text-muted)]/60 mt-1.5 ml-1">{hint}</p>}
        </div>
    );
}


// CredentialCard — Container with edit/save/cancel
interface CredentialCardProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    isSaving: boolean;
    configured?: boolean;
    accent?: string;
    delay?: number;
    editLabel?: string;
    children: React.ReactNode;
}

export function CredentialCard({ icon: Icon, title, subtitle, isEditing, onEdit, onCancel, onSave, isSaving, configured = false, accent = ACCENT, delay = 0.3, editLabel, children }: CredentialCardProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className="rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border-strong)]/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                            <Icon size={14} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h3>
                            <p className="text-[10px] text-[var(--text-secondary)]/40">{subtitle}</p>
                        </div>
                    </div>
                    {!isEditing ? (
                        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-secondary)] transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <Pencil size={11} />{editLabel || (configured ? 'Change' : 'Setup')}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={onCancel}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-[10px] font-bold uppercase tracking-wider">
                                <X size={11} />Cancel
                            </button>
                            <button onClick={onSave} disabled={isSaving}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                                style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                                {isSaving ? <RefreshCcw size={11} className="animate-spin" /> : <Save size={11} />}Save
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="px-6 py-5 space-y-4">
                {children}
            </div>
        </motion.div>
    );
}


// KpiGrid — small stat boxes used across settings
interface KpiItem {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    accent?: string;
}

interface KpiGridProps {
    kpis: KpiItem[];
    columns?: number;
    delay?: number;
    className?: string;
}

export function KpiGrid({ kpis, columns = 4, delay = 0.1, className = "" }: KpiGridProps) {
    return (
        <div className={`grid grid-cols-2 lg:grid-cols-${columns} gap-4 ${className}`}>
            {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                const accent = kpi.accent || ACCENT;
                return (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + i * 0.03 }}
                        className="relative p-5 rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 hover:border-[var(--border-medium)] transition-all group overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity" style={{ background: `radial-gradient(circle, ${accent}20, transparent)` }} />
                        <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                                    <Icon size={16} strokeWidth={1.5} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mt-1">{kpi.label}</p>
                            {kpi.sub && <p className="text-[10px] text-[var(--text-muted)] mt-1">{kpi.sub}</p>}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}


// GlassSection — framer-animated section card
interface GlassSectionProps {
    delay?: number;
    children: React.ReactNode;
    className?: string;
}

export function GlassSection({ delay = 0.2, children, className = "" }: GlassSectionProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className={`rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 overflow-hidden ${className}`}>
            {children}
        </motion.div>
    );
}


export function SectionDivider() {
    return <div className="border-b border-[var(--border-strong)]/30" />;
}


interface TestConnectionBannerProps {
    isTesting: boolean;
    testStatus: { type: 'success' | 'error'; message: string; details?: Record<string, string | null> } | null;
    onTest: () => void;
    onDismiss: () => void;
    accent?: string;
}

export function TestConnectionBanner({ isTesting, testStatus, onTest, onDismiss, accent = ACCENT }: TestConnectionBannerProps) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <button onClick={onTest} disabled={isTesting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                    {isTesting ? <RefreshCcw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
            </div>
            {testStatus && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                    <div className={`p-4 rounded-xl border text-[12px] ${testStatus.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {testStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                <span className="font-medium">{testStatus.message}</span>
                            </div>
                            <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
                                <X size={14} />
                            </button>
                        </div>
                        {testStatus.details && (
                            <div className="mt-2 pt-2 border-t border-current/10 space-y-1">
                                {Object.entries(testStatus.details).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-[11px]">
                                        <span className="opacity-60">{k}</span>
                                        <span className="font-mono">{v || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
