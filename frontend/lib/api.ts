const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

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

async function authenticatedJson<T>(token: string, path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
      cache: 'no-store',
    });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

export function getMemberDashboard(token: string) {
  return authenticatedJson<MemberDashboard>(token, '/users/me/dashboard');
}

export function updateMemberProfile(token: string, data: Record<string, string>) {
  return authenticatedJson<MemberDashboard['user']>(token, '/users/me', { method: 'PATCH', body: JSON.stringify(data) });
}

export function changeMemberPassword(token: string, currentPassword: string, newPassword: string) {
  return authenticatedJson<{ message: string }>(token, '/users/me/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) });
}

export async function uploadMemberFile(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`${API_BASE}/users/me/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    return response.ok ? response.json() as Promise<{ url: string; mediaType: string }> : null;
  } catch {
    return null;
  }
}

export function uploadProfilePicture(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API_BASE}/users/me/profile-picture`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }).then((response) => response.ok ? response.json() : null).catch(() => null);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrUsername, password }),
    });

    const data = await parseJsonResponse<AuthResponse>(res);
    if (!res.ok) {
      return { message: data?.message || `Login failed (${res.status})` };
    }

    return data || {};
  } catch (e) {
    return { message: 'Network error: unable to reach the backend server.' };
  }
}

export async function signUp(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
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
  const data = await fetchJson<Election[]>('/elections');
  return Array.isArray(data) ? data : [];
}

export async function getElectionById(id: string): Promise<Election | null> {
  return fetchJson<Election>(`/elections/${id}`);
}

export async function getElectionPositions(electionId: string): Promise<ElectionPosition[]> {
  const election = await getElectionById(electionId);
  return election?.positions || [];
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
