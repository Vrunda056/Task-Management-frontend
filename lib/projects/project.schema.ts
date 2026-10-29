import { z } from 'zod';
import { userRoleSchema } from '../users/user.schema';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  description: z.string().trim().max(500).optional(),
  createdById: z.string().min(1, "User is required."),
}).strict();

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100).optional(),
  description: z.string().trim().max(500).optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided.",
);

export const projectResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().nullable(),
  createdById: z.string(),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    // role:userRoleSchema,
    position: z.string(),
  }).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
