'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Users,
    Trash2,
    Eye,
    FileText,
    User,
    Briefcase,
    Clock,
    CheckCircle,
    Archive,
    XCircle,
    Star,
    Search,
} from 'lucide-react';
import { PaginationFooter } from '@/components/admin/shared/PaginationFooter';
import { AdminLoader } from '@/components/admin/shared/AdminLoader';
import { getCountryByName, formatNationality, calculateAge } from '@/components/admin/shared/utils/helpers';
import { format, parseISO } from 'date-fns';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import type { Applicant } from '../types';

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; border: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pending' },
    reviewed: { icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Reviewed' },
    shortlisted: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Shortlisted' },
    rejected: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Rejected' },
    archived: { icon: Archive, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', label: 'Archived' },
    hired: { icon: Star, color: 'text-[var(--accent-gold)]', bg: 'bg-[var(--accent-gold)]/10', border: 'border-[var(--accent-gold)]/30', label: 'Hired' },
};

interface ApplicationsListViewProps {
    applicants: Applicant[];
    onView: (applicant: Applicant) => void;
    onStatusChange: (id: string, newStatus: Applicant['status']) => void;
    onDelete: (id: string) => void;
    onBulkDelete?: (ids: string[]) => void;
    totalApplicants: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    selectedRows: string[];
    setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ApplicationsListView({
    applicants,
    onView,
    onStatusChange,
    onDelete,
    onBulkDelete,
    totalApplicants,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    isLoading,
    selectedRows,
    setSelectedRows
}: ApplicationsListViewProps) {
    const [columnWidths, setColumnWidths] = useState({
        checkbox: 60,
        firstName: 170,
        lastName: 150,
        position: 160,
        nationality: 130,
        age: 120,
        status: 140,
        date: 130,
        actions: 140
    });
    const [resizing, setResizing] = useState<string | null>(null);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);

    const handleResizeStart = (e: React.MouseEvent, column: string) => {
        setResizing(column);
        setStartX(e.clientX);
        setStartWidth(columnWidths[column as keyof typeof columnWidths]);
        e.preventDefault();
    };

    const handleResizeMove = (e: MouseEvent) => {
        if (!resizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(80, startWidth + diff);
        setColumnWidths(prev => ({
            ...prev,
            [resizing]: newWidth
        }));
    };

    const handleResizeEnd = () => {
        setResizing(null);
    };

    useEffect(() => {
        if (resizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resizing]);

    // Multi-select handlers
    const handleSelectAll = () => {
        const isAllOnPageSelected = applicants.length > 0 && applicants.every(a => selectedRows.includes(a.id));
        if (isAllOnPageSelected) {
            const pageIds = new Set(applicants.map(a => a.id));
            setSelectedRows(prev => prev.filter(id => !pageIds.has(id)));
        } else {
            const pageIds = applicants.map(a => a.id);
            setSelectedRows(prev => {
                const newSelection = [...prev];
                pageIds.forEach(id => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id);
                    }
                });
                return newSelection;
            });
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) return;
        if (onBulkDelete) {
            onBulkDelete([...selectedRows]);
        } else {
            selectedRows.forEach(id => onDelete(id));
        }
        setSelectedRows([]);
    };

    // Indeterminate checkbox state
    const selectAllRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (selectAllRef.current) {
            const someOnPage = applicants.some(a => selectedRows.includes(a.id));
            const allOnPage = applicants.length > 0 && applicants.every(a => selectedRows.includes(a.id));
            selectAllRef.current.indeterminate = someOnPage && !allOnPage;
        }
    }, [selectedRows, applicants]);

    return (
        <div className="mt-10 px-4">
            <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                {/* Decorative gold accent line at top */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-[var(--accent-gold)]/10" />

                <div className="flex-1 overflow-hidden">
                    <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr className="border-b border-[var(--border-medium)]">
                                <th className="px-6 py-5" style={{ width: `${columnWidths.checkbox}px` }}>
                                    <input ref={selectAllRef} type="checkbox" checked={applicants.length > 0 && applicants.every(a => selectedRows.includes(a.id))} onChange={handleSelectAll} className="w-4 h-4 rounded border-2 border-[var(--accent-gold)]/30 bg-[var(--surface-high)] checked:bg-[var(--accent-gold)] checked:border-[var(--accent-gold)] cursor-pointer accent-[var(--accent-gold)]" />
                                </th>
                                <th className="px-8 py-5 relative" style={{ width: `${columnWidths.firstName}px` }}>
                                    <span className="text-[var(--accent-gold)] text-[9px] tracking-[0.25em] font-bold uppercase">First Name</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'firstName')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-6 py-5 relative" style={{ width: `${columnWidths.lastName}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Last Name</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'lastName')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-6 py-5 relative" style={{ width: `${columnWidths.position}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Position</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'position')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-6 py-5 relative" style={{ width: `${columnWidths.nationality}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Nationality</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'nationality')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-6 py-5 relative" style={{ width: `${columnWidths.age}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">DOB / Age</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'age')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-6 py-5 relative" style={{ width: `${columnWidths.status}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Status</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'status')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-6 py-5 relative" style={{ width: `${columnWidths.date}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Applied</span>
                                    <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-gold)]/20 transition-colors group" onMouseDown={(e) => handleResizeStart(e, 'date')}><div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-gold)]/40 transition-colors" /></div>
                                </th>
                                <th className="px-8 py-5 text-right" style={{ width: `${columnWidths.actions}px` }}>
                                    <span className="text-[var(--accent-gold)]/70 text-[9px] tracking-[0.25em] font-bold uppercase">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-8 text-center">
                                        <div className="flex items-center justify-center py-32">
                                            <AdminLoader title="Applications" subtitle="Loading applicant profiles..." />
                                        </div>
                                    </td>
                                </tr>
                            ) : applicants.length === 0 ? (
                                <EmptyState
                                    variant="table-row"
                                    colSpan={9}
                                    icon={<Users size={36} className="text-[var(--text-secondary)]/20" />}
                                    title="No Applicants Found"
                                    description="Applicants will appear here when submitted"
                                />
                            ) : (
                                <>
                                    {applicants.map((applicant, index) => {
                                        const statusConfig = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.pending;
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <tr
                                                key={applicant.id}
                                                onClick={() => onView(applicant)}
                                                className={`group transition-colors duration-200 h-[72px] hover:bg-[var(--accent-gold)]/[0.02] cursor-pointer ${index !== applicants.length - 1 ? 'border-b border-[var(--border-medium)]' : ''
                                                    }`}
                                            >
                                                {/* Checkbox Column */}
                                                <td className="px-6 align-middle" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(applicant.id)}
                                                        onChange={() => handleSelectRow(applicant.id)}
                                                        className="w-4 h-4 rounded border-2 border-[var(--accent-gold)]/30 bg-[var(--surface-high)] checked:bg-[var(--accent-gold)] checked:border-[var(--accent-gold)] cursor-pointer accent-[var(--accent-gold)]"
                                                    />
                                                </td>
                                                {/* First Name */}
                                                <td className="px-8 align-middle">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border-subtle)]">
                                                            <User size={14} className="text-[var(--accent-gold)]" />
                                                        </div>
                                                        <p className="text-[15px] text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-gold)] transition-colors truncate">{applicant.first_name}</p>
                                                    </div>
                                                </td>
                                                {/* Last Name */}
                                                <td className="px-6 align-middle">
                                                    <p className="text-[15px] text-[var(--text-primary)] font-medium truncate">{applicant.last_name}</p>
                                                </td>
                                                {/* Position */}
                                                <td className="px-6 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase size={14} className="text-[var(--text-secondary)]/40" />
                                                        <span className="text-[13px] text-[var(--text-secondary)] truncate">{applicant.position_title}</span>
                                                    </div>
                                                </td>
                                                {/* Nationality */}
                                                <td className="px-6 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        {applicant.nationality && getCountryByName(applicant.nationality) && (
                                                            <Image
                                                                src={getCountryByName(applicant.nationality)?.flag || ''}
                                                                alt=""
                                                                width={16}
                                                                height={10}
                                                                className="w-4 h-2.5 object-cover rounded-sm border border-[var(--border-subtle)]"
                                                            />
                                                        )}
                                                        <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-medium">
                                                            {applicant.nationality ? formatNationality(applicant.nationality) : '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* DOB / Age */}
                                                <td className="px-6 align-middle">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">
                                                            {applicant.birthdate ? format(parseISO(applicant.birthdate), 'MMM d, yyyy') : '—'}
                                                        </p>
                                                        {applicant.birthdate && (
                                                            <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">{calculateAge(applicant.birthdate)} yrs old</p>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 align-middle">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <StatusIcon size={12} className={statusConfig.color} />
                                                        <span className={`text-[12px] font-bold uppercase tracking-wider ${statusConfig.color}`}>{statusConfig.label}</span>
                                                    </div>
                                                </td>
                                                {/* Date Applied */}
                                                <td className="px-6 align-middle">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[13px] text-[var(--text-primary)]/80 font-medium">
                                                            {new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[10px] text-[var(--text-secondary)]/40 uppercase tracking-[0.15em]">
                                                            {new Date(applicant.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </td>
                                                {/* Actions */}
                                                <td className="px-8 align-middle">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* View */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onView(applicant); }}
                                                            title="View"
                                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        {/* CV Link */}
                                                        {applicant.cv_filename && (
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-documents/${applicant.cv_filename}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="View CV"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <FileText size={14} />
                                                            </a>
                                                        )}
                                                        {/* Shortlist */}
                                                        {applicant.status !== 'shortlisted' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onStatusChange(applicant.id, 'shortlisted'); }}
                                                                title="Shortlist"
                                                                className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-emerald-500/80 hover:bg-emerald-500/5 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        )}
                                                        {/* Archive */}
                                                        {applicant.status !== 'archived' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onStatusChange(applicant.id, 'archived'); }}
                                                                title="Archive"
                                                                className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-zinc-400 hover:bg-zinc-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Archive size={14} />
                                                            </button>
                                                        )}
                                                        {/* Delete */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete(applicant.id); }}
                                                            title="Delete"
                                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Filler Rows */}
                                    {applicants.length < itemsPerPage && (
                                        Array.from({ length: itemsPerPage - applicants.length }).map((_, i) => (
                                            <tr key={`filler-${i}`} className="h-[72px]">
                                                <td colSpan={9}></td>
                                            </tr>
                                        ))
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <PaginationFooter
                    totalRecords={totalApplicants}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                    selectedCount={selectedRows.length}
                    onDeleteSelected={handleBulkDelete}
                    deleteLabel={`Delete ${selectedRows.length} ${selectedRows.length === 1 ? 'Applicant' : 'Applicants'}`}
                />
            </div>
        </div>
    );
}
