import type { Brief, Project, Service, Stage, Stats, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'briefboard.token';

/** Error with the HTTP status and the message Nest sent back. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const auth = {
  getToken: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Nest validation errors come as { message: string[] }, others as { message: string }.
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(res.status, msg ?? res.statusText);
  }
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export interface NewBrief {
  clientName: string;
  company?: string;
  email: string;
  services: Service[];
  budget?: string;
  deadline?: string;
  description: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: json({ email, password }),
    }),
  me: () => request<User>('/auth/me'),

  sendBrief: (brief: NewBrief) => request<Brief>('/briefs', { method: 'POST', body: json(brief) }),
  briefs: (status?: string) => request<Brief[]>(`/briefs${status ? `?status=${status}` : ''}`),
  acceptBrief: (id: string) => request<Project>(`/briefs/${id}/accept`, { method: 'PATCH' }),
  rejectBrief: (id: string) => request<Brief>(`/briefs/${id}/reject`, { method: 'PATCH' }),

  projects: () => request<Project[]>('/projects'),
  stats: () => request<Stats>('/projects/stats'),
  createProject: (data: { title: string; clientName: string; services: Service[]; dueDate?: string }) =>
    request<Project>('/projects', { method: 'POST', body: json(data) }),
  moveProject: (id: string, stage: Stage) =>
    request<Project>(`/projects/${id}/stage`, { method: 'PATCH', body: json({ stage }) }),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
};
