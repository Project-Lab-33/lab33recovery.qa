"use client";

import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Database } from "lucide-react";
import { ViewToggle } from "@/components/admin/shared/ViewToggle";
import { PermissionGate, AdminLoader, AdminPageHeader } from "@/components/admin/shared";
import type { LucideIcon } from "lucide-react";

const ResendEmailSettings = lazy(() => import("./resend/ResendEmailSettings"));
const SupabaseSettings = lazy(() => import("./supabase/SupabaseSettings"));

type IntegrationView = "resend" | "supabase";

const VIEW_OPTIONS: { view: IntegrationView; icon: LucideIcon; label: string }[] = [
    { view: "resend", icon: Mail, label: "Resend" },
    { view: "supabase", icon: Database, label: "Supabase" },
];

function ViewLoader() {
    return (
        <div className="flex items-center justify-center py-32">
            <AdminLoader page title="Loading Integration" subtitle="Initialising module..." />
        </div>
    );
}

export default function IntegrationsClient() {
    const [activeView, setActiveView] = useState<IntegrationView>("resend");

    return (
        <PermissionGate resource="settings" action="read">
            <div className="w-full flex flex-col h-full">

                {/* Shared Page Header */}
                <AdminPageHeader
                    eyebrow="Settings"
                    title="Integrations"
                    centreContent={
                        <ViewToggle<IntegrationView>
                            options={VIEW_OPTIONS}
                            activeView={activeView}
                            onViewChange={setActiveView}
                        />
                    }
                />

                {/* Active View */}
                <div className="flex-1 overflow-y-auto mt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full"
                        >
                            <Suspense fallback={<ViewLoader />}>
                                {activeView === "resend" && <ResendEmailSettings />}
                                {activeView === "supabase" && <SupabaseSettings />}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </PermissionGate>
    );
}
