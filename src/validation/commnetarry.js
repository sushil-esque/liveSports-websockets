import { z } from "zod";

// Validation schema for listing commentary query parameters
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Validation schema for creating commentary
export const createCommentarySchema = z.object({
  minutes: z.number().int().nonnegative(),
  sequence: z.unknown().optional(),
  period: z.string(),
  eventType: z.unknown().optional(),
  actor: z.unknown().optional(),
  team: z.unknown().optional(),
  message: z.string().trim().min(1, "Message is required"),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export default {
  listCommentaryQuerySchema,
  createCommentarySchema,
};
