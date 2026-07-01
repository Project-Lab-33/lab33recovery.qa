"use client";

import { useCallback, useRef, useEffect } from "react";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Type, AlignCenter, MousePointerClick, Share2, FileText,
    Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Sun, Moon, Eye, EyeOff, MessageSquare, Minus
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EmailSections, EmailBodyBlock, EmailTheme } from "./types";

interface SectionEditorProps {
    sections: EmailSections;
    onChange: (sections: EmailSections) => void;
    readOnly?: boolean;
}

function SectionCard({ title, icon: Icon, children, collapsed, onToggle, visible, onToggleVisible, readOnly }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    collapsed?: boolean;
    onToggle?: () => void;
    visible?: boolean;
    onToggleVisible?: () => void;
    readOnly?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-mid)]/50 overflow-hidden">
            <div role="button" tabIndex={0} onClick={onToggle}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--surface-high)]/30 transition-colors cursor-pointer select-none">
                <Icon size={15} className="text-[var(--accent-gold)] shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] flex-1">{title}</span>
                {onToggleVisible && !readOnly && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
                        className={`p-1.5 rounded-lg transition-colors ${visible
                            ? 'text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-high)]'}`}
                        title={visible ? 'Hide section' : 'Show section'}>
                        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                )}
                {collapsed !== undefined && (
                    collapsed ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronUp size={14} className="text-[var(--text-muted)]" />
                )}
            </div>
            {!collapsed && (
                <div className="px-5 pb-5 space-y-3 border-t border-[var(--border-subtle)]">
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] block mb-1.5">{children}</label>;
}

function FieldInput({ value, onChange, placeholder, readOnly, small }: {
    value: string; onChange: (v: string) => void; placeholder?: string; readOnly?: boolean; small?: boolean;
}) {
    return (
        <input value={value} onChange={(e) => onChange(e.target.value)} readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full px-3.5 ${small ? 'py-2 text-[12px]' : 'py-2.5 text-sm'} bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors`} />
    );
}

function FieldTextarea({ value, onChange, placeholder, readOnly, rows = 2 }: {
    value: string; onChange: (v: string) => void; placeholder?: string; readOnly?: boolean; rows?: number;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const autoResize = () => {
        const el = ref.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };
    useEffect(() => { autoResize(); }, [value]);
    return (
        <textarea ref={ref} value={value} onChange={(e) => { onChange(e.target.value); autoResize(); }} readOnly={readOnly}
            rows={rows} placeholder={placeholder}
            className="w-full px-3.5 py-2.5 bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] outline-none transition-colors resize-none overflow-hidden" />
    );
}

export default function SectionEditor({ sections, onChange, readOnly = false }: SectionEditorProps) {

    // Helper to update nested sections
    const update = useCallback((partial: Partial<EmailSections>) => {
        onChange({ ...sections, ...partial });
    }, [sections, onChange]);

    const updateBlock = (index: number, block: EmailBodyBlock) => {
        const body = [...sections.body];
        body[index] = block;
        update({ body });
    };

    const addBlock = (type: EmailBodyBlock['type']) => {
        const newBlock: EmailBodyBlock = type === 'greeting'
            ? { type: 'greeting', text: 'Hello {{first_name}},' }
            : type === 'paragraph'
                ? { type: 'paragraph', text: '' }
                : { type: 'divider' };
        update({ body: [...sections.body, newBlock] });
    };

    const removeBlock = (index: number) => {
        update({ body: sections.body.filter((_, i) => i !== index) });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const body = [...sections.body];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= body.length) return;
        [body[index], body[newIndex]] = [body[newIndex], body[index]];
        update({ body });
    };

    return (
        <div className="space-y-4">

            {/* Header (Badge + Heading) */}
            <SectionCard title="Header" icon={Type}
                visible={sections.badge.visible}
                onToggleVisible={() => update({ badge: { ...sections.badge, visible: !sections.badge.visible } })}
                readOnly={readOnly}>
                <div className="space-y-3">
                    <div>
                        <FieldLabel>Status Badge</FieldLabel>
                        <FieldInput value={sections.badge.text}
                            onChange={(text) => update({ badge: { ...sections.badge, text } })}
                            placeholder="e.g. WAITLIST CONFIRMED" readOnly={readOnly} small />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Heading Line</FieldLabel>
                            <FieldInput value={sections.heading.line1}
                                onChange={(line1) => update({ heading: { ...sections.heading, line1 } })}
                                placeholder="e.g. Registration" readOnly={readOnly} small />
                        </div>
                        <div>
                            <FieldLabel>Accent Word</FieldLabel>
                            <FieldInput value={sections.heading.accent}
                                onChange={(accent) => update({ heading: { ...sections.heading, accent } })}
                                placeholder="e.g. Confirmed" readOnly={readOnly} small />
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* Body Blocks */}
            <SectionCard title="Email Body" icon={AlignCenter} readOnly={readOnly}>
                <div className="space-y-3">
                    {sections.body.map((block, idx) => (
                        <div key={idx} className="group flex gap-2 items-start">
                            {/* Drag Handle & Controls */}
                            {!readOnly && (
                                <div className="flex flex-col items-center gap-0.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical size={12} className="text-[var(--text-muted)]" />
                                    <button type="button" onClick={() => moveBlock(idx, 'up')} disabled={idx === 0}
                                        className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20">
                                        <ChevronUp size={10} />
                                    </button>
                                    <button type="button" onClick={() => moveBlock(idx, 'down')} disabled={idx === sections.body.length - 1}
                                        className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20">
                                        <ChevronDown size={10} />
                                    </button>
                                </div>
                            )}

                            {/* Block Content */}
                            <div className="flex-1">
                                {block.type === 'divider' ? (
                                    <div className="flex items-center gap-2 py-3">
                                        <Minus size={12} className="text-[var(--accent-gold)]/40" />
                                        <div className="flex-1 h-px bg-[var(--accent-gold)]/20" />
                                        <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Divider</span>
                                        <div className="flex-1 h-px bg-[var(--accent-gold)]/20" />
                                        <Minus size={12} className="text-[var(--accent-gold)]/40" />
                                    </div>
                                ) : block.type === 'image' || block.type === 'image-grid' ? (
                                    <div className="py-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                            {block.type === 'image' ? '🖼 Image' : '🖼 Image Grid'}
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${block.type === 'greeting' ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'}`}>
                                                {block.type === 'greeting' ? '👋 Greeting' : '¶ Paragraph'}
                                            </span>
                                        </div>
                                        <FieldTextarea value={block.text}
                                            onChange={(text) => updateBlock(idx, { ...block, text })}
                                            placeholder={block.type === 'greeting' ? 'Hello {{first_name}},' : 'Write your content...'}
                                            readOnly={readOnly} rows={block.type === 'greeting' ? 1 : 2} />
                                        {/* Variable Insert + Formatting Hint */}
                                        {!readOnly && (
                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                {[
                                                    { key: '{{first_name}}', label: 'first_name' },
                                                    { key: '{{last_name}}', label: 'last_name' },
                                                    { key: '{{email}}', label: 'email' },
                                                    { key: '{{company}}', label: 'company' },
                                                ].map(v => (
                                                    <button key={v.key} type="button"
                                                        onClick={() => updateBlock(idx, { ...block, text: block.text + v.key } as typeof block)}
                                                        className="px-2 py-0.5 rounded-md bg-[var(--accent-gold)]/8 border border-[var(--accent-gold)]/20 text-[9px] font-mono text-[var(--accent-gold)]/70 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/40 transition-colors">
                                                        {`{{${v.label}}}`}
                                                    </button>
                                                ))}
                                                <span className="text-[8px] text-[var(--text-muted)] ml-1">
                                                    <span className="text-[var(--accent-gold)]/50">{'{{var}}'}</span> = gold · <strong>**bold**</strong> · <em>*italic*</em>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Delete Block */}
                            {!readOnly && (
                                <button type="button" onClick={() => removeBlock(idx)}
                                    className="mt-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Block Buttons */}
                    {!readOnly && (
                        <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
                            <button type="button" onClick={() => addBlock('greeting')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors">
                                <Plus size={10} /> Greeting
                            </button>
                            <button type="button" onClick={() => addBlock('paragraph')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors">
                                <Plus size={10} /> Paragraph
                            </button>
                            <button type="button" onClick={() => addBlock('divider')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors">
                                <Plus size={10} /> Divider
                            </button>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* CTA Button Section */}
            <SectionCard title="Call to Action" icon={MousePointerClick}
                visible={sections.cta.visible}
                onToggleVisible={() => update({ cta: { ...sections.cta, visible: !sections.cta.visible } })}
                readOnly={readOnly}>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>Button Text</FieldLabel>
                        <FieldInput value={sections.cta.text}
                            onChange={(text) => update({ cta: { ...sections.cta, text } })}
                            placeholder="e.g. Visit Website" readOnly={readOnly} small />
                    </div>
                    <div>
                        <FieldLabel>Button URL</FieldLabel>
                        <FieldInput value={sections.cta.url}
                            onChange={(url) => update({ cta: { ...sections.cta, url } })}
                            placeholder="https://..." readOnly={readOnly} small />
                    </div>
                </div>
            </SectionCard>

            {/* Social Links Section */}
            <SectionCard title="Social Links" icon={Share2}
                visible={sections.socials.visible}
                onToggleVisible={() => update({ socials: { ...sections.socials, visible: !sections.socials.visible } })}
                readOnly={readOnly}>
                <div className="space-y-2.5">
                    {(['instagram', 'tiktok', 'facebook'] as const).map(key => (
                        <div key={key}>
                            <FieldLabel>{key.charAt(0).toUpperCase() + key.slice(1)} URL</FieldLabel>
                            <FieldInput value={sections.socials[key]}
                                onChange={(url) => update({ socials: { ...sections.socials, [key]: url } })}
                                placeholder={`https://${key}.com/...`} readOnly={readOnly} small />
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Footer Section */}
            <SectionCard title="Footer" icon={MessageSquare} readOnly={readOnly}>
                <FieldInput value={sections.footer.text}
                    onChange={(text) => update({ footer: { ...sections.footer, text } })}
                    placeholder="© 2026 The Lab 33" readOnly={readOnly} small />
            </SectionCard>

        </div>
    );
}
