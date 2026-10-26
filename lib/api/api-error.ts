import { z } from 'zod';

const apiErrorSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
});

export async function parseApiError(response: Response): Promise<Error> {
  const body: unknown = await response.json().catch(() => null);
  const result = apiErrorSchema.safeParse(body);

  if (!result.success) {
    return new Error(`Request failed with HTTP ${response.status}.`);
  }

  const message = result.data.message;
  return new Error(Array.isArray(message) ? message.join(', ') : message);
}
