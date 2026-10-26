import { z } from 'zod';
import { API_ENDPOINTS } from '../api/endpoints';
import { parseApiError } from '../api/api-error';
import { userResponseSchema } from '../users/user.schema';

export const loginInputSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const registerInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    position: z.string().trim().min(1).max(100),
    password: z.string().min(12).max(128),
  })
  .strict();

const loginResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    user: userResponseSchema,
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;

export async function login(input: LoginInput): Promise<LoginResponse> {
  const validatedInput = loginInputSchema.parse(input);
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(validatedInput),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return loginResponseSchema.parse(await response.json());
}

export async function refresh(): Promise<LoginResponse | null> {
  const response = await fetch(API_ENDPOINTS.auth.refresh, {
    method: 'POST',
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw await parseApiError(response);
  }

  return loginResponseSchema.parse(await response.json());
}

export async function logout(): Promise<void> {
  const response = await fetch(API_ENDPOINTS.auth.logout, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }
}

export async function register(input: RegisterInput): Promise<void> {
  const validatedInput = registerInputSchema.parse(input);
  const response = await fetch(API_ENDPOINTS.auth.register, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedInput),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  userResponseSchema.parse(await response.json());
}
