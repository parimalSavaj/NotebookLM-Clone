import { Request } from "express";

export class DeleteNotebookRequestDto {
  id: string;
  userId: string;

  private constructor(props: { id: string; userId: string }) {
    this.id = props.id;
    this.userId = props.userId;
  }

  static fromRequest(req: Request): DeleteNotebookRequestDto {
    return new DeleteNotebookRequestDto({
      id: req.params.id as string,
      userId: req.user!.id,
    });
  }
}
