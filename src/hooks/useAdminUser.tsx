"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminUser, AdminRole, Resource, Action } from '@/lib/permissions';
import { hasPermission } from '@/lib/permissions';

interface AdminUserContextType {
    user: AdminUser | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const AdminUserContext = createContext<AdminUserContextType>({
    user: null,
    loading: true,
    error: null,
    refetch: async () => { },
});

export function AdminUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        try {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {

                const { data: adminUser, error: fetchError } = await supabase
                    .from('admin_users')
                    .select('*')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (fetchError) {
                    console.error('Error fetching admin user:', fetchError.message, fetchError.code);
                    setError('Failed to load user profile');
                    setUser(null);
                } else if (!adminUser) {
                    console.warn('No admin profile found for user:', authUser.id);
                    setUser({
                        id: authUser.id,
                        email: authUser.email || '',
                        name: authUser.email?.split('@')[0] || 'User',
                        role: 'admin',
                        permissions_override: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                    setError(null);
                } else if (!adminUser.is_active) {
                    // Deactivated user — sign out and redirect
                    console.warn('Deactivated user attempted access:', authUser.id);
                    await supabase.auth.signOut();
                    setUser(null);
                    setError(null);
                    router.push('/admin/login');
                    return;
                } else {

                    setUser(adminUser);
                    setError(null);
                }
            } else {
                setUser(null);
                // Not authenticated — redirect to login
                if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            }
        } catch (err) {
            console.error('Error in fetchUser:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => {
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show loading state while checking auth (prevents flash of unauthenticated content)
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
                    <span className="text-[12px] text-[var(--text-secondary)]/40 uppercase tracking-widest font-bold">Loading</span>
                </div>
            </div>
        );
    }

    // Don't render children if no user (will redirect)
    if (!user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
                    <span className="text-[12px] text-[var(--text-secondary)]/40 uppercase tracking-widest font-bold">Redirecting</span>
                </div>
            </div>
        );
    }

    return (
        <AdminUserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
            {children}
        </AdminUserContext.Provider>
    );
}

export function useAdminUser() {
    const context = useContext(AdminUserContext);
    if (!context) {
        throw new Error('useAdminUser must be used within an AdminUserProvider');
    }
    return context;
}

/**
 * Check if the current user has a specific permission, respecting per-user overrides.
 */
export function usePermission(resource: Resource, action: Action) {
    const { user } = useAdminUser();
    return hasPermission(user?.role, resource, action, user?.permissions_override);
}

export function useRole(): AdminRole | null {
    const { user } = useAdminUser();
    return user?.role ?? null;
}
