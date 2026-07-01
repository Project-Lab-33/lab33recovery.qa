"use client";

import {
    Shield,
    UserCircle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Check,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    Pencil,
    Type,
    CalendarDays,
    Mail,
    X,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    AlertTriangle,
    Key,
    RefreshCw,
    LayoutGrid,
    Users,
    FileText,
    Settings,
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AdminLoader } from "@/components/admin/shared/AdminLoader";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminUser } from "@/hooks/useAdminUser";
import {
    hasPermission, getRoleLabel, getRoleColor, getRoleDescription,
    ALL_ROLES, RESOURCE_ACTIONS, RESOURCE_LABELS, ROLE_PERMISSIONS,
} from "@/lib/permissions";
import type { AdminRole, Resource, Action, PermissionOverrides } from "@/lib/permissions";
import { DeleteModal } from "@/components/admin/shared/DeleteModal";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { AdminListView, type Column, type SortOption } from "@/components/admin/shared/AdminListView";
import { FilterSection, FilterPill } from "@/components/admin/shared/FilterPill";
import { toast } from "sonner";
import { PermissionGate } from "@/components/admin/shared";

import { useUsers } from "./hooks/useUsers";
import type { UserWithMeta, SortField, SortDirection } from "./types";

const SORT_OPTIONS: SortOption[] = [
    { field: 'name', label: 'Alphabetical', icon: Type, defaultDirection: 'asc' },
    { field: 'email', label: 'Email Address', icon: Mail, defaultDirection: 'asc' },
    { field: 'created_at', label: 'Join Date', icon: CalendarDays, defaultDirection: 'desc' },
];

const TOGGLEABLE_SIDEBAR = [
    {
        id: 'waitlist', label: 'Waitlist', icon: Users, children: [
            { key: 'subscribers', label: 'Subscribers' },
            { key: 'analytics', label: 'Analytics' },
        ]
    },
    {
        id: 'applications', label: 'Applications', icon: FileText, children: [
            { key: 'positions', label: 'Positions' },
            { key: 'applicants', label: 'Applicants' },
            { key: 'analytics', label: 'Analytics' },
        ]
    },
    {
        id: 'email', label: 'Email', icon: Mail, children: [
            { key: 'templates', label: 'Templates' },
            { key: 'automations', label: 'Automations' },
            { key: 'logs', label: 'Logs' },
        ]
    },
    {
        id: 'contact', label: 'Contact', icon: Settings, children: []
    },
    {
        id: 'settings', label: 'Settings', icon: Settings, children: [
            { key: 'users', label: 'Users' },
            { key: 'general', label: 'General' },
            { key: 'email', label: 'Resend (Email)' },
        ]
    },
];

export default function UsersClient() {
    const { user: currentUser, refetch } = useAdminUser();

    // Permissions (with per-user overrides)
    const overrides = currentUser?.permissions_override;
    const canCreate = hasPermission(currentUser?.role, 'users', 'create', overrides);
    const canUpdate = hasPermission(currentUser?.role, 'users', 'update', overrides);
    const canDelete = hasPermission(currentUser?.role, 'users', 'delete', overrides);

    // Data hook
    const {
        supabase,
        users,
        setUsers,
        isLoading,
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        filteredUsers,
        activeFilterCount,
        fetchUsers,
        exportToCSV,
        exportToExcel,
        exportToPDF,
        toggleActive,
    } = useUsers();

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'add' | 'view' | 'edit'>('add');
    const [editingUser, setEditingUser] = useState<UserWithMeta | null>(null);

    // Security: lockout protection
    const isSelf = (userId: string) => userId === currentUser?.id;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const isLastAdmin = (user: UserWithMeta) => user.role === 'admin' && adminCount <= 1;
    const editingSelf = editingUser ? isSelf(editingUser.id) : false;
    const editingLastAdmin = editingUser ? isLastAdmin(editingUser) : false;

    // Form state
    const [addName, setAddName] = useState("");
    const [addEmail, setAddEmail] = useState("");
    const [addRole, setAddRole] = useState<AdminRole>("viewer");
    const [addAvatar, setAddAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [addPassword, setAddPassword] = useState("");
    const [showAddPassword, setShowAddPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [attemptedSave, setAttemptedSave] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [permOverrides, setPermOverrides] = useState<PermissionOverrides>({});
    const [showPermissions, setShowPermissions] = useState(false);
    const [hiddenSections, setHiddenSections] = useState<string[]>([]);
    const [showSections, setShowSections] = useState(false);

    // Password reset state
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    // Delete state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const openAddDrawer = () => {
        setDrawerMode('add');
        setEditingUser(null);
        setAddName("");
        setAddEmail("");
        setAddRole("viewer");
        setAddAvatar(null);
        setAvatarFile(null);
        setAddPassword("");
        setShowAddPassword(false);
        setTempPassword(null);
        setShowPassword(false);
        setAttemptedSave(false);
        setPermOverrides({});
        setShowPermissions(false);
        setHiddenSections([]);
        setShowSections(false);
        setShowPasswordReset(false);
        setNewPassword("");
        setShowNewPassword(false);
        setDrawerOpen(true);
    };

    const openEditDrawer = (user: UserWithMeta) => {
        setDrawerMode('edit');
        setEditingUser(user);
        setAddName(user.name);
        setAddEmail(user.email);
        setAddRole(user.role);
        setAddAvatar(user.avatar_url || null);
        setAvatarFile(null);
        setTempPassword(null);
        setShowPassword(false);
        setAttemptedSave(false);
        setPermOverrides(user.permissions_override || {});
        setShowPermissions(false);
        setHiddenSections(user.hidden_sections || []);
        setShowSections(false);
        setShowPasswordReset(false);
        setNewPassword("");
        setShowNewPassword(false);
        setDrawerOpen(true);
    };

    const openViewDrawer = (user: UserWithMeta) => {
        setDrawerMode('view');
        setEditingUser(user);
        setAddName(user.name);
        setAddEmail(user.email);
        setAddRole(user.role);
        setAddAvatar(user.avatar_url || null);
        setAvatarFile(null);
        setTempPassword(null);
        setShowPassword(false);
        setAttemptedSave(false);
        setPermOverrides(user.permissions_override || {});
        setShowPermissions(false);
        setShowPasswordReset(false);
        setNewPassword("");
        setShowNewPassword(false);
        setDrawerOpen(true);
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        const specials = '!@#$%&*';
        let pass = '';
        for (let i = 0; i < 14; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        pass += specials.charAt(Math.floor(Math.random() * specials.length));
        pass += Math.floor(Math.random() * 10);
        setNewPassword(pass);
        setShowNewPassword(true);
    };

    const handleResetPassword = async () => {
        if (!editingUser || !newPassword) return;
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setIsResettingPassword(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { data: result, error: invokeError } = await supabase.functions.invoke('reset-password', {
                body: {
                    userId: editingUser.id,
                    newPassword,
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
                },
            });

            if (invokeError) {
                console.error("Reset password error details:", invokeError);
                let errorDetails = invokeError.message;

                // Try to parse detailed error message from context if available
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((invokeError as any).context?.json) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const body = await (invokeError as any).context.json();
                        errorDetails = body.message || body.error || errorDetails;
                    } catch (e) {
                        console.error("Failed to parse error body", e);
                    }
                }
                throw new Error(errorDetails || "Failed to reset password");
            }

            toast.success(`Password updated for ${editingUser.name}`);
            setNewPassword("");
            setShowNewPassword(false);
            setShowPasswordReset(false);
        } catch (err: unknown) {
            console.error("Password reset error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to reset password");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleInviteUser = async () => {
        setAttemptedSave(true);
        if (!addName.trim() || !addEmail.trim()) {
            return;
        }
        // Validate custom password if provided
        if (addPassword && addPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            let initialAvatarUrl = null;

            // Handle avatar upload during invite
            if (avatarFile) {
                const fileName = `invite-${Math.random()}.jpg`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('admin-assets')
                    .upload(filePath, avatarFile);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('admin-assets')
                        .getPublicUrl(filePath);
                    initialAvatarUrl = publicUrl;
                }
            }

            const { data: result, error: invokeError } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: addEmail.trim(),
                    name: addName.trim(),
                    role: addRole,
                    avatar_url: initialAvatarUrl,
                    permissions_override: Object.keys(permOverrides).length > 0 ? permOverrides : null,
                    hidden_sections: hiddenSections.length > 0 ? hiddenSections : null,
                    password: addPassword || undefined,
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
                },
            });

            if (invokeError) {
                console.error("Invite user error details:", invokeError);
                let errorDetails = invokeError.message;

                // Try to parse detailed error message from context if available
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((invokeError as any).context?.json) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const body = await (invokeError as any).context.json();
                        errorDetails = body.message || body.error || errorDetails;
                    } catch (e) {
                        console.error("Failed to parse error body", e);
                    }
                }
                throw new Error(errorDetails || "Failed to invite user");
            }

            // Only show temp password card if it was auto-generated
            if (result.user.temp_password) {
                setTempPassword(result.user.temp_password);
                toast.success(`${result.user.name} has been invited`);
            } else {
                toast.success(`${result.user.name} has been invited with custom password`);
            }
            fetchUsers();
        } catch (err: unknown) {
            console.error("Error inviting user:", err);
            toast.error(err instanceof Error ? err.message : "Failed to invite user");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        // Security: block self role/permission changes
        if (isSelf(editingUser.id) && (addRole !== editingUser.role || Object.keys(permOverrides).length !== Object.keys(editingUser.permissions_override || {}).length)) {
            toast.error("You cannot modify your own role or permissions");
            return;
        }

        // Security: block demoting the last admin
        if (isLastAdmin(editingUser) && addRole !== 'admin') {
            toast.error("Cannot demote the last admin — at least one admin must exist");
            return;
        }

        setIsSaving(true);
        try {
            let finalAvatarUrl = addAvatar;

            // Handle new avatar upload
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${editingUser.id}-${Math.random()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('admin-assets')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('admin-assets')
                    .getPublicUrl(filePath);

                finalAvatarUrl = publicUrl;

                // Cleanup old avatar if it exists
                if (editingUser.avatar_url) {
                    try {
                        const oldPath = editingUser.avatar_url.split('/').pop();
                        if (oldPath) {
                            await supabase.storage
                                .from('admin-assets')
                                .remove([`avatars/${oldPath}`]);
                        }
                    } catch (cleanupErr) {
                        console.error("Failed to cleanup old avatar:", cleanupErr);
                    }
                }
            } else if (!addAvatar && editingUser.avatar_url) {
                // Avatar removed
                try {
                    const oldPath = editingUser.avatar_url.split('/').pop();
                    if (oldPath) {
                        await supabase.storage
                            .from('admin-assets')
                            .remove([`avatars/${oldPath}`]);
                    }
                } catch (cleanupErr) {
                    console.error("Failed to cleanup old avatar:", cleanupErr);
                }
            }

            const updatePayload: Record<string, unknown> = {
                name: addName.trim(),
                role: addRole,
                avatar_url: finalAvatarUrl,
                permissions_override: Object.keys(permOverrides).length > 0 ? permOverrides : null,
                hidden_sections: hiddenSections.length > 0 ? hiddenSections : null,
                updated_at: new Date().toISOString()
            };

            // eslint-disable-next-line prefer-const
            let { error } = await supabase
                .from("admin_users")
                .update(updatePayload)
                .eq("id", editingUser.id);

            // If update fails (e.g. permissions_override column missing), retry without it
            if (error) {
                console.warn("Update with permissions_override failed, retrying without:", error.message);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { permissions_override: _removed, ...fallbackPayload } = updatePayload;
                const { error: fallbackError } = await supabase
                    .from("admin_users")
                    .update(fallbackPayload)
                    .eq("id", editingUser.id);
                if (fallbackError) throw fallbackError;
                toast.success("Identity updated (run migration to enable permission overrides)");
            } else {
                toast.success("Identity updated");
            }

            if (editingUser.id === currentUser?.id) refetch();
            fetchUsers();
            setDrawerOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || "Failed to update user";
            console.error("Update error:", msg, err);
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteUser = async () => {
        if (!deleteUserId) return;

        // Security: block deleting self
        if (isSelf(deleteUserId)) {
            toast.error("You cannot delete your own account");
            return;
        }

        // Security: block deleting the last admin
        const targetUser = users.find(u => u.id === deleteUserId);
        if (targetUser && isLastAdmin(targetUser)) {
            toast.error("Cannot delete the last admin — at least one admin must exist");
            return;
        }

        setIsDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { data: result, error: invokeError } = await supabase.functions.invoke('delete-user', {
                body: { userId: deleteUserId },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
                },
            });

            if (invokeError) {
                console.error("Delete user error details:", invokeError);
                let errorDetails = invokeError.message;

                // Try to parse detailed error message from context if available
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((invokeError as any).context?.json) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const body = await (invokeError as any).context.json();
                        errorDetails = body.message || body.error || errorDetails;
                    } catch (e) {
                        console.error("Failed to parse error body", e);
                    }
                }
                throw new Error(errorDetails || "Failed to revoke access");
            }

            toast.success("Identity purged from platform");
            setUsers(prev => prev.filter(u => u.id !== deleteUserId));
            setDeleteModalOpen(false);
        } catch (err: unknown) {
            console.error("Deletion error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete user");
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<UserWithMeta>[] = useMemo(() => [
        {
            key: 'administrator',
            label: 'Administrator',
            initialWidth: 320,
            primary: true,
            render: (u) => (
                <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-[var(--accent-gold)]/20 rounded-full blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        <div className="relative w-10 h-10 rounded-full bg-[var(--surface-high)] border border-[var(--border-medium)] overflow-hidden flex items-center justify-center">
                            {u.avatar_url ? (
                                <Image src={u.avatar_url} alt={u.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={20} className="text-[var(--text-secondary)]/20" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-widest leading-tight group-hover:text-[var(--accent-gold)] transition-colors">{u.name}</span>
                        <span className="text-[12px] text-[var(--accent-gold)]/40 uppercase tracking-[0.15em] font-bold mt-0.5">
                            {u.id === currentUser?.id ? 'System Master' : format(parseISO(u.created_at), 'MMM dd, yyyy')}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email Configuration',
            initialWidth: 260,
            render: (u) => (
                <span className="text-[12px] text-[var(--text-secondary)] font-mono opacity-80">{u.email}</span>
            ),
        },
        {
            key: 'permission',
            label: 'Permission',
            initialWidth: 160,
            render: (u) => (
                <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] uppercase tracking-[0.15em] font-bold border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5"
                    style={{ color: getRoleColor(u.role), borderColor: `${getRoleColor(u.role)}40` }}
                >
                    <div className="w-1 h-1 rounded-full bg-current" />
                    {getRoleLabel(u.role)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            initialWidth: 140,
            render: (u) => (
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500/30'}`} />
                    <span className={`text-[12px] uppercase tracking-widest font-bold ${u.is_active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]/30'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
    ], [currentUser?.id]);

    const togglePermOverride = (resource: Resource, action: Action) => {
        setPermOverrides(prev => {
            // Deep clone to ensure React detects the change
            const next: PermissionOverrides = {};
            for (const key of Object.keys(prev) as Resource[]) {
                next[key] = { ...prev[key] };
            }

            // Ensure resource entry exists
            if (!next[resource]) next[resource] = {};
            else next[resource] = { ...next[resource] };

            const roleDefault = ROLE_PERMISSIONS[addRole]?.[resource]?.[action] ?? false;
            const currentOverride = next[resource]![action];

            if (currentOverride === undefined || currentOverride === null) {
                // No override → set to opposite of role default
                next[resource]![action] = !roleDefault;
            } else {
                // Has override → clear it (back to role default)
                delete next[resource]![action];
                if (Object.keys(next[resource]!).length === 0) delete next[resource];
            }

            return next;
        });
    };

    const getEffectiveValue = (resource: Resource, action: Action): boolean => {
        const override = permOverrides[resource]?.[action];
        if (override !== null && override !== undefined) return override;
        return ROLE_PERMISSIONS[addRole]?.[resource]?.[action] ?? false;
    };

    const isOverridden = (resource: Resource, action: Action): boolean => {
        const override = permOverrides[resource]?.[action];
        return override !== null && override !== undefined;
    };

    const toggleSidebarSection = (sectionId: string) => {
        setHiddenSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(s => s !== sectionId);
            }
            return [...prev.filter(s => !s.startsWith(`${sectionId}.`)), sectionId];
        });
    };

    const toggleSidebarChild = (sectionId: string, childKey: string) => {
        const fullKey = `${sectionId}.${childKey}`;
        setHiddenSections(prev => {
            if (prev.includes(sectionId)) {
                const section = TOGGLEABLE_SIDEBAR.find(s => s.id === sectionId);
                if (!section) return prev;
                const otherChildKeys = section.children
                    .filter(c => c.key !== childKey)
                    .map(c => `${sectionId}.${c.key}`);
                return [...prev.filter(s => s !== sectionId), ...otherChildKeys];
            }
            if (prev.includes(fullKey)) {
                return prev.filter(s => s !== fullKey);
            }
            const section = TOGGLEABLE_SIDEBAR.find(s => s.id === sectionId);
            if (section) {
                const newHidden = [...prev, fullKey];
                const allChildrenHidden = section.children.every(c =>
                    newHidden.includes(`${sectionId}.${c.key}`)
                );
                if (allChildrenHidden) {
                    return [...prev.filter(s => !s.startsWith(`${sectionId}.`)), sectionId];
                }
            }
            return [...prev, fullKey];
        });
    };

    const isChildHidden = (sectionId: string, childKey: string): boolean => {
        return hiddenSections.includes(sectionId) || hiddenSections.includes(`${sectionId}.${childKey}`);
    };

    const filterDrawerContent = (
        <div className="space-y-8">
            <FilterSection title="Administrative Tier" columns={2}>
                {ALL_ROLES.map(role => (
                    <FilterPill
                        key={role}
                        label={getRoleLabel(role)}
                        isSelected={roleFilter.includes(role)}
                        onClick={() => setRoleFilter(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])}
                    />
                ))}
            </FilterSection>

            <FilterSection title="Account Status" columns={2}>
                {(['active', 'inactive'] as const).map(status => (
                    <FilterPill
                        key={status}
                        label={status}
                        isSelected={statusFilter.includes(status)}
                        onClick={() => setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])}
                    />
                ))}
            </FilterSection>
        </div>
    );

    return (
        <PermissionGate resource="users" action="read">
            <div className="w-full flex flex-col flex-1 min-h-0">
                {/* Shared Admin List View */}
                <AdminListView<UserWithMeta>
                    headerLabel="Access Control"
                    title="Users"
                    data={filteredUsers}
                    isLoading={isLoading}
                    columns={columns}
                    getRowId={(u) => u.id}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search administrators..."
                    sortOptions={SORT_OPTIONS}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortFieldChange={(f) => setSortField(f as SortField)}
                    onSortDirectionChange={(d) => setSortDirection(d as SortDirection)}
                    defaultSortField="created_at"
                    defaultSortDirection="desc"
                    filterDrawerContent={filterDrawerContent}
                    activeFilterCount={activeFilterCount}
                    onClearFilters={() => { setRoleFilter([]); setStatusFilter([]); }}
                    filterDrawerTitle="Filter Administrators"
                    renderFilterChips={() => (
                        (roleFilter.length > 0 || statusFilter.length > 0) ? (
                            <div className="flex items-center gap-2 px-4 mt-4">
                                <span className="text-[12px] font-bold text-[var(--text-secondary)]/40 uppercase tracking-widest mr-2">Filters:</span>
                                {roleFilter.map(r => (
                                    <button key={r} onClick={() => setRoleFilter(prev => prev.filter(x => x !== r))} className="px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        {getRoleLabel(r as AdminRole)} <X size={10} />
                                    </button>
                                ))}
                            </div>
                        ) : null
                    )}
                    onExportCSV={exportToCSV}
                    onExportExcel={exportToExcel}
                    onExportPDF={exportToPDF}
                    onAdd={canCreate ? openAddDrawer : undefined}
                    addTooltip="Invite User"
                    onRowClick={openViewDrawer}
                    rowClassName={(u) => !u.is_active ? 'opacity-40' : ''}
                    renderRowActions={(u) => (
                        <div className="flex items-center gap-1">
                            {canUpdate && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditDrawer(u); }}
                                        title="Edit"
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    {u.id !== currentUser?.id && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleActive(u); }}
                                            title={u.is_active ? 'Deactivate' : 'Activate'}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                                        >
                                            {u.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    )}
                                </>
                            )}
                            {canDelete && u.id !== currentUser?.id && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteUserId(u.id); setDeleteModalOpen(true); }}
                                    title="Delete"
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-secondary)]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    )}
                    actionsWidth={120}
                    emptyIcon={<Shield size={36} className="text-[var(--text-secondary)]/20" />}
                    emptyTitle="No Administrators Found"
                    emptyDescription={roleFilter.length > 0 || statusFilter.length > 0 ? "Try adjusting your filters" : "Administrators will appear here after invitation"}
                    itemsPerPage={10}
                />

                {/* Administrator Drawer (Invite / Edit) */}
                <AdminDrawer
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    subtitle={drawerMode === 'view' ? 'Administrator Details' : drawerMode === 'edit' ? 'Edit Administrator' : undefined}
                    title={drawerMode === 'add' ? 'New Administrator' : editingUser?.name || 'Administrator'}
                    onSave={drawerMode === 'add' ? handleInviteUser : handleUpdateUser}
                    saveLabel={drawerMode === 'add' ? 'Invite' : 'Save Changes'}
                    isSaving={isSaving}
                    width="680px"
                    bodyClassName="space-y-8"
                    viewMode={drawerMode === 'view'}
                    onEditClick={editingUser && canUpdate ? () => setDrawerMode('edit') : undefined}
                    onDeleteClick={editingUser && editingUser.id !== currentUser?.id && canDelete ? () => { setDeleteUserId(editingUser.id); setDeleteModalOpen(true); } : undefined}
                >
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-[var(--surface-high)] border-2 border-[var(--border-medium)] overflow-hidden flex items-center justify-center">
                                {addAvatar ? (
                                    <Image src={addAvatar} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle size={32} className="text-[var(--text-secondary)]/20" />
                                )}
                            </div>
                            <label className="absolute inset-0 cursor-pointer rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[12px] font-bold text-white uppercase tracking-wider">Change</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setAvatarFile(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => setAddAvatar(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Profile Image</p>
                            <p className="text-[12px] text-[var(--text-muted)] mt-1 pl-3.5">JPG, PNG, WebP. Max 2MB</p>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[var(--accent-gold)] uppercase tracking-[0.15em] flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Full Name</label>
                        <input
                            type="text"
                            value={addName}
                            onChange={(e) => setAddName(e.target.value)}
                            className={`w-full bg-[var(--surface-mid)] border rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)] ${attemptedSave && !addName.trim() ? 'border-red-500/50' : 'border-[var(--border-medium)]'}`}
                            placeholder="Enter full name"
                        />
                        {attemptedSave && !addName.trim() && (
                            <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                <span className="text-[12px] text-red-400/90 font-medium tracking-wide">Full name is required</span>
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[var(--accent-gold)] uppercase tracking-[0.15em] flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Email Address</label>
                        <input
                            type="email"
                            value={addEmail}
                            onChange={(e) => setAddEmail(e.target.value)}
                            disabled={drawerMode === 'edit'}
                            className={`w-full bg-[var(--surface-mid)] border rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)] disabled:opacity-50 disabled:cursor-not-allowed ${attemptedSave && !addEmail.trim() ? 'border-red-500/50' : 'border-[var(--border-medium)]'}`}
                            placeholder="Enter email address"
                        />
                        {attemptedSave && !addEmail.trim() && (
                            <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                <span className="text-[12px] text-red-400/90 font-medium tracking-wide">Email address is required</span>
                            </p>
                        )}
                    </div>

                    {/* Password (add mode only) */}
                    {drawerMode === 'add' && (
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--accent-gold)] uppercase tracking-[0.15em] flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Password
                                <span className="text-[10px] text-[var(--text-secondary)]/40 font-normal normal-case tracking-normal ml-1">(optional — auto-generated if empty)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showAddPassword ? 'text' : 'password'}
                                        value={addPassword}
                                        onChange={(e) => setAddPassword(e.target.value)}
                                        placeholder="Leave empty to auto-generate"
                                        className="w-full bg-[var(--surface-mid)] border border-[var(--border-medium)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]/40 focus:bg-[var(--surface-high)] pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAddPassword(!showAddPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-secondary)]/40 hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
                                        const specials = '!@#$%&*';
                                        let pass = '';
                                        for (let i = 0; i < 14; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                                        pass += specials.charAt(Math.floor(Math.random() * specials.length));
                                        pass += Math.floor(Math.random() * 10);
                                        setAddPassword(pass);
                                        setShowAddPassword(true);
                                    }}
                                    title="Generate random password"
                                    className="p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                {addPassword && showAddPassword && (
                                    <button
                                        type="button"
                                        onClick={() => { navigator.clipboard.writeText(addPassword); toast.success("Password copied"); }}
                                        title="Copy password"
                                        className="p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors"
                                    >
                                        <Copy size={14} />
                                    </button>
                                )}
                            </div>
                            {addPassword && addPassword.length > 0 && addPassword.length < 8 && (
                                <p className="flex items-center gap-1.5 mt-1.5 pl-1">
                                    <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                    <span className="text-[12px] text-red-400/90 font-medium tracking-wide">Must be at least 8 characters</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Role */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-bold text-[var(--accent-gold)] uppercase tracking-[0.15em] flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />Role Assignment</label>
                        {/* Security warning: editing self or last admin */}
                        {drawerMode === 'edit' && (editingSelf || editingLastAdmin) && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                                <span className="text-[11px] text-amber-400/90 font-medium tracking-wide">
                                    {editingSelf
                                        ? 'You cannot change your own role or permissions to prevent self-lockout.'
                                        : 'This is the last admin. Role cannot be changed to prevent total lockout.'}
                                </span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            {ALL_ROLES.map(role => {
                                const roleDisabled = drawerMode === 'view' || editingSelf || (editingLastAdmin && role !== 'admin');
                                return (
                                    <button
                                        key={role}
                                        onClick={() => { if (!roleDisabled) { setAddRole(role); setPermOverrides({}); } }}
                                        disabled={roleDisabled}
                                        className={`py-3 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border flex flex-col items-center gap-1.5 ${addRole === role
                                            ? 'border-[var(--accent-gold)]/40 shadow-[0_0_20px_rgba(212,175,119,0.15)]'
                                            : 'bg-[var(--surface-high)] border-[var(--border-medium)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                                            } ${roleDisabled ? 'pointer-events-none opacity-40' : ''}`}
                                        style={addRole === role ? { backgroundColor: `${getRoleColor(role)}15`, borderColor: `${getRoleColor(role)}60`, color: getRoleColor(role) } : undefined}
                                    >
                                        <span>{getRoleLabel(role)}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {addRole && (
                            <p className="text-[11px] text-[var(--text-secondary)]/60 italic pl-0.5">
                                {getRoleDescription(addRole)}
                            </p>
                        )}
                    </div>

                    {/* Per-User Permissions Override */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => !editingSelf && setShowPermissions(!showPermissions)}
                            disabled={(drawerMode === 'view' && Object.keys(permOverrides).length === 0) || editingSelf}
                            className={`w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--surface-high)] border border-[var(--border-medium)] hover:border-[var(--border-strong)] transition-colors group ${editingSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <Shield size={16} className="text-[var(--accent-gold)]" />
                                <div className="text-left">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider block">Fine-Tune Permissions</span>
                                    <span className="text-[10px] text-[var(--text-secondary)]/50 tracking-wide">
                                        {Object.keys(permOverrides).length > 0
                                            ? `${Object.values(permOverrides).reduce((acc, r) => acc + Object.keys(r!).length, 0)} custom override(s)`
                                            : 'Using role defaults'
                                        }
                                    </span>
                                </div>
                            </div>
                            {showPermissions ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                        </button>

                        <AnimatePresence>
                            {showPermissions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-3 pt-1">
                                        {/* Reset button */}
                                        {Object.keys(permOverrides).length > 0 && drawerMode !== 'view' && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => setPermOverrides({})}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                                                >
                                                    <RotateCcw size={10} /> Reset to Defaults
                                                </button>
                                            </div>
                                        )}

                                        {(Object.keys(RESOURCE_ACTIONS) as Resource[]).map(resource => (
                                            <div key={resource} className="p-3 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)]">
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2.5">{RESOURCE_LABELS[resource]}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {RESOURCE_ACTIONS[resource].map(action => {
                                                        const effective = getEffectiveValue(resource, action);
                                                        const overrideActive = isOverridden(resource, action);
                                                        return (
                                                            <button
                                                                key={action}
                                                                type="button"
                                                                disabled={drawerMode === 'view'}
                                                                onClick={() => togglePermOverride(resource, action)}
                                                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border relative ${effective
                                                                    ? overrideActive
                                                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/30'
                                                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80'
                                                                    : overrideActive
                                                                        ? 'bg-red-500/20 border-red-500/40 text-red-400 ring-1 ring-red-500/30'
                                                                        : 'bg-[var(--surface-high)]/50 border-[var(--border-subtle)] text-[var(--text-secondary)]/30'
                                                                    } ${drawerMode === 'view' ? 'pointer-events-none' : 'hover:scale-105 active:scale-95'}`}
                                                                title={overrideActive ? `Custom override (click to reset to role default)` : `Role default (click to override)`}
                                                            >
                                                                {action}
                                                                {overrideActive && (
                                                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent-gold)] border border-[var(--surface-mid)]" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        <p className="text-[10px] text-[var(--text-secondary)]/40 italic px-1">
                                            Green = allowed, Red/Gray = denied. Gold dot = custom override.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Section Visibility */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => !editingSelf && setShowSections(!showSections)}
                            disabled={(drawerMode === 'view' && hiddenSections.length === 0) || editingSelf}
                            className={`w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--surface-high)] border border-[var(--border-medium)] hover:border-[var(--border-strong)] transition-colors group ${editingSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutGrid size={16} className="text-[var(--accent-gold)]" />
                                <div className="text-left">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider block">Sidebar Visibility</span>
                                    <span className="text-[10px] text-[var(--text-secondary)]/50 tracking-wide">
                                        {hiddenSections.length > 0 ? `${hiddenSections.length} section(s) hidden` : 'All sections visible'}
                                    </span>
                                </div>
                            </div>
                            {showSections ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                        </button>

                        <AnimatePresence>
                            {showSections && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-1 pt-1">
                                        {TOGGLEABLE_SIDEBAR.map(section => {
                                            const SIcon = section.icon;
                                            const isGroupHidden = hiddenSections.includes(section.id);
                                            return (
                                                <div key={section.id}>
                                                    <button
                                                        type="button"
                                                        disabled={drawerMode === 'view'}
                                                        onClick={() => toggleSidebarSection(section.id)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isGroupHidden ? 'opacity-40 hover:opacity-60' : 'hover:bg-[var(--accent-gold-soft)]/30'} ${drawerMode === 'view' ? 'pointer-events-none' : ''}`}
                                                    >
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${isGroupHidden ? 'bg-[var(--surface-high)] border-[var(--border-subtle)]' : 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/20'}`}>
                                                            <SIcon size={13} strokeWidth={1.5} className={isGroupHidden ? 'text-[var(--text-secondary)]/40' : 'text-[var(--accent-gold)]'} />
                                                        </div>
                                                        <span className={`flex-1 text-left text-[12px] font-bold uppercase tracking-wider ${isGroupHidden ? 'text-[var(--text-secondary)]/40 line-through' : 'text-[var(--text-primary)]'}`}>
                                                            {section.label}
                                                        </span>
                                                        <div className={isGroupHidden ? 'text-rose-400/60' : 'text-emerald-400/80'}>
                                                            {isGroupHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </div>
                                                    </button>
                                                    {!isGroupHidden && section.children.map(child => {
                                                        const childHidden = isChildHidden(section.id, child.key);
                                                        return (
                                                            <button
                                                                key={child.key}
                                                                type="button"
                                                                disabled={drawerMode === 'view'}
                                                                onClick={() => toggleSidebarChild(section.id, child.key)}
                                                                className={`w-full flex items-center gap-3 pl-12 pr-3 py-2 rounded-lg transition-all ${childHidden ? 'opacity-40 hover:opacity-60' : 'hover:bg-[var(--accent-gold-soft)]/20'} ${drawerMode === 'view' ? 'pointer-events-none' : ''}`}
                                                            >
                                                                <span className={`flex-1 text-left text-[11px] font-medium tracking-wide ${childHidden ? 'text-[var(--text-secondary)]/40 line-through' : 'text-[var(--text-secondary)]'}`}>
                                                                    {child.label}
                                                                </span>
                                                                <div className={`transition-colors ${childHidden ? 'text-rose-400/40' : 'text-emerald-400/60'}`}>
                                                                    {childHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                        {hiddenSections.length > 0 && drawerMode !== 'view' && (
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={() => setHiddenSections([])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                                                >
                                                    <RotateCcw size={10} /> Show All
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-[var(--text-secondary)]/40 italic px-1">
                                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                                            Hidden sections won't appear in this user's sidebar. Dashboard is always visible.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Password Reset (edit mode, other users only) */}
                    {drawerMode === 'edit' && editingUser && !editingSelf && (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowPasswordReset(!showPasswordReset)}
                                className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--surface-high)] border border-[var(--border-medium)] hover:border-[var(--border-strong)] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Key size={16} className="text-[var(--accent-gold)]" />
                                    <div className="text-left">
                                        <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider block">Reset Password</span>
                                        <span className="text-[10px] text-[var(--text-secondary)]/50 tracking-wide">Set a new password for this user</span>
                                    </div>
                                </div>
                                {showPasswordReset ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                            </button>

                            <AnimatePresence>
                                {showPasswordReset && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 rounded-xl bg-[var(--surface-mid)] border border-[var(--border-subtle)] space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">New Password</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="Min. 8 characters"
                                                            className="w-full bg-[var(--surface-high)] border border-[var(--border-medium)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]/40 pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-secondary)]/40 hover:text-[var(--text-primary)] transition-colors"
                                                        >
                                                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={generateRandomPassword}
                                                        title="Generate random password"
                                                        className="p-2.5 rounded-xl bg-[var(--surface-high)] border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-colors"
                                                    >
                                                        <RefreshCw size={14} />
                                                    </button>
                                                </div>
                                                {newPassword && newPassword.length < 8 && (
                                                    <p className="flex items-center gap-1.5 pl-1">
                                                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                                        <span className="text-[11px] text-red-400/90 font-medium tracking-wide">Must be at least 8 characters</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleResetPassword}
                                                    disabled={isResettingPassword || !newPassword || newPassword.length < 8}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-[11px] font-bold uppercase tracking-wider hover:bg-[var(--accent-gold)]/20 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    {isResettingPassword ? <RefreshCw size={12} className="animate-spin" /> : <Key size={12} />}
                                                    {isResettingPassword ? 'Updating...' : 'Update Password'}
                                                </button>
                                                {newPassword && showNewPassword && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { navigator.clipboard.writeText(newPassword); toast.success("Password copied"); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                                                    >
                                                        <Copy size={12} /> Copy
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-[10px] text-[var(--text-secondary)]/40 italic">
                                                The user will need to use this new password on their next login.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Temporary Password (after invite success) */}
                    {tempPassword && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                            <p className="text-[12px] font-bold text-emerald-400 uppercase tracking-widest">Temporary Password Generated</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-[var(--surface-high)]/60 rounded-lg px-3 py-2 text-[14px] font-mono text-[var(--text-primary)]">
                                    {showPassword ? tempPassword : '••••••••••••'}
                                </code>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-2 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(tempPassword);
                                        toast.success("Password copied");
                                    }}
                                    className="p-2 rounded-lg hover:bg-[var(--surface-high)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <p className="text-[12px] text-emerald-400/80">Share this password securely. User will be required to change it on first login.</p>
                        </div>
                    )}
                </AdminDrawer>

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDeleteUser}
                    isDeleting={isDeleting}
                    title="Purge Administrator"
                    description="This will permanently remove this user's access and delete their account. This action cannot be undone."
                />
            </div>
        </PermissionGate>
    );
}
