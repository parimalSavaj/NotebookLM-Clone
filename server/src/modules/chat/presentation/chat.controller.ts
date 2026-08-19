import { Request, Response, NextFunction } from "express";
import { SendMessageUseCase } from "../application/send-message.use-case.ts";
import { ListConversationsUseCase } from "../application/list-conversations.use-case.ts";
import { GetMessagesUseCase } from "../application/get-messages.use-case.ts";
import { DeleteConversationUseCase } from "../application/delete-conversation.use-case.ts";

export class ChatController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly deleteConversationUseCase: DeleteConversationUseCase
  ) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const notebookId = req.params.notebookId as string;
      const { conversationId, message } = req.body;

      await this.sendMessageUseCase.execute(
        { notebookId, userId, conversationId, message },
        res
      );
    } catch (error) {
      next(error);
    }
  };

  listConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const notebookId = req.params.notebookId as string;

      const conversations = await this.listConversationsUseCase.execute({
        notebookId,
        userId,
      });

      res.status(200).json({ statusCode: 200, data: conversations });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const notebookId = req.params.notebookId as string;
      const conversationId = req.params.conversationId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const before = req.query.before as string | undefined;

      const result = await this.getMessagesUseCase.execute({
        notebookId,
        userId,
        conversationId,
        limit,
        before,
      });

      res.status(200).json({ statusCode: 200, data: result });
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const notebookId = req.params.notebookId as string;
      const conversationId = req.params.conversationId as string;

      await this.deleteConversationUseCase.execute(notebookId, conversationId, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
