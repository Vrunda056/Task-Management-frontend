import { z } from 'zod';

export const userRoleSchema = z.enum(['MANAGER', 'DEVELOPER']);

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.email().max(254),
  position: z.string().trim().min(1, "Position is required.").max(100),
}).strict();

export const updateUserSchema = createUserSchema.partial().extend({
  role: userRoleSchema.optional(),
}).refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided.",
);

export const userResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.email(),
  position: z.string(),
  role: userRoleSchema,
  sheetUrl: z.url().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export type UserRole = z.infer<typeof userRoleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
