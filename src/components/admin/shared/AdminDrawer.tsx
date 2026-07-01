"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Pencil, Trash2 } from "lucide-react";


export interface AdminDrawerProps {
    /** Controls visibility */
    isOpen: boolean;
    /** Called when the drawer should close (backdrop click, X button, Cancel) */
    onClose: () => void;
    /** Small uppercase label above the title (e.g. "New Position", "Edit User") */
    subtitle?: string;
    /** Main heading text */
    title: string;
    /** Drawer body content — rendered inside a scrollable container */
    children: ReactNode;
    /** Primary action label (e.g. "Create", "Update", "Invite") */
    saveLabel?: string;
    /** Called when the primary action button is clicked */
    onSave?: () => void;
    /** Disables the save button and shows a spinner */
    isSaving?: boolean;
    /** Prevents closing while a save is in progress */
    preventCloseWhileSaving?: boolean;
    /** Width of the drawer panel. Default: "560px" */
    width?: string;
    /** Max width of the drawer panel */
    maxWidth?: string;
    /** Optional footer content — replaces the default Cancel + Save footer */
    footer?: ReactNode;
    /** Optional extra class names for the scrollable body */
    bodyClassName?: string;
    /** Optional action buttons rendered in the header row (before the close button) */
    headerActions?: ReactNode;
    /** When true, headerActions takes over the full header — hides title, subtitle, and all buttons */
    headerFullWidth?: boolean;

    /* ── View / Edit mode support ── */
    /** When true, the drawer is in read-only view mode (hides footer, shows edit button) */
    viewMode?: boolean;
    /** Callback for the edit button shown in view mode */
    onEditClick?: () => void;
    /** Callback for the delete button shown in header when provided */
    onDeleteClick?: () => void;
    /** When true, children are rendered without the default body padding/overflow wrapper */
    rawBody?: boolean;
    /** When true, body doesn't stretch — content hugs top, footer hugs bottom */
    compact?: boolean;
}

export function AdminDrawer({
    isOpen,
    onClose,
    subtitle,
    title,
    children,
    saveLabel = "Save",
    onSave,
    isSaving = false,
    preventCloseWhileSaving = true,
    width = "560px",
    maxWidth,
    footer,
    bodyClassName,
    headerActions,
    headerFullWidth = false,
    viewMode = false,
    onEditClick,
    onDeleteClick,
    rawBody = false,
    compact = false,
}: AdminDrawerProps) {
    const handleClose = () => {
        if (preventCloseWhileSaving && isSaving) return;
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[200]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.9 }}
                        className="fixed right-0 top-0 bottom-0 z-[201] flex flex-col"
                        style={{ width, maxWidth }}
                    >
                        <div className="absolute inset-0 bg-[var(--surface-low)] border-l border-[var(--border-medium)]" />

                        {/* Gold accent strip at top */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-gold)]/60 to-transparent" />

                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/[0.03] rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative flex flex-col h-full">

                            <div className="shrink-0 px-6 py-4 border-b border-[var(--border-subtle)]">
                                {headerFullWidth ? (
                                    <div className="flex items-center justify-between w-full min-h-[44px]">
                                        {headerActions}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: Title Block */}
                                        <div className="min-w-0 flex-1">
                                            {subtitle && (
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-gold)]/80 mb-0.5">
                                                    {subtitle}
                                                </p>
                                            )}
                                            <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate leading-tight">
                                                {title}
                                            </h3>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {headerActions}

                                            {/* Edit (view mode) */}
                                            {viewMode && onEditClick && (
                                                <IconButton
                                                    onClick={onEditClick}
                                                    title="Edit"
                                                    variant="default"
                                                >
                                                    <Pencil size={15} />
                                                </IconButton>
                                            )}

                                            {/* Delete */}
                                            {onDeleteClick && (
                                                <IconButton
                                                    onClick={onDeleteClick}
                                                    title="Delete"
                                                    variant="danger"
                                                >
                                                    <Trash2 size={15} />
                                                </IconButton>
                                            )}

                                            {/* Close */}
                                            <IconButton
                                                onClick={handleClose}
                                                title="Close"
                                                variant="close"
                                            >
                                                <X size={15} />
                                            </IconButton>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {rawBody ? (
                                <div className="flex-1 min-h-0 flex flex-col">
                                    {children}
                                </div>
                            ) : (
                                <div className={`${compact ? '' : 'flex-1'} overflow-y-auto no-scrollbar px-6 py-6 ${bodyClassName || 'space-y-5'}`}>
                                    {children}
                                </div>
                            )}
                            {compact && <div className="flex-1" />}

                            {footer !== undefined ? footer : (
                                !viewMode && (
                                    <div className="shrink-0 px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="h-10 px-5 rounded-xl text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-mid)] transition-all duration-150"
                                        >
                                            Cancel
                                        </button>
                                        {onSave && (
                                            <button
                                                onClick={onSave}
                                                disabled={isSaving}
                                                className="h-10 px-6 rounded-xl bg-[var(--accent-gold)] text-white text-[12px] font-bold uppercase tracking-[0.1em] hover:brightness-110 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-[var(--accent-gold)]/20"
                                            >
                                                {isSaving && <Loader2 size={14} className="animate-spin" />}
                                                {saveLabel}
                                            </button>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


function IconButton({
    children,
    onClick,
    title,
    variant = 'default',
}: {
    children: ReactNode;
    onClick: () => void;
    title: string;
    variant?: 'default' | 'danger' | 'close';
}) {
    const styles = {
        default: 'text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/8',
        danger: 'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/8',
        close: 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-mid)]',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${styles[variant]}`}
        >
            {children}
        </button>
    );
}
