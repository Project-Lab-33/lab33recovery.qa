import { NextResponse, NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";

interface DbStats {
    database_size: string;
    postgres_version: string;
    total_tables: number;
    total_rls_policies: number;
    total_indexes: number;
    total_functions: number;
    total_triggers: number;
}

interface StorageBucket {
    name: string;
    public: boolean;
    file_count: number;
    total_bytes: number;
    total_mb: number;
    total_pretty: string;
    file_size_limit: number | null;
    allowed_mime_types: string[] | null;
}

interface StorageUsage {
    total_storage_bytes: number;
    total_storage_mb: number;
    total_storage_pretty: string;
    total_files: number;
    total_buckets: number;
    buckets: StorageBucket[] | null;
}

// Pro plan limits (in bytes)
const STORAGE_LIMIT_GB = 100; // 100 GB file storage
const DATABASE_LIMIT_MB = 8192; // 8 GB database
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024;
const DATABASE_LIMIT_BYTES = DATABASE_LIMIT_MB * 1024 * 1024;

export async function GET(request: NextRequest) {
    const { supabase, user, error: authError } = await getAdminSession(request);
    if (authError || !user) return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "";

        // Database stats + Storage usage via RPC (SECURITY DEFINER — no service role needed)
        const [{ data: rawDbInfo }, { data: rawStorageUsage }] = await Promise.all([
            supabase.rpc("get_supabase_stats"),
            supabase.rpc("get_storage_usage"),
        ]);

        const dbInfo = rawDbInfo as unknown as DbStats | null;
        const storageUsage = rawStorageUsage as unknown as StorageUsage | null;

        let databaseSize = "Unknown";
        let postgresVersion = "Unknown";
        let totalTables = 0;
        let totalRlsPolicies = 0;
        let totalIndexes = 0;
        let totalFunctions = 0;
        let totalTriggers = 0;

        if (dbInfo) {
            databaseSize = dbInfo.database_size;
            postgresVersion = dbInfo.postgres_version;
            totalTables = dbInfo.total_tables;
            totalRlsPolicies = dbInfo.total_rls_policies;
            totalIndexes = dbInfo.total_indexes;
            totalFunctions = dbInfo.total_functions;
            totalTriggers = dbInfo.total_triggers;
        }

        const countTables = [
            "waitlist", "job_applications", "positions",
            "email_logs", "email_templates", "email_automations",
            "admin_activity_logs", "admin_notifications", "admin_users",
            "site_settings", "system_logs",
        ];

        const [adminCountResult, ...tableCountResults] = await Promise.all([
            supabase.from("admin_users").select("*", { count: "exact", head: true }),
            ...countTables.map(table =>
                supabase.from(table).select("*", { count: "exact", head: true })
            ),
        ]);

        const adminUserCount = adminCountResult.count || 0;

        const tableCounts: Record<string, number> = {};
        countTables.forEach((table, i) => {
            tableCounts[table] = tableCountResults[i].count || 0;
        });

        const bucketStats = (storageUsage?.buckets || []).map(b => ({
            name: b.name,
            public: b.public,
            fileCount: b.file_count,
            totalBytes: b.total_bytes,
            totalMb: b.total_mb,
            totalPretty: b.total_pretty,
            fileSizeLimit: b.file_size_limit,
            allowedMimeTypes: b.allowed_mime_types,
        }));

        const totalStorageBytes = storageUsage?.total_storage_bytes || 0;
        const totalStorageMb = storageUsage?.total_storage_mb || 0;
        const totalFiles = storageUsage?.total_files || 0;

        // Parse database size to bytes for quota calculation
        const dbSizeMatch = databaseSize.match(/([\d.]+)\s*(MB|GB|KB|bytes)/i);
        let dbSizeBytes = 0;
        if (dbSizeMatch) {
            const val = parseFloat(dbSizeMatch[1]);
            const unit = dbSizeMatch[2].toUpperCase();
            if (unit === "GB") dbSizeBytes = val * 1024 * 1024 * 1024;
            else if (unit === "MB") dbSizeBytes = val * 1024 * 1024;
            else if (unit === "KB") dbSizeBytes = val * 1024;
            else dbSizeBytes = val;
        }

        const realtimeTables = ["admin_notifications"];

        const edgeFunctions = [
            { name: "invite-user", description: "Sends admin invitation emails" },
            { name: "delete-user", description: "Handles user deletion securely" },
            { name: "reset-password", description: "Manages password reset flow" },
        ];

        return NextResponse.json({
            project: {
                ref: projectRef,
                url: supabaseUrl,
                region: "ap-south-1",
                name: "Lab33 (Website)",
                status: "ACTIVE_HEALTHY",
                postgresVersion,
                databaseSize,
            },
            features: {
                auth: {
                    enabled: true,
                    provider: "Email/Password",
                    adminUsers: adminUserCount,
                    description: "Admin authentication with role-based permissions",
                },
                database: {
                    enabled: true,
                    totalTables,
                    totalRlsPolicies,
                    totalIndexes,
                    totalFunctions,
                    totalTriggers,
                    tableCounts,
                    // Quota info
                    sizeBytes: dbSizeBytes,
                    sizePretty: databaseSize,
                    limitBytes: DATABASE_LIMIT_BYTES,
                    limitMb: DATABASE_LIMIT_MB,
                    usagePercent: dbSizeBytes > 0 ? Math.round((dbSizeBytes / DATABASE_LIMIT_BYTES) * 100) : 0,
                },
                storage: {
                    enabled: true,
                    buckets: bucketStats,
                    totalBuckets: bucketStats.length,
                    totalFiles,
                    // Usage & quota
                    usedBytes: totalStorageBytes,
                    usedMb: totalStorageMb,
                    usedPretty: storageUsage?.total_storage_pretty || "0 bytes",
                    limitBytes: STORAGE_LIMIT_BYTES,
                    limitGb: STORAGE_LIMIT_GB,
                    remainingBytes: Math.max(0, STORAGE_LIMIT_BYTES - totalStorageBytes),
                    remainingMb: Math.round(Math.max(0, STORAGE_LIMIT_BYTES - totalStorageBytes) / 1048576 * 100) / 100,
                    usagePercent: totalStorageBytes > 0 ? Math.round((totalStorageBytes / STORAGE_LIMIT_BYTES) * 100) : 0,
                },
                realtime: {
                    enabled: true,
                    subscribedTables: realtimeTables,
                    description: "Live updates for content, notifications, and health checks",
                },
                edgeFunctions: {
                    enabled: true,
                    functions: edgeFunctions,
                    totalFunctions: edgeFunctions.length,
                },
                vault: {
                    enabled: true,
                    description: "Secure storage for API keys.",
                    secrets: ["resend_api_key"],
                },
                rls: {
                    enabled: true,
                    totalPolicies: totalRlsPolicies,
                    description: "Row Level Security on all public tables",
                },
            },
            configured: true,
            connected: true,
        });
    } catch (err) {
        console.error("[SupabaseSettings] Error:", err);
        return NextResponse.json({
            error: "Failed to fetch Supabase stats",
            configured: false,
            connected: false,
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { user, error: authError } = await getAdminSession(request);
    if (authError || !user) return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();

        if (body.action === "test_connection") {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

            if (!supabaseUrl || !supabaseKey) {
                return NextResponse.json({
                    error: "Supabase environment variables not configured",
                }, { status: 400 });
            }

            const checks: Record<string, string> = {};
            const start = Date.now();

            const [restRes, authRes, storageRes, realtimeRes] = await Promise.allSettled([
                fetch(`${supabaseUrl}/rest/v1/site_settings?select=key&limit=1`, {
                    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
                }),
                fetch(`${supabaseUrl}/auth/v1/health`, {
                    headers: { apikey: supabaseKey },
                }),
                fetch(`${supabaseUrl}/storage/v1/bucket`, {
                    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
                }),
                fetch(`${supabaseUrl}/realtime/v1/api/health`, {
                    headers: { apikey: supabaseKey },
                }),
            ]);

            checks["REST API"] = restRes.status === "fulfilled" && restRes.value.ok ? "✓ Healthy" : restRes.status === "fulfilled" ? `✗ HTTP ${restRes.value.status}` : "✗ Unreachable";
            checks["Auth Service"] = authRes.status === "fulfilled" && authRes.value.ok ? "✓ Healthy" : authRes.status === "fulfilled" ? `✗ HTTP ${authRes.value.status}` : "✗ Unreachable";
            checks["Storage"] = storageRes.status === "fulfilled" && (storageRes.value.ok || storageRes.value.status === 400) ? "✓ Healthy" : storageRes.status === "fulfilled" ? `✗ HTTP ${storageRes.value.status}` : "✗ Unreachable";
            checks["Realtime"] = realtimeRes.status === "fulfilled" && (realtimeRes.value.ok || realtimeRes.value.status < 500) ? "✓ Healthy" : realtimeRes.status === "fulfilled" ? `✗ HTTP ${realtimeRes.value.status}` : "✗ Unreachable";

            const elapsed = Date.now() - start;
            const allHealthy = Object.values(checks).every(v => v.startsWith("✓"));

            return NextResponse.json({
                message: allHealthy
                    ? `All Supabase services healthy (${elapsed}ms)`
                    : `Some services have issues (${elapsed}ms)`,
                details: checks,
            });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err) {
        console.error("[SupabaseSettings] POST error:", err);
        return NextResponse.json({ error: "Request failed" }, { status: 500 });
    }
}
