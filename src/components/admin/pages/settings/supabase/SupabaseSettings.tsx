"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Database, Shield, HardDrive, Radio, Zap, Lock,
    Table2, Key, RefreshCcw, Server, Globe, Layers,
    FunctionSquare, Workflow, Users,
    CheckCircle, ExternalLink, Box,
} from "lucide-react";
import { SettingsSectionHeader } from "@/components/admin/shared";
import {
    IntegrationPageShell,
    ConnectionStatusHeader,
    KpiGrid, GlassSection, SectionDivider,
    TestConnectionBanner,
    useIntegrationSettings,
} from "../shared";

const SB_ACCENT = "#3ECF8E"; // Supabase brand green

interface BucketStat {
    name: string;
    public: boolean;
    fileCount: number;
    totalBytes: number;
    totalMb: number;
    totalPretty: string;
    fileSizeLimit: number | null;
    allowedMimeTypes: string[] | null;
}

interface EdgeFunction {
    name: string;
    description: string;
}

interface SupabaseSettingsData {
    project: {
        ref: string;
        url: string;
        region: string;
        name: string;
        status: string;
        postgresVersion: string;
        databaseSize: string;
    };
    features: {
        auth: {
            enabled: boolean;
            provider: string;
            adminUsers: number;
            description: string;
        };
        database: {
            enabled: boolean;
            totalTables: number;
            totalRlsPolicies: number;
            totalIndexes: number;
            totalFunctions: number;
            totalTriggers: number;
            tableCounts: Record<string, number>;
            sizeBytes: number;
            sizePretty: string;
            limitBytes: number;
            limitMb: number;
            usagePercent: number;
        };
        storage: {
            enabled: boolean;
            buckets: BucketStat[];
            totalBuckets: number;
            totalFiles: number;
            usedBytes: number;
            usedMb: number;
            usedPretty: string;
            limitBytes: number;
            limitGb: number;
            remainingBytes: number;
            remainingMb: number;
            usagePercent: number;
        };
        realtime: {
            enabled: boolean;
            subscribedTables: string[];
            description: string;
        };
        edgeFunctions: {
            enabled: boolean;
            functions: EdgeFunction[];
            totalFunctions: number;
        };
        vault: {
            enabled: boolean;
            description: string;
            secrets: string[];
        };
        rls: {
            enabled: boolean;
            totalPolicies: number;
            description: string;
        };
    };
    configured: boolean;
    connected: boolean;
}

const REGION_LABELS: Record<string, string> = {
    "ap-south-1": "Mumbai (Asia Pacific)",
    "us-east-1": "N. Virginia (US East)",
    "us-west-1": "N. California (US West)",
    "eu-west-1": "Ireland (Europe)",
    "eu-central-1": "Frankfurt (Europe)",
    "ap-southeast-1": "Singapore (Asia Pacific)",
    "ap-northeast-1": "Tokyo (Asia Pacific)",
};

const TABLE_LABELS: Record<string, string> = {
    waitlist: "Waitlist Subscribers",
    job_applications: "Job Applications",
    positions: "Open Positions",
    email_logs: "Email Logs",
    email_templates: "Email Templates",
    email_automations: "Email Automations",
    admin_activity_logs: "Activity Logs",
    admin_notifications: "Notifications",
    admin_users: "Admin Users",
    site_settings: "Site Settings",
    system_logs: "System Logs",
};

export default function SupabaseSettings() {
    const [isTogglingMaster] = useState(false);

    const { data, loading, isTesting, testStatus, setTestStatus, fetchData, testConnection } =
        useIntegrationSettings<SupabaseSettingsData>({
            endpoint: "/api/admin/settings/supabase",
            label: "Supabase",
        });

    const connectionStatus = loading
        ? "loading" as const
        : data?.connected
            ? "connected" as const
            : "not_configured" as const;

    const project = data?.project;
    const features = data?.features;

    const totalRows = features?.database?.tableCounts
        ? Object.values(features.database.tableCounts).reduce((a, b) => a + b, 0)
        : 0;

    const totalFiles = features?.storage?.totalFiles || 0;
    const storageUsedMb = features?.storage?.usedMb || 0;
    const storageUsedPretty = features?.storage?.usedPretty || "0 bytes";
    const storageLimitGb = features?.storage?.limitGb || 1;
    const storagePercent = features?.storage?.usagePercent || 0;
    const dbPercent = features?.database?.usagePercent || 0;

    const handleTest = useCallback(() => {
        testConnection("test_connection");
    }, [testConnection]);

    return (
        <IntegrationPageShell
            headerLabel="Backend Infrastructure"
            title="Supabase"
            description="Database, authentication, storage, realtime & edge functions"
            status={connectionStatus}
            isLoading={loading}
            hasData={!!data}
            onRefresh={fetchData}
            accent={SB_ACCENT}
        >
            {/* Connection status */}
            <ConnectionStatusHeader
                configured={data?.configured || false}
                enabled={data?.connected}
                title={project?.name || "Lab33 (Website)"}
                subtitle={`Project ${project?.ref || "—"} · ${REGION_LABELS[project?.region || ""] || project?.region || "—"}`}
                tokenPreview={project?.ref ? `${project.ref.slice(0, 8)}...` : undefined}
                portalUrl={project?.ref ? `https://supabase.com/dashboard/project/${project.ref}` : undefined}
                portalLabel="Dashboard"
                accent={SB_ACCENT}
                onToggle={undefined}
                isToggling={isTogglingMaster}
            />

            {/* KPI overview */}
            <div className="px-8 py-6">
                <KpiGrid
                    kpis={[
                        {
                            label: "Database",
                            value: project?.databaseSize || "—",
                            icon: Database,
                            accent: SB_ACCENT,
                            sub: `${dbPercent}% of ${features?.database?.limitMb || 500} MB`,
                        },
                        {
                            label: "Tables",
                            value: features?.database?.totalTables || 0,
                            icon: Table2,
                            accent: SB_ACCENT,
                            sub: `${totalRows.toLocaleString()} total rows`,
                        },
                        {
                            label: "Storage",
                            value: storageUsedPretty,
                            icon: HardDrive,
                            accent: "#f59e0b",
                            sub: `${storagePercent}% of ${storageLimitGb} GB · ${totalFiles} files`,
                        },
                        {
                            label: "RLS Policies",
                            value: features?.rls?.totalPolicies || 0,
                            icon: Shield,
                            accent: "#8b5cf6",
                            sub: "Row Level Security",
                        },
                        {
                            label: "Edge Functions",
                            value: features?.edgeFunctions?.totalFunctions || 0,
                            icon: Zap,
                            accent: "#06b6d4",
                            sub: "Serverless functions",
                        },
                        {
                            label: "Auth Users",
                            value: features?.auth?.adminUsers || 0,
                            icon: Users,
                            accent: "#ec4899",
                            sub: features?.auth?.provider || "Email/Password",
                        },
                        {
                            label: "DB Functions",
                            value: features?.database?.totalFunctions || 0,
                            icon: FunctionSquare,
                            accent: "#10b981",
                            sub: `${features?.database?.totalTriggers || 0} triggers`,
                        },
                        {
                            label: "Indexes",
                            value: features?.database?.totalIndexes || 0,
                            icon: Layers,
                            accent: "#f97316",
                            sub: "Query optimization",
                        },
                    ]}
                    columns={4}
                    delay={0.1}
                />
            </div>

            <SectionDivider />

            {/* Usage & quotas */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={HardDrive}
                    title="Usage & Quotas"
                    subtitle="Resource consumption against plan limits"
                    delay={0.15}
                    accentColor="#f59e0b"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UsageBar
                        label="Database"
                        usedLabel={features?.database?.sizePretty || "0 MB"}
                        limitLabel={`${features?.database?.limitMb || 500} MB`}
                        percent={dbPercent}
                        accent={SB_ACCENT}
                        delay={0.2}
                    />
                    <UsageBar
                        label="File Storage"
                        usedLabel={storageUsedPretty}
                        limitLabel={`${storageLimitGb} GB`}
                        percent={storagePercent}
                        accent="#f59e0b"
                        delay={0.25}
                    />
                </div>
            </div>

            <SectionDivider />

            {/* Project info */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={Server}
                    title="Project Configuration"
                    subtitle="Core infrastructure details and connection endpoints"
                    delay={0.15}
                    accentColor={SB_ACCENT}
                />

                <GlassSection delay={0.2}>
                    <div className="px-6 py-5 space-y-4">
                        <InfoRow icon={Globe} label="API URL" value={project?.url || "—"} mono />
                        <InfoRow icon={Server} label="Project Ref" value={project?.ref || "—"} mono />
                        <InfoRow icon={Globe} label="Region" value={REGION_LABELS[project?.region || ""] || project?.region || "—"} />
                        <InfoRow icon={Database} label="Postgres Version" value={project?.postgresVersion || "—"} />
                        <InfoRow
                            icon={CheckCircle}
                            label="Status"
                            value={project?.status || "—"}
                            statusDot={project?.status === "ACTIVE_HEALTHY" ? "green" : "gold"}
                        />
                    </div>
                </GlassSection>
            </div>

            <SectionDivider />

            {/* Database tables */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={Table2}
                    title="Database Tables"
                    subtitle={`${Object.keys(features?.database?.tableCounts || {}).length} tables · ${totalRows.toLocaleString()} total rows`}
                    delay={0.25}
                    accentColor={SB_ACCENT}
                />

                <GlassSection delay={0.3}>
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {features?.database?.tableCounts && Object.entries(features.database.tableCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([table, count], i) => (
                                <motion.div
                                    key={table}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.02 }}
                                    className="px-6 py-3.5 flex items-center justify-between group hover:bg-[var(--surface-high)]/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center border"
                                            style={{
                                                backgroundColor: `${SB_ACCENT}10`,
                                                borderColor: `${SB_ACCENT}25`,
                                            }}
                                        >
                                            <Table2 size={12} style={{ color: SB_ACCENT }} />
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-medium text-[var(--text-primary)]">
                                                {TABLE_LABELS[table] || table}
                                            </span>
                                            <span className="text-[10px] text-[var(--text-muted)] ml-2 font-mono">
                                                {table}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Row count bar */}
                                        <div className="w-24 h-1.5 rounded-full bg-[var(--surface-high)] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: totalRows > 0 ? `${Math.max(4, (count / totalRows) * 100)}%` : "0%" }}
                                                transition={{ delay: 0.4 + i * 0.02, duration: 0.5 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: SB_ACCENT }}
                                            />
                                        </div>
                                        <code className="text-[12px] font-mono text-[var(--text-secondary)] tabular-nums min-w-[50px] text-right">
                                            {count.toLocaleString()}
                                        </code>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </GlassSection>
            </div>

            <SectionDivider />

            {/* Storage buckets */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={HardDrive}
                    title="Storage Buckets"
                    subtitle={`${features?.storage?.totalBuckets || 0} buckets · ${totalFiles.toLocaleString()} files · ${storageUsedPretty}`}
                    delay={0.35}
                    accentColor="#f59e0b"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features?.storage?.buckets?.map((bucket, i) => (
                        <motion.div
                            key={bucket.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            className="relative p-5 rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 hover:border-[var(--border-medium)] transition-all group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
                                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2), transparent)" }} />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl border flex items-center justify-center"
                                            style={{ backgroundColor: "#f59e0b15", borderColor: "#f59e0b30", color: "#f59e0b" }}>
                                            <Box size={16} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">{bucket.name}</h4>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${bucket.public ? "text-emerald-400" : "text-amber-400"}`}>
                                                {bucket.public ? "Public" : "Private"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums block">{bucket.fileCount}</span>
                                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{bucket.totalPretty}</span>
                                    </div>
                                </div>
                                {/* Per-bucket usage bar */}
                                {storageUsedMb > 0 && (
                                    <div className="mt-2 mb-3">
                                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-high)] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(2, (bucket.totalBytes / (features?.storage?.usedBytes || 1)) * 100)}%` }}
                                                transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: "#f59e0b" }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[9px] text-[var(--text-muted)]">
                                                {storageUsedMb > 0 ? `${Math.round((bucket.totalBytes / (features?.storage?.usedBytes || 1)) * 100)}% of total` : "—"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)]">
                                    {bucket.fileSizeLimit && (
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-[var(--text-muted)]">Size Limit</span>
                                            <span className="text-[var(--text-secondary)] font-mono">{formatBytes(bucket.fileSizeLimit)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--text-muted)]">MIME Types</span>
                                        <span className="text-[var(--text-secondary)] font-mono">
                                            {bucket.allowedMimeTypes
                                                ? bucket.allowedMimeTypes.length + " types"
                                                : "Any"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <SectionDivider />

            {/* Auth & security */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={Lock}
                    title="Authentication & Security"
                    subtitle="Auth providers, RLS policies, and Vault secrets"
                    delay={0.45}
                    accentColor="#8b5cf6"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Auth */}
                    <FeatureCard
                        icon={Users}
                        title="Auth"
                        enabled={features?.auth?.enabled || false}
                        accent="#ec4899"
                        delay={0.5}
                        items={[
                            { label: "Provider", value: features?.auth?.provider || "—" },
                            { label: "Admin Users", value: String(features?.auth?.adminUsers || 0) },
                        ]}
                        description={features?.auth?.description || ""}
                    />

                    {/* RLS */}
                    <FeatureCard
                        icon={Shield}
                        title="Row Level Security"
                        enabled={features?.rls?.enabled || false}
                        accent="#8b5cf6"
                        delay={0.55}
                        items={[
                            { label: "Total Policies", value: String(features?.rls?.totalPolicies || 0) },
                            { label: "Status", value: "Enforced" },
                        ]}
                        description={features?.rls?.description || ""}
                    />

                    {/* Vault */}
                    <FeatureCard
                        icon={Key}
                        title="Vault Secrets"
                        enabled={features?.vault?.enabled || false}
                        accent="#f97316"
                        delay={0.6}
                        items={features?.vault?.secrets?.map(s => ({
                            label: s.replace(/_/g, " "),
                            value: "••••••",
                        })) || []}
                        description={features?.vault?.description || ""}
                    />
                </div>
            </div>

            <SectionDivider />

            {/* Edge functions */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={Zap}
                    title="Edge Functions"
                    subtitle={`${features?.edgeFunctions?.totalFunctions || 0} deployed serverless functions`}
                    delay={0.65}
                    accentColor="#06b6d4"
                />

                <GlassSection delay={0.7}>
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {features?.edgeFunctions?.functions?.map((fn, i) => (
                            <motion.div
                                key={fn.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.05 }}
                                className="px-6 py-4 flex items-center justify-between group hover:bg-[var(--surface-high)]/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
                                        style={{ backgroundColor: "#06b6d410", borderColor: "#06b6d425", color: "#06b6d4" }}>
                                        <Workflow size={14} />
                                    </div>
                                    <div>
                                        <span className="text-[12px] font-semibold text-[var(--text-primary)]">{fn.name}</span>
                                        <p className="text-[10px] text-[var(--text-muted)]">{fn.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                        <CheckCircle size={10} /> Active
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassSection>
            </div>

            <SectionDivider />

            {/* Realtime */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={Radio}
                    title="Realtime Subscriptions"
                    subtitle={features?.realtime?.description || "Live data synchronization"}
                    delay={0.75}
                    accentColor="#a855f7"
                />

                <GlassSection delay={0.8}>
                    <div className="px-6 py-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {features?.realtime?.subscribedTables?.map((table, i) => (
                                <motion.div
                                    key={table}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + i * 0.05 }}
                                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--surface-high)]/40 border border-[var(--border-subtle)]"
                                >
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] font-mono text-[var(--text-secondary)]">{table}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </GlassSection>
            </div>

            <SectionDivider />

            {/* Test connection */}
            <div className="px-8 py-6">
                <SettingsSectionHeader
                    icon={RefreshCcw}
                    title="Connection Test"
                    subtitle="Verify all Supabase services are reachable"
                    delay={0.85}
                    accentColor={SB_ACCENT}
                />

                <GlassSection delay={0.9}>
                    <div className="px-6 py-5">
                        <TestConnectionBanner
                            isTesting={isTesting}
                            testStatus={testStatus}
                            onTest={handleTest}
                            onDismiss={() => setTestStatus(null)}
                            accent={SB_ACCENT}
                        />
                    </div>
                </GlassSection>
            </div>

            {/* Dashboard link */}
            {project?.ref && (
                <div className="px-8 py-6 border-t border-[var(--border-subtle)]">
                    <motion.a
                        href={`https://supabase.com/dashboard/project/${project.ref}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.95 }}
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-[var(--border-subtle)] hover:border-[#3ECF8E]/30 text-[var(--text-muted)] hover:text-[#3ECF8E] transition-all group"
                    >
                        <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Open Supabase Dashboard</span>
                    </motion.a>
                </div>
            )}
        </IntegrationPageShell>
    );
}


function InfoRow({ icon: Icon, label, value, mono, statusDot }: {
    icon: React.ElementType;
    label: string;
    value: string;
    mono?: boolean;
    statusDot?: "green" | "gold" | null;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon size={14} className="text-[var(--text-muted)]" />
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {statusDot && (
                    <div className={`w-2 h-2 rounded-full ${statusDot === "green" ? "bg-emerald-400" : "bg-[#b48c50]"}`} />
                )}
                <code className={`text-[12px] text-[var(--text-secondary)] bg-[var(--surface-high)] px-3 py-1 rounded-lg border border-[var(--border-subtle)] ${mono ? "font-mono" : ""} max-w-[400px] truncate`}>
                    {value}
                </code>
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, enabled, accent, delay, items, description }: {
    icon: React.ElementType;
    title: string;
    enabled: boolean;
    accent: string;
    delay: number;
    items: { label: string; value: string }[];
    description: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative p-5 rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${accent}20, transparent)` }} />
            <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl border flex items-center justify-center"
                        style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                        <Icon size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${enabled ? "text-emerald-400" : "text-rose-400"}`}>
                            {enabled ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                </div>

                {description && (
                    <p className="text-[10px] text-[var(--text-muted)] mb-3">{description}</p>
                )}

                <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                    {items.map(item => (
                        <div key={item.label} className="flex justify-between text-[10px]">
                            <span className="text-[var(--text-muted)] capitalize">{item.label}</span>
                            <span className="text-[var(--text-secondary)] font-mono">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function UsageBar({ label, usedLabel, limitLabel, percent, accent, delay }: {
    label: string;
    usedLabel: string;
    limitLabel: string;
    percent: number;
    accent: string;
    delay: number;
}) {
    const isWarning = percent >= 80;
    const isCritical = percent >= 95;
    const barColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : accent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative p-5 rounded-2xl bg-[var(--surface-low)]/40 border border-[var(--border-medium)]/50 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-30"
                style={{ background: `radial-gradient(circle, ${barColor}30, transparent)` }} />
            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-semibold text-[var(--text-primary)]">{label}</span>
                    <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                        {usedLabel} <span className="text-[var(--text-muted)]">/</span> {limitLabel}
                    </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--surface-high)] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, percent)}%` }}
                        transition={{ delay: delay + 0.15, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full relative"
                        style={{ backgroundColor: barColor }}
                    >
                        <div className="absolute inset-0 rounded-full" style={{
                            background: `linear-gradient(90deg, transparent, ${barColor}40)`,
                        }} />
                    </motion.div>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-bold ${isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-[var(--text-muted)]"
                        }`}>
                        {isCritical ? "⚠ Critical" : isWarning ? "⚠ High Usage" : `${percent}% used`}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {percent < 100 ? `${100 - percent}% remaining` : "Limit reached"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
