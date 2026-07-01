"use client";

import { useRouter } from "next/navigation";
import { useAdminUser } from "@/hooks/useAdminUser";
import { hasPermission, type Resource, type Action } from "@/lib/permissions";
import { ShieldX } from "lucide-react";

interface PermissionGateProps {
    resource: Resource;
    action?: Action;
    children: React.ReactNode;
    /** If true, redirects to dashboard instead of showing access denied */
    redirect?: boolean;
}

export default function PermissionGate({
    resource,
    action = "read",
    children,
    redirect = false,
}: PermissionGateProps) {
    const { user } = useAdminUser();
    const router = useRouter();

    const overrides = user?.permissions_override;
    const allowed = hasPermission(user?.role, resource, action, overrides);

    if (!allowed) {
        if (redirect) {
            router.push("/admin/dashboard");
            return (
                <div className="flex h-[60vh] w-full items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
                </div>
            );
        }

        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-5 max-w-md text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldX size={28} className="text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                            Access Restricted
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]/60 leading-relaxed">
                            You don&apos;t have permission to access this page. Contact an admin if you believe this is an error.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="px-5 py-2.5 rounded-lg bg-[var(--surface-high)] border border-[var(--border-medium)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--accent-gold)]/10 hover:border-[var(--accent-gold)]/30 transition-all duration-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
