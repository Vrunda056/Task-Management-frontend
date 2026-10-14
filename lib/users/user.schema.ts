import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(254),
  }).strict();

export const userResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.email(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
