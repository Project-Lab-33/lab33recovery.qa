export type AdminRole = 'admin' | 'manager' | 'owner' | 'viewer';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    avatar_url?: string;
    is_active?: boolean;
    last_login_at?: string | null;
    permissions_override?: PermissionOverrides | null;
    hidden_sections?: string[] | null;
    created_at: string;
    updated_at: string;
}

export type Resource = 'waitlist' | 'applications' | 'analytics' | 'settings' | 'users' | 'email' | 'contact';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'decline' | 'export';

/**
 * Per-resource permissions object.
 * Each key is an action, value is true/false.
 */
export type ResourcePermissions = Partial<Record<Action, boolean>>;

/**
 * Full permissions map: resource → actions.
 */
export type PermissionMap = Record<Resource, ResourcePermissions>;

/**
 * Per-user permission overrides: only the resources/actions
 * explicitly overridden are stored. `null` means "use role default".
 */
export type PermissionOverrides = Partial<Record<Resource, Partial<Record<Action, boolean | null>>>>;

export const ROLE_PERMISSIONS: Record<AdminRole, PermissionMap> = {
    admin: {
        waitlist: { create: true, read: true, update: true, delete: true, export: true },
        applications: { create: true, read: true, update: true, delete: true, export: true },
        analytics: { read: true },
        settings: { read: true, update: true },
        users: { read: true, create: true, update: true, delete: true },
        email: { create: true, read: true, update: true, delete: true },
        contact: { read: true, update: true, delete: true },
    },
    manager: {
        waitlist: { create: true, read: true, update: true, delete: false, export: true },
        applications: { create: true, read: true, update: true, delete: false, export: true },
        analytics: { read: true },
        settings: { read: false, update: false },
        users: { read: false, create: false, update: false, delete: false },
        email: { create: true, read: true, update: true, delete: false },
        contact: { read: true, update: true, delete: false },
    },
    owner: {
        waitlist: { create: false, read: true, update: false, delete: false, export: true },
        applications: { create: false, read: true, update: true, delete: false, export: true },
        analytics: { read: true },
        settings: { read: true, update: false },
        users: { read: true, create: false, update: true, delete: false },
        email: { create: false, read: true, update: false, delete: false },
        contact: { read: true, update: true, delete: false },
    },
    viewer: {
        waitlist: { create: false, read: true, update: false, delete: false, export: false },
        applications: { create: false, read: true, update: false, delete: false, export: false },
        analytics: { read: true },
        settings: { read: false, update: false },
        users: { read: false, create: false, update: false, delete: false },
        email: { create: false, read: true, update: false, delete: false },
        contact: { read: true, update: false, delete: false },
    },
};

// All resources and their possible actions (for the matrix UI)
export const RESOURCE_ACTIONS: Record<Resource, Action[]> = {
    waitlist: ['create', 'read', 'update', 'delete', 'export'],
    applications: ['create', 'read', 'update', 'delete', 'export'],
    analytics: ['read'],
    settings: ['read', 'update'],
    users: ['read', 'create', 'update', 'delete'],
    email: ['create', 'read', 'update', 'delete'],
    contact: ['read', 'update', 'delete'],
};

export const RESOURCE_LABELS: Record<Resource, string> = {
    waitlist: 'Waitlist',
    applications: 'Applications',
    analytics: 'Analytics',
    settings: 'Settings',
    users: 'User Management',
    email: 'Email Hub',
    contact: 'Contact Messages',
};

export const ALL_ROLES: AdminRole[] = ['admin', 'manager', 'owner', 'viewer'];

export function hasPermission(
    role: AdminRole | undefined,
    resource: Resource,
    action: Action,
    overrides?: PermissionOverrides | null
): boolean {
    // Default to 'admin' if no role is set (e.g. owner without explicit admin_users record)
    const effectiveRole = role || 'admin';
    const rolePerms = ROLE_PERMISSIONS[effectiveRole];
    if (!rolePerms) return false;
    const resourcePerms = rolePerms[resource];
    if (!resourcePerms) return false;

    // Check per-user override first
    if (overrides) {
        const overrideVal = overrides[resource]?.[action];
        if (overrideVal !== null && overrideVal !== undefined) {
            return overrideVal;
        }
    }

    return resourcePerms[action] ?? false;
}

/**
 * Get the effective permissions for a user (role defaults + overrides merged).
 */
export function getEffectivePermissions(
    role: AdminRole,
    overrides?: PermissionOverrides | null
): PermissionMap {
    const rolePerms = ROLE_PERMISSIONS[role];
    const result = {} as PermissionMap;

    for (const resource of Object.keys(rolePerms) as Resource[]) {
        result[resource] = { ...rolePerms[resource] };
        if (overrides?.[resource]) {
            for (const [action, value] of Object.entries(overrides[resource]!)) {
                if (value !== null && value !== undefined) {
                    result[resource][action as Action] = value;
                }
            }
        }
    }

    return result;
}

export function getRoleLabel(role: AdminRole): string {
    switch (role) {
        case 'admin': return 'Admin';
        case 'manager': return 'Manager';
        case 'owner': return 'Owner';
        case 'viewer': return 'Viewer';
        default: return 'Unknown';
    }
}

export function getRoleColor(role: AdminRole): string {
    switch (role) {
        case 'admin': return 'var(--accent-gold)';
        case 'manager': return '#5B8AF5';
        case 'owner': return '#3F6251';
        case 'viewer': return '#9B8EC4';
        default: return 'var(--text-secondary)';
    }
}

export function getRoleDescription(role: AdminRole): string {
    switch (role) {
        case 'admin': return 'Full system access — can manage everything including users and settings';
        case 'manager': return 'Day-to-day operations — manages content, waitlist, and applications';
        case 'owner': return 'Business oversight — can view, approve, and export but limited editing';
        case 'viewer': return 'Read-only access — can browse all data but cannot modify anything';
        default: return '';
    }
}
