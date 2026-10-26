import { z } from "zod";
import { API_ENDPOINTS } from "../api/endpoints";
import { authenticatedFetch } from "../api/api-client";
import { parseApiError } from "../api/api-error";
import {
  createProjectSchema,
  updateProjectSchema,
  type UpdateProjectInput,
  projectResponseSchema,
  type CreateProjectInput,
  type ProjectResponse,
} from "./project.schema";

export async function createProject(
  input: CreateProjectInput,
  accessToken: string | null,
): Promise<ProjectResponse> {
  const validatedInput = createProjectSchema.parse(input);
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.projects.collection, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return projectResponseSchema.parse(await response.json());
}

export async function getProjects(accessToken: string | null): Promise<ProjectResponse[]> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.projects.collection, { cache: "no-store" });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return z.array(projectResponseSchema).parse(await response.json());
}

export async function getProject(id: string, accessToken: string | null): Promise<ProjectResponse> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.projects.byId(id), { cache: "no-store" });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return projectResponseSchema.parse(await response.json());
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
  accessToken: string | null,
): Promise<ProjectResponse> {
  const validatedInput = updateProjectSchema.parse(input);
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.projects.byId(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return projectResponseSchema.parse(await response.json());
}

export async function deleteProject(
  id: string,
  accessToken: string | null,
): Promise<void> {
  const response = await authenticatedFetch(accessToken, API_ENDPOINTS.projects.byId(id), {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
}
