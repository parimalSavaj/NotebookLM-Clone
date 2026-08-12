import { Request } from "express";

export class DeleteSourceRequestDto {
  id: string;
  notebookId: string;
  userId: string;

  private constructor(props: { id: string; notebookId: string; userId: string }) {
    this.id = props.id;
    this.notebookId = props.notebookId;
    this.userId = props.userId;
  }

  static fromRequest(req: Request): DeleteSourceRequestDto {
    return new DeleteSourceRequestDto({
      id: req.params.id as string,
      notebookId: req.params.notebookId as string,
      userId: req.user!.id,
    });
  }
}
