import { z } from "zod";
import { API_ENDPOINTS } from "../api/endpoints";
import {
  createUserSchema,
  userResponseSchema,
  type CreateUserInput,
  type UserResponse,
} from "./user.schema";

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

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const validatedInput = createUserSchema.parse(input);
  const response = await fetch(API_ENDPOINTS.users.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedInput),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return userResponseSchema.parse(await response.json());
}
