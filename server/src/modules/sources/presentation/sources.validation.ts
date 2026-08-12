import { z } from "zod/v4";
import { SourceType } from "../../../domain/enums/source-type.enum.ts";

export const sourceNotebookParamsSchema = z.object({
  notebookId: z.string().uuid("Invalid notebook ID"),
});

export const sourceParamsSchema = z.object({
  notebookId: z.string().uuid("Invalid notebook ID"),
  id: z.string().uuid("Invalid source ID"),
});

export const createSourceBodySchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  type: z.enum(Object.values(SourceType) as [string, ...string[]], {
    error: "Invalid source type. Must be one of: pdf, text, markdown, url, youtube",
  }),
  content: z.string()
    .max(500000, "Content must be 500,000 characters or less")
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
