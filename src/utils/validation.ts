import { z } from "zod";

// Chat request validation
export const ChatRequestSchema = z.object({
  sessionId: z.string().uuid().optional().nullable(),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long"),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Session ID validation
export const SessionIdSchema = z.string().uuid("Invalid session ID");

// Query parameters validation
export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Helper function to validate and parse
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    throw {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    };
  }
  return result.data;
}
