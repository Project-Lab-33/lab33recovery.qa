'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import Image from 'next/image';
import {
    Clock,
    CheckCircle,
    Archive,
    Eye,
    FileText,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    User,
    Trash2,
    GripVertical,
    XCircle,
    Star,
} from 'lucide-react';
import { getCountryByName, formatNationality, calculateAge } from '@/components/admin/shared/utils/helpers';
import { GenderIcon } from '@/components/admin/shared/GenderIcon';
import type { Applicant } from '../types';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
    pointerWithin,
    MeasuringStrategy,
} from '@dnd-kit/core';


const APPROVAL_COLUMNS = [
    {
        id: 'pending',
        label: 'Review Required',
        icon: Clock,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30'
    },
    {
        id: 'shortlisted',
        label: 'Shortlisted',
        icon: CheckCircle,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30'
    },
    {
        id: 'hired',
        label: 'Hired',
        icon: Star,
        color: 'text-[var(--accent-gold)]',
        bgColor: 'bg-[var(--accent-gold)]/10',
        borderColor: 'border-[var(--accent-gold)]/30'
    },
    {
        id: 'rejected',
        label: 'Rejected',
        icon: XCircle,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30'
    },
    {
        id: 'archived',
        label: 'Archived',
        icon: Archive,
        color: 'text-zinc-400',
        bgColor: 'bg-zinc-500/10',
        borderColor: 'border-zinc-500/30'
    },
];

// Measure droppable columns only once before dragging starts
const MEASURING_CONFIG = {
    droppable: {
        strategy: MeasuringStrategy.BeforeDragging,
    },
};

interface ApplicationsApprovalViewProps {
    applicants: Applicant[];
    onView: (applicant: Applicant) => void;
    onStatusChange: (id: string, newStatus: Applicant['status']) => void;
    onDelete: (id: string) => void;
    canDelete?: boolean;
    canUpdate?: boolean;
}

export default function ApplicationsApprovalView({
    applicants,
    onView,
    onStatusChange,
    onDelete,
    canDelete = true,
    canUpdate = true,
}: ApplicationsApprovalViewProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const activeApplicant = applicants.find(a => a.id === activeId);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    // Group applicants by status — memoized to avoid recalc during drag
    const groupedApplicants = useMemo(() =>
        APPROVAL_COLUMNS.reduce((acc, column) => {
            acc[column.id] = applicants.filter(a => a.status === column.id);
            return acc;
        }, {} as Record<string, Applicant[]>),
        [applicants]
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const applicantId = active.id as string;
        const newStatus = over.id as Applicant['status'];

        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant || applicant.status === newStatus) return;

        onStatusChange(applicantId, newStatus);
    }, [applicants, onStatusChange]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    return (
        <div className="relative">
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                measuring={MEASURING_CONFIG}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="px-4">
                    <div className="pipeline-container">
                        <div className="grid grid-cols-5 gap-4 h-full">
                            {APPROVAL_COLUMNS.map((column) => {
                                const columnApplicants = groupedApplicants[column.id] || [];

                                return (
                                    <DroppableColumn
                                        key={column.id}
                                        column={column}
                                        applicants={columnApplicants}
                                        isDragging={activeId !== null}
                                        onView={onView}
                                        onStatusChange={onStatusChange}
                                        onDelete={onDelete}
                                        canDelete={canDelete}
                                        canUpdate={canUpdate}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Drag Overlay — no drop animation for instant feedback */}
                <DragOverlay dropAnimation={null}>
                    {activeApplicant ? (
                        <div className="opacity-90">
                            <DragPreviewCard applicant={activeApplicant} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

// Droppable Column
// Wrapped in React.memo so it only re-renders when its own props change,
// not when DndContext's internal state updates.

const DroppableColumn = memo(function DroppableColumn({
    column,
    applicants,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isDragging,
    onView,
    onStatusChange,
    onDelete,
    canDelete,
    canUpdate,
}: {
    column: typeof APPROVAL_COLUMNS[0];
    applicants: Applicant[];
    isDragging: boolean;
    onView: (applicant: Applicant) => void;
    onStatusChange: (id: string, newStatus: Applicant['status']) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
    canUpdate: boolean;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const ColumnIcon = column.icon;

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col overflow-hidden transition-colors duration-300 ${isOver ? 'bg-[var(--accent-gold)]/[0.03]' : ''}`}
        >
            {/* Column Header */}
            <div className={`group relative px-5 py-4 border-b border-[var(--border-subtle)]/10 bg-[var(--surface-high)]/10`}>
                <div className={`absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    style={{ background: `linear-gradient(to right, transparent, var(--accent-gold), transparent)` }}
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center transition-colors duration-300 group-hover:scale-110">
                            <ColumnIcon size={16} className={column.color} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                            {column.label}
                        </span>
                    </div>
                    <div className="flex items-center justify-center">
                        <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)]">
                            {applicants.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Column Content */}
            <div className="relative flex-1 overflow-hidden">
                <div
                    className="pipeline-scrollbar h-full overflow-y-auto p-3 space-y-3 pb-16"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.2) 88%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.2) 88%, transparent 100%)',
                    }}
                >
                    {applicants.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--surface-high)] to-[var(--surface-mid)] flex items-center justify-center border border-[var(--border-subtle)] shadow-inner mb-4">
                                <ColumnIcon size={24} className="text-[var(--text-secondary)]/20" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] text-[var(--text-primary)] font-medium">
                                    {isOver ? 'Drop here' : 'No Applicants'}
                                </p>
                                <p className="text-[9px] text-[var(--text-secondary)]/30 uppercase tracking-[0.2em]">
                                    {column.label} Column Empty
                                </p>
                            </div>
                        </div>
                    ) : (
                        applicants.map((applicant) => (
                            <ApplicantCard
                                key={applicant.id}
                                applicant={applicant}
                                onView={onView}
                                onStatusChange={onStatusChange}
                                onDelete={onDelete}
                                canDelete={canDelete}
                                canUpdate={canUpdate}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
});

// Applicant Card with Drag Handle
// useDraggable is ONLY on the grip handle, not the whole card.
// This means React doesn't recompute the entire card on drag state changes.

const ApplicantCard = memo(function ApplicantCard({
    applicant,
    onView,
    onStatusChange,
    onDelete,
    canDelete,
    canUpdate,
}: {
    applicant: Applicant;
    onView: (applicant: Applicant) => void;
    onStatusChange: (id: string, newStatus: Applicant['status']) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
    canUpdate: boolean;
}) {
    return (
        <div
            className="group relative bg-transparent border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--accent-gold)]/40 transition-colors duration-300 flex flex-col min-h-[180px]"
        >
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)]">
                        <GenderIcon gender={applicant.gender || ''} />
                    </div>
                    <span className="text-[11px] text-[var(--text-primary)]/80 font-medium uppercase tracking-wider">{applicant.position_title.length > 20 ? applicant.position_title.substring(0, 20) + '...' : applicant.position_title}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                    {/* Drag Handle — only this element tracks drag state */}
                    {canUpdate && <DragHandle id={applicant.id} />}
                    <button
                        onClick={() => onView(applicant)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-high)]/50 border border-[var(--border-subtle)]/30 text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors flex items-center justify-center"
                        title="View"
                    >
                        <Eye size={13} />
                    </button>
                    {applicant.cv_filename && (
                        <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-documents/${applicant.cv_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-[var(--surface-high)]/50 border border-[var(--border-subtle)]/30 text-[var(--text-secondary)]/50 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors flex items-center justify-center"
                            title="View CV"
                        >
                            <FileText size={13} />
                        </a>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(applicant.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                            title="Delete"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                    <h3
                        className="font-serif text-[var(--text-primary)] text-base line-clamp-2 leading-snug group-hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                        onClick={() => onView(applicant)}
                    >
                        {applicant.first_name} {applicant.last_name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]/60 line-clamp-1 leading-relaxed">{applicant.email}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 mt-auto">
                    <div className="flex items-center gap-3">
                        {applicant.nationality && (
                            <div className="flex items-center gap-1.5">
                                {getCountryByName(applicant.nationality) && (
                                    <Image src={getCountryByName(applicant.nationality)?.flag || ''} alt="" width={16} height={10} className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-subtle)]" />
                                )}
                                <span className="text-[11px] text-[var(--text-secondary)]/40">{formatNationality(applicant.nationality)}</span>
                            </div>
                        )}
                        {applicant.birthdate && (
                            <span className="text-[11px] text-[var(--text-secondary)]/40">Age {calculateAge(applicant.birthdate)}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]/60 font-mono ml-auto">
                        <Clock size={12} className="text-[var(--accent-gold)]/50" />
                        <span>{new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Quick Status Actions for Pending Items */}
            {applicant.status === 'pending' && (
                <div className="flex items-center border-t border-[var(--border-subtle)]/20">
                    <button
                        onClick={() => onStatusChange(applicant.id, 'shortlisted')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-5 text-[var(--text-primary)] hover:bg-emerald-500/10 transition-colors border-r border-[var(--border-subtle)]/20"
                    >
                        <CheckCircle size={14} className="text-emerald-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Shortlist</span>
                    </button>
                    <button
                        onClick={() => onStatusChange(applicant.id, 'archived')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-5 text-[var(--text-primary)] hover:bg-zinc-500/10 transition-colors"
                    >
                        <Archive size={14} className="text-zinc-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Archive</span>
                    </button>
                </div>
            )}

            {/* Restore for Archived */}
            {applicant.status === 'archived' && (
                <div className="border-t border-[var(--border-subtle)]/20">
                    <button
                        onClick={() => onStatusChange(applicant.id, 'pending')}
                        className="w-full flex items-center justify-center gap-2 py-5 text-[var(--text-primary)] hover:bg-[var(--accent-gold)]/10 transition-colors font-medium"
                    >
                        <Clock size={14} className="text-[var(--accent-gold)]" />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Move to Review</span>
                    </button>
                </div>
            )}

            {/* Spacer for shortlisted items */}
            {applicant.status === 'shortlisted' && (
                <div className="border-t border-[var(--border-subtle)]/20 h-[54px]"></div>
            )}
        </div>
    );
});

// Drag Handle
// Isolated useDraggable: only this tiny element tracks drag transform state.
// The parent ApplicantCard never re-renders during drag movement.

function DragHandle({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`w-7 h-7 rounded-lg bg-[var(--surface-high)]/50 border border-[var(--border-subtle)]/30 text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            title="Drag to move"
            style={{ willChange: isDragging ? 'transform' : undefined }}
        >
            <GripVertical size={13} />
        </div>
    );
}

// Simple Preview Card for Drag Overlay
function DragPreviewCard({ applicant }: { applicant: Applicant }) {
    return (
        <div className="w-[260px] bg-[var(--bg-base)]/95 border border-[var(--accent-gold)]/30 rounded-xl px-4 py-3 shadow-xl">
            <h4 className="text-sm text-[var(--text-primary)] font-medium truncate">{applicant.first_name} {applicant.last_name}</h4>
            <p className="text-[11px] text-[var(--text-secondary)]/50 mt-0.5 truncate">{applicant.position_title}</p>
        </div>
    );
}
