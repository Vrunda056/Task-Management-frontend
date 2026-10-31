import { z } from "zod";
import { API_ENDPOINTS } from "../api/endpoints";
import { authenticatedFetch } from "../api/api-client";
import { parseApiError } from "../api/api-error";
import {
  createUserSchema,
  updateProfileSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateProfileInput,
  type UpdateUserInput,
  userResponseSchema,
  type UserResponse,
} from "./user.schema";

export async function createUser(
  input: CreateUserInput,
  accessToken: string | null,
): Promise<UserResponse> {
  const validatedInput = createUserSchema.parse(input);
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.collection, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return userResponseSchema.parse(await response.json());
}

export async function getUsers(accessToken: string | null): Promise<UserResponse[]> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.collection, { cache: "no-store" });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return z.array(userResponseSchema).parse(await response.json());
}

export async function getUser(id: string, accessToken: string | null): Promise<UserResponse> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.byId(id), { cache: "no-store" });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return userResponseSchema.parse(await response.json());
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  accessToken: string | null,
): Promise<UserResponse> {
  const validatedInput = updateUserSchema.parse(input);
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.byId(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return userResponseSchema.parse(await response.json());
}

export async function deleteUser(
  id: string,
  accessToken: string | null,
): Promise<void> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.byId(id), {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
}

export async function getMyProfile(accessToken: string | null): Promise<UserResponse> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.me, { cache: "no-store" });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return userResponseSchema.parse(await response.json());
}

export async function updateMyProfile(
  input: UpdateProfileInput,
  accessToken: string | null,
): Promise<UserResponse> {
  const validatedInput = updateProfileSchema.parse(input);
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.users.me, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return userResponseSchema.parse(await response.json());
}
