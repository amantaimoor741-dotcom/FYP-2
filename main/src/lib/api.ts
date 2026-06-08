const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function getToken(): Promise<string | null> {
  try {
    const demoToken = localStorage.getItem('demo_token');
    if (demoToken) return demoToken;
    if ((window as any).Clerk?.session) {
      return await (window as any).Clerk.session.getToken();
    }
  } catch (e) { console.error('Failed to get auth token:', e); }
  return null;
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'API Error');
  return data;
}

export const api = {
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append('document', file);
    return request('/documents/upload', { method: 'POST', body: form });
  },
  getDocumentContent: (id: string) => request(`/documents/${id}/content`),

  startGeneration: (documentId: string, projectName?: string, options?: { theme?: string; config?: Record<string, boolean>; model?: string }) =>
    request('/generate', { method: 'POST', body: JSON.stringify({ documentId, projectName, theme: options?.theme, config: options?.config, model: options?.model }) }),
  getGenerationStatus: (id: string) => request(`/generate/${id}/status`),
  getGenerationResult: (id: string) => request(`/generate/${id}/result`),

  getProjects: () => request('/projects'),
  getProject: (id: string) => request(`/projects/${id}`),
  deleteProject: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  downloadProject: (id: string) => `${API_BASE}/projects/${id}/download`,

  getAdminStats: () => request('/admin/stats'),
  getAdminLogs: () => request('/admin/logs'),

  submitContact: (data: { name: string; email: string; message: string }) =>
    request('/contact', { method: 'POST', body: JSON.stringify(data) }),

  getSettings: () => request('/settings'),
  updateSettings: (settings: Record<string, any>) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};
