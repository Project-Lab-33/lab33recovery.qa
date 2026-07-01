import { createClient } from '@supabase/supabase-js';

const secretsCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let _vaultClient: ReturnType<typeof createClient> | null = null;

function getVaultClient() {
    if (!_vaultClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        }
        _vaultClient = createClient(url, key);
    }
    return _vaultClient;
}

export async function getSecret(name: string): Promise<string> {
    const cached = secretsCache.get(name);
    if (cached && Date.now() < cached.expiry) {
        return cached.value;
    }

    const client = getVaultClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any).rpc('get_secret', { secret_name: name });

    if (error) {
        throw new Error(`Failed to fetch secret "${name}": ${error.message}`);
    }

    if (data === null || data === undefined) {
        throw new Error(`Secret "${name}" not found in Vault`);
    }

    const value = String(data);
    secretsCache.set(name, { value, expiry: Date.now() + CACHE_TTL_MS });
    return value;
}

export async function getSecrets(names: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const uncached: string[] = [];

    for (const name of names) {
        const cached = secretsCache.get(name);
        if (cached && Date.now() < cached.expiry) {
            result[name] = cached.value;
        } else {
            uncached.push(name);
        }
    }

    if (uncached.length > 0) {
        const fetched = await Promise.all(
            uncached.map(name => getSecret(name).then(value => ({ name, value })))
        );
        for (const { name, value } of fetched) {
            result[name] = value;
        }
    }

    return result;
}
