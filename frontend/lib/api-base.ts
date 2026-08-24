const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_BASE = configuredApiUrl.replace(/\/$/, '');
export const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL || API_BASE.replace(/^http/, 'ws')).replace(/\/$/, '');
