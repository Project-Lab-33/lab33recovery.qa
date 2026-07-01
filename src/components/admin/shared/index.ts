// Shared Admin Components
// Barrel export for common components used across admin modules

export { AdminLoader } from './AdminLoader';
export type { AdminLoaderProps } from './AdminLoader';

export { StatusBadge } from './StatusBadge';
export { EmptyState } from './EmptyState';
export { DeleteModal } from './DeleteModal';
export { DateTimePicker } from './DateTimePicker';
export { AdminListView } from './AdminListView';
export type { Column, SortOption as AdminListSortOption, AdminListViewProps } from './AdminListView';
export { AdminCardView } from './AdminCardView';
export type { AdminCardViewProps } from './AdminCardView';
export { PaginationFooter } from './PaginationFooter';
export type { PaginationFooterProps } from './PaginationFooter';
export { AdminDrawer } from './AdminDrawer';
export type { AdminDrawerProps } from './AdminDrawer';
export { ExportOverlay } from './ExportOverlay';
export type { ExportOverlayProps } from './ExportOverlay';
export { SortDropdown } from './SortDropdown';
export type { SortOption, SortDropdownProps } from './SortDropdown';
export { FilterPill, FilterSection } from './FilterPill';
export type { FilterPillProps, FilterSectionProps } from './FilterPill';
export { HeaderIconBtn, Badge } from './HeaderIconBtn';
export type { HeaderIconBtnProps, BadgeProps } from './HeaderIconBtn';
export { ViewToggle } from './ViewToggle';
export type { ViewToggleProps, ViewOption } from './ViewToggle';
export { AdminPhoneInput, parseStoredPhone } from './AdminPhoneInput';
export { AdminNationalityInput } from './AdminNationalityInput';
export { GenderIcon } from './GenderIcon';
export { AdminFieldLabel } from './AdminFieldLabel';
export { AdminInput } from './AdminInput';
export { default as PermissionGate } from './PermissionGate';
export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps, ConnectionStatus, StatusConfig } from './StatusIndicator';
export { SettingsSectionHeader } from './SettingsSectionHeader';
export type { SettingsSectionHeaderProps } from './SettingsSectionHeader';
export { ToggleSwitch } from './ToggleSwitch';
export type { ToggleSwitchProps } from './ToggleSwitch';
export { KpiCard } from './KpiCard';
export type { KpiCardProps } from './KpiCard';
export { Sparkline } from './Sparkline';
export type { SparklineProps } from './Sparkline';
export { AnalyticsSectionHeader } from './AnalyticsSectionHeader';
export type { AnalyticsSectionHeaderProps } from './AnalyticsSectionHeader';
export { ActivityTimeline } from './ActivityTimeline';
export { ResourceActivityDrawer } from './ResourceActivityDrawer';
export { PersonDetailDrawer } from './PersonDetailDrawer';
export type { PersonData } from './PersonDetailDrawer';
export { PersonEditDrawer } from './PersonEditDrawer';
export type { PersonFormBase, StatusConfig as PersonStatusConfig, DocumentState, PositionOptions } from './PersonEditDrawer';

// Shared utilities
export { CommandPalette } from './CommandPalette';
export {
    getCountryByName, formatNationality, calculateAge,
    AGE_RANGES, ageMatchesRange,
    createBrandedPDF, renderBrandedHeader, createBrandedFooter,
    BRANDED_TABLE_STYLES, BRAND_GOLD,
} from './utils';
export type { BrandedPDFOptions, BrandedHeaderOptions, BrandedFooterOptions } from './utils';

export { AdminPageHeader } from './AdminPageHeader';


