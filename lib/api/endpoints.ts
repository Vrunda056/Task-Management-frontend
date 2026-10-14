export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/+$/, "");

export const API_ENDPOINTS = {
  users: {
    create: `${API_BASE_URL}/users`,
  },
} as const;
