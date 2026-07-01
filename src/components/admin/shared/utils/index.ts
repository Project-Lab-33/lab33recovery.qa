// Shared Admin Utilities
// Barrel export for common utility functions used across admin modules

export {
    getCountryByName,
    formatNationality,
    calculateAge,
    AGE_RANGES,
    ageMatchesRange,
} from './helpers';

export {
    createBrandedPDF,
    renderBrandedHeader,
    createBrandedFooter,
    BRANDED_TABLE_STYLES,
    BRAND_GOLD,
} from './exportPDF';

export type {
    BrandedPDFOptions,
    BrandedHeaderOptions,
    BrandedFooterOptions,
} from './exportPDF';
