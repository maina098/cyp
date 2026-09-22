import { API_BASE } from './api-base';

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export type Overview = {
  stats: {
    governors: number;
    secretariat: number;
    news: number;
    events: number;
    resources: number;
  };
  sections: string[];
};

export type ContentItem = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  description?: string;
  location?: string;
  date?: string;
  fileUrl?: string;
  publishedAt?: string;
};

export type MemberDashboard = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    profileImageUrl?: string | null;
    phone?: string | null;
    county?: string | null;
    constituency?: string | null;
    bio?: string | null;
  };
  stats: {
    eventsAttended: number;
    newsRead: number;
    publishedContentRead: number;
    publishedContentTotal: number;
    communityScore: number;
    communityServicesInitiated: number;
  };
  recentActivity: Array<{ id: string; action: string; details?: string; createdAt: string }>;
  events: Array<{ id: string; title: string; description?: string; mediaUrl?: string; mediaType?: string; status: string; createdAt: string; event: ContentItem }>;
  resources: ContentItem[];
  elections: Election[];
};

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const request = () => fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers || {}),
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
  });

  let response = await request();
  if (response.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) response = await request();
  }

  return response;
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(path, init);
  const payload = await parseJsonResponse<T & { message?: string | string[] }>(response);

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message || `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return (payload ?? ({} as T));
}

async function responseMessage(response: Response): Promise<string> {
  const payload = await parseJsonResponse<{ message?: string | string[] }>(response);
  return Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message || `Request failed (${response.status})`;
}

async function authenticatedJson<T>(token: string, path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await authenticatedFetch(path, init);
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

async function adminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  return adminFetch<T>(path, init);
}

export function getMemberDashboard(token: string) {
  return authenticatedJson<MemberDashboard>(token, '/users/me/dashboard');
}

export function logoutSession() {
  return fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function requestVotingOtp(electionId: string) {
  const response = await authenticatedFetch(`/elections/${electionId}/vote/otp/request`, { method: 'POST' });
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
  return response.json() as Promise<{ otpId: string; expiresAt: string; message: string }>;
}

export async function verifyVotingOtp(electionId: string, otpId: string, otpCode: string) {
  const response = await authenticatedFetch(`/elections/${electionId}/vote/otp/verify`, {
    method: 'POST',
    body: JSON.stringify({ otpId, otpCode }),
  });
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
  return response.json() as Promise<{ valid: boolean; otpId: string; expiresAt: string; message: string }>;
}

export async function createVotingSession(electionId: string, otpId: string) {
  const response = await authenticatedFetch(`/elections/${electionId}/vote/session`, {
    method: 'POST',
    body: JSON.stringify({ otpId }),
  });
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
  return response.json() as Promise<{ sessionId: string; expiresAt: string; message: string }>;
}

export async function castElectionVote(electionId: string, candidateId: string) {
  const response = await authenticatedFetch(`/elections/${electionId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ candidateId }),
  });
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
  return response.json();
}

export function updateMemberProfile(token: string, data: Record<string, string>) {
  return authenticatedJson<MemberDashboard['user']>(token, '/users/me', { method: 'PATCH', body: JSON.stringify(data) });
}

export function changeMemberPassword(token: string, currentPassword: string, newPassword: string) {
  return authenticatedJson<{ message: string }>(token, '/users/me/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) });
}

export async function uploadMemberFile(token: string, file: File) {
  const formData = new FormData();
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
    return null;
  }
  formData.append('file', file);
  try {
    const response = await fetch(`${API_BASE}/users/me/uploads`, { method: 'POST', credentials: 'include', body: formData });
    return response.ok ? response.json() as Promise<{ url: string; mediaType: string }> : null;
  } catch {
    return null;
  }
}

export function uploadProfilePicture(token: string, file: File) {
  const formData = new FormData();
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return Promise.resolve(null);
  }
  formData.append('file', file);
  return fetch(`${API_BASE}/users/me/profile-picture`, { method: 'POST', credentials: 'include', body: formData }).then((response) => response.ok ? response.json() : null).catch(() => null);
}

export function submitEventParticipation(token: string, eventId: string, data: { title: string; description?: string; mediaUrl?: string; mediaType?: string }) {
  return authenticatedJson(token, `/users/me/events/${eventId}/participation`, { method: 'POST', body: JSON.stringify(data) });
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    return null;
  }
}

export async function getOverview(): Promise<Overview | null> {
  return fetchJson<Overview>('/content/overview');
}

export async function getNews(): Promise<ContentItem[]> {
  const data = await fetchJson<ContentItem[]>('/content/news');
  return Array.isArray(data) ? data : [];
}

export type AdminNewsPost = ContentItem & { slug: string; published: boolean; author?: string; createdAt?: string };

export async function getAdminNews(token: string): Promise<AdminNewsPost[]> {
  const response = await adminJson<{ data?: AdminNewsPost[] }>('/admin/news');
  return response?.data || [];
}

export function createAdminNews(token: string, data: { title: string; slug: string; summary: string; content: string; category: string; published: boolean }) {
  return adminJson<AdminNewsPost>('/admin/news', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAdminNews(token: string, id: string, data: Partial<{ title: string; slug: string; summary: string; content: string; category: string; published: boolean }>) {
  return adminJson<AdminNewsPost>(`/admin/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function getEvents(): Promise<ContentItem[]> {
  const data = await fetchJson<ContentItem[]>('/content/events');
  return Array.isArray(data) ? data : [];
}

export async function getResources(): Promise<ContentItem[]> {
  const data = await fetchJson<ContentItem[]>('/content/resources');
  return Array.isArray(data) ? data : [];
}

export type AuthResponse = { token?: string; access_token?: string; message?: string; user?: { id: string; email: string; name: string; role: string } };

export async function signIn(emailOrUsername: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrUsername, password }),
    });

    const data = await parseJsonResponse<AuthResponse>(res);
    if (!res.ok) {
      return { message: data?.message || `Login failed (${res.status})` };
    }

    return data || {};
  } catch {
    return { message: 'Network error: unable to reach the backend server.' };
  }
}

export async function signUp(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await parseJsonResponse<AuthResponse>(res);
    if (!res.ok) {
      return { message: data?.message || `Registration failed (${res.status})` };
    }

    return data || {};
  } catch (e) {
    return { message: 'Network error: unable to reach the backend server.' };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await parseJsonResponse<{ message?: string }>(response) || {};
  } catch {
    return { message: 'If an account exists for that email, password reset instructions have been sent.' };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/password-reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await parseJsonResponse<{ message?: string }>(response);
    return response.ok ? data : { message: data?.message || 'Unable to reset password.' };
  } catch {
    return { message: 'Unable to reset password.' };
  }
}

export async function verifyEmail(token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await parseJsonResponse<{ message?: string }>(response);
    return response.ok ? data : { message: data?.message || 'Unable to verify email.' };
  } catch {
    return { message: 'Unable to verify email.' };
  }
}

// Elections API
export type Election = {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'closed';
  startsAt: string;
  endsAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  candidates?: any[];
  positions?: ElectionPosition[];
};

export type ElectionPosition = {
  id: string;
  electionId: string;
  title: string;
  description?: string;
  isOpen: boolean;
  maxApplicants: number;
  createdAt: string;
  updatedAt: string;
};

export type ElectionApplication = {
  id: string;
  positionId: string;
  userId: string;
  electionId: string;
  name: string;
  email: string;
  county: string;
  constituency?: string;
  age?: number;
  description: string;
  reasonForApplying?: string;
  changeChampion: string;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: string;
  updatedAt: string;
  position?: ElectionPosition;
};

export async function getElections(): Promise<Election[]> {
  const data = await fetchJson<Election[] | { data?: Election[] }>('/elections?limit=100');
  return Array.isArray(data) ? data : data?.data || [];
}

export function createElection(token: string, data: {
  title: string;
  description?: string;
  status?: Election['status'];
  startsAt: string;
  endsAt: string;
  candidates: Array<{ name: string; bio?: string }>;
}) {
  return authenticatedJson<Election>(token, '/elections', { method: 'POST', body: JSON.stringify(data) });
}

export async function getElectionById(id: string): Promise<Election | null> {
  return fetchJson<Election>(`/elections/${id}`);
}

export async function getElectionPositions(electionId: string): Promise<ElectionPosition[]> {
  const election = await getElectionById(electionId);
  return election?.positions || [];
}

export function transitionElectionStatus(token: string, electionId: string, status: Election['status']) {
  return adminFetch<Election & { message?: string }>(`/elections/${electionId}/transition-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    cache: 'no-store',
  });
}

export function addElectionCandidate(token: string, electionId: string, data: { name: string; bio?: string; position?: number; positionId?: string }) {
  return authenticatedJson<{ id: string; name: string; bio?: string | null; photoUrl?: string | null; position?: number }>(token, `/elections/${electionId}/candidates`, { method: 'POST', body: JSON.stringify(data) });
}

export function deleteElectionCandidate(token: string, electionId: string, candidateId: string) {
  return authenticatedJson<{ success: boolean }>(token, `/elections/${electionId}/candidates/${candidateId}`, { method: 'DELETE' });
}

export async function getUserApplications(token: string): Promise<ElectionApplication[]> {
  try {
    const response = await fetch(`${API_BASE}/applications/mine`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export async function submitApplication(
  token: string,
  positionId: string,
  electionId: string,
  data: {
    name: string;
    email: string;
    county: string;
    constituency?: string;
    age: number;
    description: string;
    reasonForApplying?: string;
    changeChampion: string;
    comments?: string;
  }
): Promise<{ success: boolean; data?: ElectionApplication; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        positionId,
        electionId,
        ...data,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to submit application' };
    }
    const result = await response.json();
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}

export async function getApplicationStats(electionId: string, token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/applications/stats/${electionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getApplicationsByPosition(positionId: string, token: string): Promise<ElectionApplication[]> {
  try {
    const response = await fetch(`${API_BASE}/applications/position/${positionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export async function updateApplicationStatus(
  token: string,
  applicationId: string,
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
): Promise<{ success: boolean; data?: ElectionApplication; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to update status' };
    }
    const result = await response.json();
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}

export async function openApplications(
  token: string,
  electionId: string,
  positionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/admin/positions/${positionId}/open`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ electionId }),
    });
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to open applications' };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}

export async function closeApplications(
  token: string,
  electionId: string,
  positionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/admin/positions/${positionId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ electionId }),
    });
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to close applications' };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}

export async function getAllApplications(
  token: string,
  filters?: {
    electionId?: string;
    positionId?: string;
    status?: string;
    county?: string;
  }
): Promise<ElectionApplication[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.electionId) params.append('electionId', filters.electionId);
    if (filters?.positionId) params.append('positionId', filters.positionId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.county) params.append('county', filters.county);

    const response = await fetch(`${API_BASE}/applications?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export type AdminEvent = ContentItem & { date: string; status: string; imageUrl?: string };
export type AdminResource = ContentItem & { fileUrl: string; downloadsCount?: number };

export async function getAdminApplications(token: string, electionId?: string): Promise<ElectionApplication[]> {
  const baseParams = new URLSearchParams({ limit: '100' });
  if (electionId) baseParams.set('electionId', electionId);
  const firstPage = await adminJson<{ data?: ElectionApplication[]; meta?: { totalPages?: number } } | ElectionApplication[]>(`/admin/applications?${baseParams.toString()}`);
  if (Array.isArray(firstPage)) return firstPage;

  const applications = firstPage.data || [];
  const totalPages = firstPage.meta?.totalPages || 1;
  if (totalPages <= 1) return applications;

  const remainingPages = await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => {
    const params = new URLSearchParams(baseParams);
    params.set('page', String(index + 2));
    return adminJson<{ data?: ElectionApplication[] }>(`/admin/applications?${params.toString()}`);
  }));
  return applications.concat(...remainingPages.map((page) => page?.data || []));
}

export type AdminMember = {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImageUrl?: string | null;
  phone?: string | null;
  county?: string | null;
  constituency?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { activities: number; applications: number; votes: number };
};

export function getAdminMembers(token: string) {
  return adminJson<AdminMember[]>('/admin/users').then((data) => Array.isArray(data) ? data : []);
}

export function updateAdminMemberRole(token: string, userId: string, role: string) {
  return adminJson<{ id: string; email: string; name: string; role: string }>(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export type AdminActivity = {
  id: string;
  userId: string;
  email: string;
  name: string;
  action: string;
  details?: string | null;
  createdAt: string;
};

export function getSystemActivity(token: string, limit = 50) {
  return adminJson<{ data?: AdminActivity[] }>(`/admin/activity?limit=${limit}`).then((data) => data?.data || []);
}

export function approveElectionApplication(token: string, electionId: string, applicationId: string) {
  return adminJson<ElectionApplication>(`/elections/${electionId}/applications/${applicationId}/approve`, { method: 'POST' }).then((data) => ({ success: true, data }));
}

export function rejectElectionApplication(token: string, electionId: string, applicationId: string) {
  return adminJson<ElectionApplication>(`/elections/${electionId}/applications/${applicationId}/reject`, { method: 'POST' }).then((data) => ({ success: true, data }));
}

export function getAdminEvents(token: string) {
  return adminJson<AdminEvent[]>('/admin/events').then((data) => Array.isArray(data) ? data : []);
}

export type MemberEventSubmission = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  user: { id: string; name: string; email: string; profileImageUrl?: string | null };
  event: AdminEvent;
};

export function getMemberEventSubmissions(token: string) {
  return adminJson<MemberEventSubmission[]>('/admin/member-submissions/events').then((data) => Array.isArray(data) ? data : []);
}

export function updateMemberEventSubmissionStatus(token: string, submissionId: string, status: string) {
  return adminJson<MemberEventSubmission>(`/admin/member-submissions/events/${submissionId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function createAdminEvent(token: string, data: { title: string; description: string; location: string; date: string; status?: string; imageUrl?: string }) {
  return adminJson<AdminEvent>('/admin/events', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteAdminEvent(token: string, eventId: string) {
  return adminJson(`/admin/events/${eventId}`, { method: 'DELETE' });
}

export function getAdminResources(token: string) {
  return adminJson<AdminResource[]>('/admin/resources').then((data) => Array.isArray(data) ? data : []);
}

export function createAdminResource(token: string, data: { title: string; description?: string; fileUrl: string; category: string }) {
  return adminJson<AdminResource>('/admin/resources', { method: 'POST', body: JSON.stringify(data) });
}

export async function uploadAdminResource(token: string, file: File) {
  const formData = new FormData();
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'video/webm'];
  if (!allowed.includes(file.type) && !['image/', 'video/'].some((prefix) => file.type.startsWith(prefix))) {
    return null;
  }
  formData.append('file', file);
  try {
    const response = await fetch(`${API_BASE}/admin/resources/upload`, { method: 'POST', credentials: 'include', body: formData });
    return response.ok ? response.json() as Promise<{ url: string }> : null;
  } catch {
    return null;
  }
}

export function deleteAdminResource(token: string, resourceId: string) {
  return adminJson(`/admin/resources/${resourceId}`, { method: 'DELETE' });
}

export async function getSystemHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    return { ok: response.ok, data: await response.json().catch(() => null) };
  } catch {
    return { ok: false, data: null };
  }
}
