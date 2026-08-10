import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../shared/constants/status-code.constants.ts";
import { ApiResponse } from "../../../shared/core/api-response.ts";
import { CreateNotebookUseCase } from "../application/create-notebook.use-case.ts";
import { ListNotebooksUseCase } from "../application/list-notebooks.use-case.ts";
import { GetNotebookUseCase } from "../application/get-notebook.use-case.ts";
import { UpdateNotebookUseCase } from "../application/update-notebook.use-case.ts";
import { UpdateNotebookSettingsUseCase } from "../application/update-notebook-settings.use-case.ts";
import { DeleteNotebookUseCase } from "../application/delete-notebook.use-case.ts";
import { CreateNotebookRequestDto } from "../application/dtos/create-notebook.dto.ts";
import { ListNotebooksRequestDto } from "../application/dtos/list-notebooks.dto.ts";
import { GetNotebookRequestDto } from "../application/dtos/get-notebook.dto.ts";
import { UpdateNotebookRequestDto } from "../application/dtos/update-notebook.dto.ts";
import { UpdateNotebookSettingsRequestDto } from "../application/dtos/update-notebook-settings.dto.ts";
import { DeleteNotebookRequestDto } from "../application/dtos/delete-notebook.dto.ts";

export class NotebooksController {
  constructor(
    private readonly createNotebookUseCase: CreateNotebookUseCase,
    private readonly listNotebooksUseCase: ListNotebooksUseCase,
    private readonly getNotebookUseCase: GetNotebookUseCase,
    private readonly updateNotebookUseCase: UpdateNotebookUseCase,
    private readonly updateNotebookSettingsUseCase: UpdateNotebookSettingsUseCase,
    private readonly deleteNotebookUseCase: DeleteNotebookUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateNotebookRequestDto.fromRequest(req);
      const result = await this.createNotebookUseCase.execute(dto);
      res.status(HTTP_STATUS.CREATED).json(ApiResponse.success(result, HTTP_STATUS.CREATED).toJSON());
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = ListNotebooksRequestDto.fromRequest(req);
      const result = await this.listNotebooksUseCase.execute(dto);
      res.status(HTTP_STATUS.OK).json(ApiResponse.success(result, HTTP_STATUS.OK).toJSON());
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = GetNotebookRequestDto.fromRequest(req);
      const result = await this.getNotebookUseCase.execute(dto);
      res.status(HTTP_STATUS.OK).json(ApiResponse.success(result, HTTP_STATUS.OK).toJSON());
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = UpdateNotebookRequestDto.fromRequest(req);
      const result = await this.updateNotebookUseCase.execute(dto);
      res.status(HTTP_STATUS.OK).json(ApiResponse.success(result, HTTP_STATUS.OK).toJSON());
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = UpdateNotebookSettingsRequestDto.fromRequest(req);
      const result = await this.updateNotebookSettingsUseCase.execute(dto);
      res.status(HTTP_STATUS.OK).json(ApiResponse.success(result, HTTP_STATUS.OK).toJSON());
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = DeleteNotebookRequestDto.fromRequest(req);
      await this.deleteNotebookUseCase.execute(dto);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
