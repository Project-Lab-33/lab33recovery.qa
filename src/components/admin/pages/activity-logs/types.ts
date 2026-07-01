export type ActivityAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'status_change'
    | 'export'
    | 'login'
    | 'logout'
    | 'toggle'
    | 'send';

export type ActivityResourceType =
    | 'waitlist'
    | 'applicant'
    | 'position'
    | 'post'
    | 'email_template'
    | 'email_automation'
    | 'email'
    | 'settings'
    | 'user'
    | 'ai'
    | 'knowledge_base';

export interface ActivityLog {
    id: string;
    actor_id: string | null;
    actor_name: string;
    action: ActivityAction;
    resource_type: ActivityResourceType;
    resource_id: string | null;
    resource_label: string | null;
    details: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
}

export interface ActivityActor {
    id: string;
    name: string;
    avatar_url: string | null;
}

export interface ActivityLogsResponse {
    logs: ActivityLog[];
    total: number;
    page: number;
    limit: number;
    actors: ActivityActor[];
}

// System Logs Types

export type SystemLogLevel = 'info' | 'warn' | 'error' | 'fatal';
export type SystemLogSource = 'api' | 'webhook' | 'cron' | 'auth' | 'email' | 'ai' | 'storage' | 'system';

export interface SystemLog {
    id: string;
    level: SystemLogLevel;
    source: SystemLogSource;
    message: string;
    path: string | null;
    method: string | null;
    status_code: number | null;
    error_stack: string | null;
    metadata: Record<string, unknown>;
    user_id: string | null;
    ip_address: string | null;
    duration_ms: number | null;
    created_at: string;
}

export interface SystemLogsResponse {
    logs: SystemLog[];
    total: number;
    page: number;
    limit: number;
}

// Auth Logs Types

export interface AuthLog {
    id: string;
    actor_id: string | null;
    actor_name: string;
    action: 'login' | 'logout';
    resource_type: string;
    resource_id: string | null;
    resource_label: string | null;
    details: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    last_sign_in_at: string | null;
    is_active: boolean;
}

export interface AuthLogsResponse {
    logs: AuthLog[];
    total: number;
    page: number;
    limit: number;
    users: AuthUser[];
}

export type LogsTab = 'activity' | 'auth' | 'system';
