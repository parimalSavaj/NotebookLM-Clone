import { z } from "zod/v4";

export const createNotebookBodySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  emoji: z.string().max(10).optional(),
});

export const notebookParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateNotebookBodySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
});

export const updateNotebookSettingsBodySchema = z.object({
  aiProvider: z.enum(["openai", "google", "anthropic", "groq"]),
  aiModel: z.string().min(1).max(100),
});
