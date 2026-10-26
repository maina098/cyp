const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

export const API_BASE = configuredApiUrl.replace(/\/$/, '');
export const WS_BASE = (
  process.env.NEXT_PUBLIC_WS_URL ||
  (API_BASE.startsWith('/') ? '' : API_BASE.replace(/^http/, 'ws'))
).replace(/\/$/, '');
