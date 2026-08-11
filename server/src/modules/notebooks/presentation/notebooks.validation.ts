import { z } from "zod/v4";

export const createNotebookBodySchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z.string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  emoji: z.string().max(10, "Emoji must be 10 characters or less").optional(),
});

export const notebookParamsSchema = z.object({
  id: z.string().uuid("Invalid notebook"),
});

export const updateNotebookBodySchema = z.object({
  title: z.string()
    .min(1, "Title cannot be empty")
    .max(100, "Title must be 100 characters or less")
    .optional(),
  description: z.string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  emoji: z.string().max(10, "Emoji must be 10 characters or less").nullable().optional(),
});

export const updateNotebookSettingsBodySchema = z.object({
  aiProvider: z.enum(["openai", "google", "anthropic", "groq"], {
    error: "Invalid AI provider",
  }),
  aiModel: z.string()
    .min(1, "AI model is required")
    .max(100, "AI model must be 100 characters or less"),
});
