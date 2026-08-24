"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDatabaseUrl = normalizeDatabaseUrl;
function normalizeDatabaseUrl(databaseUrl) {
    if (!databaseUrl)
        return '';
    const trimmedUrl = databaseUrl.trim();
    if (!trimmedUrl)
        return '';
    try {
        const url = new URL(trimmedUrl);
        const host = url.hostname.toLowerCase();
        const remoteHosts = [
            'render.com',
            'supabase.co',
            'supabase.com',
            'neon.tech',
            'railway.app',
            'fly.dev',
            'amazonaws.com',
            'postgresql.com',
        ];
        const isRemoteHost = remoteHosts.some((domain) => host.includes(domain));
        if (isRemoteHost && !url.searchParams.has('sslmode')) {
            url.searchParams.set('sslmode', 'require');
        }
        return url.toString();
    }
    catch {
        return trimmedUrl;
    }
}
//# sourceMappingURL=database-url.js.map