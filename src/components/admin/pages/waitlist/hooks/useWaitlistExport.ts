import { useState, useCallback, useRef, useEffect } from "react";
import { format, parseISO, subDays, isAfter } from "date-fns";
import { formatNationality, calculateAge } from "@/components/admin/shared/utils/helpers";
import type { Subscriber } from "../types";
import {
    BRAND_GOLD,
    BRANDED_TABLE_STYLES,
    renderBrandedHeader,
    createBrandedFooter,
} from "@/components/admin/shared/utils/exportPDF";

interface UseWaitlistExportOptions {
    filteredSubscribers: Subscriber[];
    selectedRows: string[];
}

export function useWaitlistExport({ filteredSubscribers, selectedRows }: UseWaitlistExportOptions) {
    const [exportOpen, setExportOpen] = useState(false);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Close export popover on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setExportOpen(false);
            }
        };
        if (exportOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [exportOpen]);

    const getExportData = useCallback(() => {
        return selectedRows.length > 0
            ? filteredSubscribers.filter(s => selectedRows.includes(s.id))
            : filteredSubscribers;
    }, [selectedRows, filteredSubscribers]);

    const exportCSV = useCallback(() => {
        const rows = getExportData();
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Birthdate', 'Age', 'Nationality', 'Joined'];
        const csvRows = rows.map(s => [
            s.first_name || '',
            s.last_name || '',
            s.email || '',
            s.phone || '',
            s.gender || '',
            s.birthdate || '',
            calculateAge(s.birthdate) ?? '',
            formatNationality(s.nationality),
            s.created_at ? format(parseISO(s.created_at), 'yyyy-MM-dd HH:mm') : '',
        ]);
        const csv = [headers, ...csvRows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab33_waitlist_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportSuccess('csv');
        setTimeout(() => { setExportSuccess(null); setExportOpen(false); }, 1200);
    }, [getExportData]);

    const exportExcel = useCallback(() => {
        const rows = getExportData();
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Birthdate', 'Age', 'Nationality', 'Joined'];
        const tsvRows = rows.map(s => [
            s.first_name || '',
            s.last_name || '',
            s.email || '',
            s.phone || '',
            s.gender || '',
            s.birthdate || '',
            calculateAge(s.birthdate) ?? '',
            formatNationality(s.nationality),
            s.created_at ? format(parseISO(s.created_at), 'yyyy-MM-dd HH:mm') : '',
        ].join('\t'));
        const tsv = [headers.join('\t'), ...tsvRows].join('\n');
        const blob = new Blob([`\uFEFF${tsv}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab33_waitlist_${format(new Date(), 'yyyy-MM-dd')}.xls`;
        a.click();
        URL.revokeObjectURL(url);
        setExportSuccess('excel');
        setTimeout(() => { setExportSuccess(null); setExportOpen(false); }, 1200);
    }, [getExportData]);

    const exportPDF = useCallback(async () => {
        const rows = getExportData();
        if (rows.length === 0) return;
        setIsExporting(true);
        try {

            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;

            const headerEndY = await renderBrandedHeader(doc, {
                category: 'WAITLIST',
                title: 'Subscriber Export Report',
            });

            const genderCounts = rows.reduce((acc, s) => {
                const g = (s.gender || 'unknown').toLowerCase();
                acc[g] = (acc[g] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const natCounts = rows.reduce((acc, s) => {
                const n = formatNationality(s.nationality);
                acc[n] = (acc[n] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const ages = rows.map(s => calculateAge(s.birthdate)).filter((a): a is number => a !== null);
            const avgAge = ages.length > 0 ? Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length) : 0;
            const thisWeekCount = rows.filter(s => s.created_at && isAfter(parseISO(s.created_at), subDays(new Date(), 7))).length;
            const maleCount = genderCounts['male'] || 0;
            const femaleCount = genderCounts['female'] || 0;

            const dashY = headerEndY;

            doc.setFillColor(248, 247, 245);
            doc.roundedRect(14, dashY, pageWidth - 28, 28, 2, 2, 'F');

            doc.setDrawColor(230, 225, 220);
            doc.setLineWidth(0.3);
            doc.roundedRect(14, dashY, pageWidth - 28, 28, 2, 2, 'S');

            const metricWidth = (pageWidth - 28 - 15) / 4;
            const metrics = [
                { label: 'TOTAL SUBSCRIBERS', value: rows.length.toString(), color: [BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]] },
                { label: 'THIS WEEK', value: thisWeekCount.toString(), color: [100, 149, 237] },
                { label: 'AVG AGE', value: avgAge > 0 ? avgAge.toString() : '-', color: [72, 187, 120] },
                { label: 'GENDER SPLIT', value: `${maleCount}M / ${femaleCount}F`, color: [BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]] }
            ];

            metrics.forEach((metric, i) => {
                const x = 19 + i * (metricWidth + 5);
                doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(metric.value, x, dashY + 14);

                doc.setTextColor(140, 140, 140);
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.text(metric.label, x, dashY + 22);
            });

            const breakdownY = dashY + 34;

            doc.setTextColor(100, 100, 100);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.text('TOP NATIONALITIES', 14, breakdownY);

            const natColors: number[][] = [
                [BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]], [100, 149, 237], [72, 187, 120],
                [251, 191, 36], [139, 92, 246], [239, 68, 68]
            ];

            let natX = 14;
            const topNats = Object.entries(natCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
            topNats.forEach(([nat, count], i) => {
                const color = natColors[i % natColors.length];
                doc.setFillColor(color[0], color[1], color[2]);
                doc.circle(natX + 2, breakdownY + 6, 1.5, 'F');

                doc.setTextColor(80, 80, 80);
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.text(`${nat}: ${count}`, natX + 5, breakdownY + 7);
                natX += 30;
            });

            // Gender breakdown on right
            const genderX = pageWidth - 60;
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.text('GENDER', genderX, breakdownY);

            const genderColors: Record<string, number[]> = {
                'male': [100, 149, 237],
                'female': [236, 72, 153],
            };

            let gX = genderX;
            Object.entries(genderCounts).forEach(([gender, count]) => {
                const color = genderColors[gender] || [120, 120, 120];
                const label = gender.charAt(0).toUpperCase() + gender.slice(1);

                doc.setFillColor(color[0], color[1], color[2]);
                doc.circle(gX + 2, breakdownY + 6, 1.5, 'F');

                doc.setTextColor(80, 80, 80);
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.text(`${label}: ${count}`, gX + 5, breakdownY + 7);
                gX += 24;
            });

            const tableData = rows.map((s, i) => [
                (i + 1).toString(),
                `${s.first_name || ''} ${s.last_name || ''}`.trim() || '-',
                s.email || '-',
                s.phone || '-',
                s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1) : '-',
                s.birthdate ? format(parseISO(s.birthdate), 'MMM dd, yyyy') : '-',
                calculateAge(s.birthdate)?.toString() ?? '-',
                formatNationality(s.nationality),
                s.created_at ? format(parseISO(s.created_at), 'MMM dd, yyyy') : '-',
            ]);

            autoTable(doc, {
                head: [['#', 'NAME', 'EMAIL', 'PHONE', 'GENDER', 'BIRTHDATE', 'AGE', 'NATIONALITY', 'JOINED']],
                body: tableData,
                startY: breakdownY + 14,
                ...BRANDED_TABLE_STYLES,
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'wrap',
                    minCellHeight: 8
                },
                columnStyles: {
                    0: { cellWidth: 8, halign: 'center' },
                    1: { cellWidth: 26, fontStyle: 'bold', textColor: [40, 40, 40] },
                    2: { cellWidth: 36 },
                    3: { cellWidth: 24 },
                    4: { cellWidth: 14, halign: 'center' },
                    5: { cellWidth: 22 },
                    6: { cellWidth: 10, halign: 'center' },
                    7: { cellWidth: 22 },
                    8: { cellWidth: 20 }
                },
                didDrawPage: createBrandedFooter(doc, { label: 'Waitlist Export' }),
            });

            doc.save(`lab33-waitlist-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            setExportSuccess('pdf');
            setTimeout(() => { setExportSuccess(null); setExportOpen(false); }, 1200);
        } finally {
            setIsExporting(false);
        }
    }, [getExportData]);

    return {
        exportCSV,
        exportExcel,
        exportPDF,
        exportOpen,
        setExportOpen,
        exportSuccess,
        exportRef,
        isExporting,
    };
}
