export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/+$/, "");

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
  users: {
    collection: `${API_BASE_URL}/users`,
    byId: (id: string) => `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
  },
  projects: {
    collection: `${API_BASE_URL}/projects`,
    byId: (id: string) => `${API_BASE_URL}/projects/${encodeURIComponent(id)}`,
  },
} as const;
