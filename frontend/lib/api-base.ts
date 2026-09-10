const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cyp-1jps.onrender.com';

export const API_BASE = configuredApiUrl.replace(/\/$/, '');
export const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL || API_BASE.replace(/^http/, 'ws')).replace(/\/$/, '');
