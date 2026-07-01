import type jsPDF from "jspdf";
import type { UserOptions } from "jspdf-autotable";
import { format } from "date-fns";

// Dynamic loaders — jsPDF + autoTable are only fetched when actually needed
async function loadJsPDF() {
    const { default: jsPDF } = await import("jspdf");
    return jsPDF;
}
async function loadAutoTable() {
    const { default: autoTable } = await import("jspdf-autotable");
    return autoTable;
}

/** Gold accent bar RGB */
export const BRAND_GOLD = [212, 175, 119] as const;

/** Standard table styles matching the Lab 33 branded export look */
export const BRANDED_TABLE_STYLES: Partial<UserOptions> = {
    theme: 'plain' as const,
    headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 6,
        cellPadding: 4,
        halign: 'left',
    },
    bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [70, 70, 70],
        fontSize: 6.5,
        cellPadding: 3,
        lineColor: [245, 245, 245],
        lineWidth: 0.3,
    },
    alternateRowStyles: {
        fillColor: [250, 249, 248],
    },
    margin: { top: 20, bottom: 18, left: 14, right: 14 },
};

async function loadLogo(): Promise<string | null> {
    try {
        const response = await fetch('/logo-black.png');
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

export interface BrandedHeaderOptions {
    /** Document category label (e.g., 'WAITLIST', 'TALENT PIPELINE', 'WORKFORCE') */
    category: string;
    /** Report subtitle (e.g., 'Subscriber Export Report', 'Applications Export') */
    title: string;
    /** Height of the header background area (default: 30) */
    headerHeight?: number;
}

export async function renderBrandedHeader(
    doc: jsPDF,
    options: BrandedHeaderOptions
): Promise<number> {
    const pageWidth = doc.internal.pageSize.width;
    const headerHeight = options.headerHeight ?? 30;

    // Gold accent bar
    doc.setFillColor(BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Header background
    doc.setFillColor(252, 251, 250);
    doc.rect(0, 4, pageWidth, headerHeight, 'F');

    // Logo
    const logo = await loadLogo();
    if (logo) {
        doc.addImage(logo, 'PNG', 14, 10, 55, 18);
    } else {
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('LAB 33', 14, 22);
    }

    // Right side — category label
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(options.category, pageWidth - 14, 14, { align: 'right' });

    // Right side — title
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.text(options.title, pageWidth - 14, 21, { align: 'right' });

    // Right side — date
    doc.setTextColor(180, 140, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(format(new Date(), 'MMMM dd, yyyy'), pageWidth - 14, 28, { align: 'right' });

    return 4 + headerHeight + 8; // Default startY for content
}

export interface BrandedFooterOptions {
    /** Footer category label appended after branding (e.g., 'Waitlist Export') */
    label: string;
}

export function createBrandedFooter(
    doc: jsPDF,
    options: BrandedFooterOptions
): UserOptions['didDrawPage'] {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    return (data) => {
        // Top gold bar on every page
        doc.setFillColor(BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]);
        doc.rect(0, 0, pageWidth, 3, 'F');

        // Bottom footer
        const footerY = pageHeight - 12;

        // Footer line
        doc.setDrawColor(230, 225, 220);
        doc.setLineWidth(0.3);
        doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);

        // Left: Branding
        doc.setTextColor(180, 140, 80);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('LAB 33 RECOVERY', 14, footerY);

        doc.setTextColor(140, 140, 140);
        doc.setFont('helvetica', 'normal');
        doc.text(` \u2022 ${options.label}`, 14 + doc.getTextWidth('LAB 33 RECOVERY'), footerY);

        // Center: Confidential notice
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(5);
        doc.text('CONFIDENTIAL \u2022 FOR INTERNAL USE ONLY', pageWidth / 2, footerY, { align: 'center' });

        // Right: Page number
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(6);
        doc.text(`Page ${data.pageNumber}`, pageWidth - 14, footerY, { align: 'right' });
    };
}

export interface BrandedPDFOptions {
    /** Document category label */
    category: string;
    /** Report subtitle */
    title: string;
    /** Table header row */
    head: string[][];
    /** Table body rows */
    body: (string | number)[][];
    /** Output filename (without extension and date) */
    filename: string;
    /** Footer label (defaults to title) */
    footerLabel?: string;
    /** Additional autoTable overrides */
    tableOverrides?: Partial<UserOptions>;
    /** Custom startY (if dashboard section is rendered between header and table) */
    startY?: number;
}

export async function createBrandedPDF(options: BrandedPDFOptions): Promise<jsPDF> {
    const JsPDF = await loadJsPDF();
    const autoTable = await loadAutoTable();
    const doc = new JsPDF();

    const defaultStartY = await renderBrandedHeader(doc, {
        category: options.category,
        title: options.title,
    });

    const startY = options.startY ?? defaultStartY;

    autoTable(doc, {
        head: options.head,
        body: options.body,
        startY,
        ...BRANDED_TABLE_STYLES,
        didDrawPage: createBrandedFooter(doc, {
            label: options.footerLabel ?? options.title,
        }),
        ...options.tableOverrides,
    });

    doc.save(`${options.filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    return doc;
}
