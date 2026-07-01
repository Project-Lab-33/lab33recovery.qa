"use client";

import React from "react";

import { motion, AnimatePresence } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChevronLeft, ChevronRight, Clock, Calendar, X, AlertTriangle } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, subDays, addDays, setMonth, setYear } from "date-fns";

interface DateTimePickerProps {
    value: string | null | undefined;
    onChange: (value: string) => void;
    readOnly?: boolean;
    disabled?: boolean;
    dateOnly?: boolean; // When true, hides time selection
    /** Custom label shown above the date display (defaults to "Birthdate" for dateOnly, "Scheduling Hub" otherwise) */
    label?: string;
    /** Custom placeholder when no value is set (defaults to "Select Date" for dateOnly, "Assign Date & Time" otherwise) */
    placeholder?: string;
}

export function DateTimePicker({ value, onChange, readOnly, disabled, dateOnly, label, placeholder }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<'days' | 'months' | 'years'>('days');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

    // Get current Qatar time (UTC+3)
    const getQatarTime = () => {
        const now = new Date();
        // Convert to Qatar time (UTC+3)
        const qatarTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Qatar' }));
        return qatarTime;
    };

    const [selectedDate, setSelectedDate] = useState<Date>(value ? parseISO(value) : getQatarTime());
    const [viewDate, setViewDate] = useState<Date>(value ? parseISO(value) : getQatarTime());
    const [selectedTime, setSelectedTime] = useState({
        hours: value ? parseISO(value).getHours() : getQatarTime().getHours(),
        minutes: value ? parseISO(value).getMinutes() : getQatarTime().getMinutes()
    });

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Fill in the calendar grid with actual dates from prev/next months
    const firstDayOfWeek = monthStart.getDay();
    const prevMonthDays: Date[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push(subDays(monthStart, i + 1));
    }
    const calendarDays: Date[] = [
        ...prevMonthDays,
        ...daysInMonth
    ];

    // Fill remaining slots with next month days
    let nextDay = 1;
    while (calendarDays.length < 42) {
        calendarDays.push(addDays(monthEnd, nextDay));
        nextDay++;
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        const newDateTime = new Date(date);
        newDateTime.setHours(selectedTime.hours);
        newDateTime.setMinutes(selectedTime.minutes);
        onChange(format(newDateTime, "yyyy-MM-dd'T'HH:mm"));
        if (pickerMode !== 'days') setPickerMode('days');
    };

    const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
        const newTime = { ...selectedTime, [type]: value };
        setSelectedTime(newTime);

        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(newTime.hours);
        newDateTime.setMinutes(newTime.minutes);
        onChange(format(newDateTime, "yyyy-MM-dd'T'HH:mm"));
    };

    const handleClear = () => {
        onChange('');
        setIsOpen(false);
    };

    const displayValue = value ? format(parseISO(value), dateOnly ? "MMM d, yyyy" : "MMM d, yyyy 'at' HH:mm") : "";
    const isDisabled = readOnly || disabled;

    // Position popup below the trigger
    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const POPUP_H = dateOnly ? 440 : 560;
        const POPUP_W = 380;
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const placeAbove = spaceBelow < POPUP_H && rect.top > POPUP_H;
        const left = Math.min(rect.left, window.innerWidth - POPUP_W - 8);
        setPopupStyle({
            top: placeAbove ? rect.top - POPUP_H - 4 : rect.bottom + 4,
            left: Math.max(8, left),
            width: POPUP_W,
        });
    }, [isOpen, dateOnly]);

    return (
        <div className="relative font-[family-name:var(--font-inter)]">
            {/* Input Display */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => !isDisabled && setIsOpen(true)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-5 py-3 bg-[var(--surface-high)]/30 border rounded-2xl text-left transition-colors duration-300 ${isDisabled
                    ? 'cursor-default opacity-50'
                    : 'hover:border-[var(--accent-gold)]/50 hover:bg-[var(--surface-high)]/50 cursor-pointer border-[var(--border-subtle)]/50'
                    }`}
            >
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 flex items-center justify-center border border-[var(--accent-gold)]/20 shadow-sm shadow-[var(--accent-gold)]/5">
                    <Calendar size={14} className="text-[var(--accent-gold)]" />
                </div>
                <div className="flex flex-col">
                    {(label || (!dateOnly && !label)) && (
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-0.5">{label || 'Scheduling Hub'}</span>
                    )}
                    <span className={`text-sm tracking-tight ${value ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]/40 font-medium'}`}>
                        {value ? displayValue : placeholder || (dateOnly ? "Select Date" : "Assign Date & Time")}
                    </span>
                </div>
            </button>

            {/* Calendar Popup */}
            {isOpen && createPortal(
                <AnimatePresence mode="wait">
                    <div className="fixed inset-0 z-[200] pointer-events-none font-[family-name:var(--font-inter)]">
                        {/* Full-screen blur backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 pointer-events-auto"
                        />

                        {/* Popup anchored below trigger */}
                        <div
                            className="fixed pointer-events-none"
                            style={popupStyle}
                        >

                            {/* Picker Modal Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-[380px] z-[1] pointer-events-auto overflow-hidden rounded-3xl"
                            >
                                {/* Premium Glass Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-mid)] to-[var(--surface-low)] border border-[var(--accent-gold)]/15 shadow-[0_24px_80px_-20px_rgba(180,140,80,0.25)]" />

                                {/* Ambient Glow Orbs */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-gold)]/5 rounded-full blur-[80px] pointer-events-none" />
                                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

                                {/* Modal Content */}
                                <div className="relative">
                                    {/* Header / Navigation */}
                                    <div className="px-6 py-5 border-b border-[var(--border-subtle)]/30 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (pickerMode === 'days') setViewDate(subMonths(viewDate, 1));
                                                else if (pickerMode === 'years') setViewDate(setYear(viewDate, viewDate.getFullYear() - 20));
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[var(--accent-gold)]/60 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 hover:border-[var(--accent-gold)]/20 transition-colors active:scale-95"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-high)]/60 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
                                            <button
                                                type="button"
                                                onClick={() => setPickerMode(pickerMode === 'months' ? 'days' : 'months')}
                                                className={`text-sm font-serif tracking-wide px-3 py-1 rounded-xl transition-colors ${pickerMode === 'months' ? 'text-[var(--accent-gold)] bg-[var(--accent-gold)]/15 shadow-sm' : 'text-[var(--text-primary)] hover:text-[var(--accent-gold)]'}`}
                                            >
                                                {format(viewDate, "MMMM")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPickerMode(pickerMode === 'years' ? 'days' : 'years')}
                                                className={`text-sm font-serif tracking-wide px-3 py-1 rounded-xl transition-colors ${pickerMode === 'years' ? 'text-[var(--accent-gold)] bg-[var(--accent-gold)]/15 shadow-sm' : 'text-[var(--text-primary)] hover:text-[var(--accent-gold)]'}`}
                                            >
                                                {format(viewDate, "yyyy")}
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (pickerMode === 'days') setViewDate(addMonths(viewDate, 1));
                                                else if (pickerMode === 'years') setViewDate(setYear(viewDate, viewDate.getFullYear() + 20));
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-high)]/60 border border-[var(--border-subtle)] text-[var(--accent-gold)]/60 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 hover:border-[var(--accent-gold)]/20 transition-colors active:scale-95"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    {/* Main Interaction Area */}
                                    <div className="p-6 h-[300px] flex flex-col justify-center">
                                        <AnimatePresence mode="wait">
                                            {pickerMode === 'days' && (
                                                <motion.div
                                                    key="days"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="w-full"
                                                >
                                                    {/* Weekday Strip */}
                                                    <div className="grid grid-cols-7 gap-1 mb-3">
                                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                            <div key={day} className="text-center text-[8px] text-[var(--text-secondary)]/30 uppercase tracking-[0.2em] font-bold py-1">
                                                                {day}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Grid of Days */}
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                                                        {calendarDays.map((day, idx) => {
                                                            const isSelected = isSameDay(day, selectedDate);
                                                            const isCurrentMonth = isSameMonth(day, viewDate);
                                                            const isTodayDay = isToday(day);

                                                            return (
                                                                <motion.button
                                                                    key={day.toISOString()}
                                                                    type="button"
                                                                    onClick={() => handleDateSelect(day)}
                                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className={`
                                                                aspect-square rounded-full text-sm font-bold transition-colors relative flex items-center justify-center
                                                                ${isSelected
                                                                            ? 'bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white shadow-lg shadow-[var(--accent-gold)]/30 z-10'
                                                                            : isTodayDay
                                                                                ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                                                                                : isCurrentMonth
                                                                                    ? 'text-[var(--text-primary)]'
                                                                                    : 'text-[var(--text-secondary)]/15 font-normal'
                                                                        }
                                                            `}
                                                                >
                                                                    {format(day, 'd')}
                                                                    {isSelected && (
                                                                        <motion.div
                                                                            layoutId="day-outline"
                                                                            className="absolute inset-[1px] rounded-full border border-[var(--border-medium)] pointer-events-none"
                                                                        />
                                                                    )}
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {pickerMode === 'months' && (
                                                <motion.div
                                                    key="months"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="h-full flex items-center justify-center w-full"
                                                >
                                                    <div className="grid grid-cols-3 gap-2 w-full">
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const isSelected = viewDate.getMonth() === i;
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setViewDate(setMonth(viewDate, i));
                                                                        setPickerMode('days');
                                                                    }}
                                                                    className={`py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border ${isSelected
                                                                        ? 'bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-lg shadow-[var(--accent-gold)]/20'
                                                                        : 'bg-[var(--surface-high)]/60 border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-high)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]'
                                                                        }`}
                                                                >
                                                                    {format(setMonth(new Date(), i), 'MMM')}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {pickerMode === 'years' && (
                                                <motion.div
                                                    key="years"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="h-full flex items-center justify-center w-full"
                                                >
                                                    <div className="grid grid-cols-4 gap-2 w-full">
                                                        {Array.from({ length: 20 }, (_, i) => {
                                                            const year = viewDate.getFullYear() - 9 + i;
                                                            const isSelected = viewDate.getFullYear() === year;
                                                            const isCurrent = new Date().getFullYear() === year;
                                                            return (
                                                                <button
                                                                    key={year}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setViewDate(setYear(viewDate, year));
                                                                        setPickerMode('months');
                                                                    }}
                                                                    className={`py-3 rounded-xl text-[10px] font-bold tracking-widest transition-colors border ${isSelected
                                                                        ? 'bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white border-[var(--accent-gold)] shadow-lg shadow-[var(--accent-gold)]/20'
                                                                        : isCurrent
                                                                            ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                                                                            : 'bg-[var(--surface-high)]/60 border-transparent text-[var(--text-secondary)]/60 hover:bg-[var(--surface-high)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]'
                                                                        }`}
                                                                >
                                                                    {year}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Temporal Hub (Time Section) */}
                                    {!dateOnly && (
                                        <div className="px-6 py-5 border-t border-[var(--border-subtle)]/30 bg-[var(--surface-high)]/30">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-4 bg-[var(--accent-gold)] rounded-full" />
                                                <span className="text-[10px] text-[var(--accent-gold)] uppercase tracking-[0.3em] font-bold">Temporal Focus</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Technical Inputs */}
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Hour</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="12"
                                                            value={selectedTime.hours === 0 ? 12 : selectedTime.hours > 12 ? selectedTime.hours - 12 : selectedTime.hours}
                                                            onChange={(e) => {
                                                                const hour12 = parseInt(e.target.value) || 1;
                                                                const isPM = selectedTime.hours >= 12;
                                                                let hour24 = hour12;
                                                                if (isPM && hour12 !== 12) hour24 = hour12 + 12;
                                                                else if (!isPM && hour12 === 12) hour24 = 0;
                                                                handleTimeChange('hours', hour24);
                                                            }}
                                                            className="w-full bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--accent-gold)]/40 hover:bg-[var(--surface-high)]/60 transition-colors text-center"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Minute</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={selectedTime.minutes.toString().padStart(2, '0')}
                                                            onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--accent-gold)]/40 hover:bg-[var(--surface-high)]/60 transition-colors text-center"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Period Selection */}
                                                <div className="flex flex-col gap-1.5 p-1 bg-[var(--surface-high)]/60 rounded-xl border border-[var(--border-subtle)]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newHour = selectedTime.hours >= 12 ? selectedTime.hours - 12 : selectedTime.hours;
                                                            handleTimeChange('hours', newHour);
                                                        }}
                                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${selectedTime.hours < 12
                                                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white shadow-md'
                                                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                                            }`}
                                                    >
                                                        AM
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newHour = selectedTime.hours < 12 ? selectedTime.hours + 12 : selectedTime.hours;
                                                            handleTimeChange('hours', newHour);
                                                        }}
                                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${selectedTime.hours >= 12
                                                            ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white shadow-md'
                                                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                                            }`}
                                                    >
                                                        PM
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Protocol Actions */}
                                    <div className="p-6 border-t border-[var(--border-subtle)]/30 flex items-center justify-between gap-4 bg-[var(--surface-high)]/5">
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="h-11 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                                        >
                                            Discard
                                        </button>
                                        <div className="flex-1 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="w-full h-11 px-8 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-white text-[11px] font-extra-bold uppercase tracking-[0.3em] shadow-lg shadow-[var(--accent-gold)]/20 hover:shadow-[var(--accent-gold)]/40 hover:scale-[1.02] active:scale-[0.98] transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
