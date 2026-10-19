import { z } from "zod";
import { API_ENDPOINTS } from "../api/endpoints";
import {
  createProjectSchema,
  updateProjectSchema,
  type UpdateProjectInput,
  projectResponseSchema,
  type CreateProjectInput,
  type ProjectResponse,
} from "./project.schema";

const apiErrorSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
});

async function parseError(response: Response): Promise<Error> {
  const body: unknown = await response.json().catch(() => null);
  const result = apiErrorSchema.safeParse(body);

  if (!result.success) {
    return new Error(`Request failed with HTTP ${response.status}.`);
  }

  const message = result.data.message;

  if (Array.isArray(message)) {
    return new Error(message.join(", "));
  }

  return new Error(message);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectResponse> {
  const validatedInput = createProjectSchema.parse(input);
  const response = await fetch(API_ENDPOINTS.projects.collection, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return projectResponseSchema.parse(await response.json());
}

export async function getProjects(): Promise<ProjectResponse[]> {
  const response = await fetch(API_ENDPOINTS.projects.collection, { cache: "no-store" });
  if (!response.ok) {
    throw await parseError(response);
  }
  return z.array(projectResponseSchema).parse(await response.json());
}

export async function getProject(id: string): Promise<ProjectResponse> {
  const response = await fetch(API_ENDPOINTS.projects.byId(id), { cache: "no-store" });
  if (!response.ok) {
    throw await parseError(response);
  }
  return projectResponseSchema.parse(await response.json());
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<ProjectResponse> {
  const validatedInput = updateProjectSchema.parse(input);
  const response = await fetch(API_ENDPOINTS.projects.byId(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return projectResponseSchema.parse(await response.json());
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.projects.byId(id), {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await parseError(response);
  }
}
