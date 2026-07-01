import type { AdminUser } from "@/lib/permissions";
import type { PermissionOverrides } from "@/lib/permissions";

export type { SortDirection } from '@/types';

export interface UserWithMeta extends AdminUser {
    is_active: boolean;
    last_login_at: string | null;
    permissions_override?: PermissionOverrides | null;
}

export type SortField = "name" | "email" | "role" | "created_at";
export type DrawerMode = "add" | "edit" | "view" | null;
