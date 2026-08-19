import { z } from "zod/v4";

export const chatNotebookParamsSchema = z.object({
  notebookId: z.string().uuid(),
});

export const chatConversationParamsSchema = z.object({
  notebookId: z.string().uuid(),
  conversationId: z.string().uuid(),
});

export const sendMessageBodySchema = z.object({
  conversationId: z.string().uuid().nullable(),
  message: z.string().min(1).max(10000),
});

export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  before: z.string().uuid().optional(),
});
