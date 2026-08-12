import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../shared/constants/status-code.constants.ts";
import { ApiResponse } from "../../../shared/core/api-response.ts";
import { CreateSourceUseCase } from "../application/create-source.use-case.ts";
import { ListSourcesUseCase } from "../application/list-sources.use-case.ts";
import { GetSourceUseCase } from "../application/get-source.use-case.ts";
import { DeleteSourceUseCase } from "../application/delete-source.use-case.ts";
import { CreateSourceRequestDto } from "../application/dtos/create-source.dto.ts";
import { ListSourcesRequestDto } from "../application/dtos/list-sources.dto.ts";
import { GetSourceRequestDto } from "../application/dtos/get-source.dto.ts";
import { DeleteSourceRequestDto } from "../application/dtos/delete-source.dto.ts";

export class SourcesController {
  constructor(
    private readonly createSourceUseCase: CreateSourceUseCase,
    private readonly listSourcesUseCase: ListSourcesUseCase,
    private readonly getSourceUseCase: GetSourceUseCase,
    private readonly deleteSourceUseCase: DeleteSourceUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateSourceRequestDto.fromRequest(req);
      const result = await this.createSourceUseCase.execute(dto);
      res.status(HTTP_STATUS.CREATED).json(ApiResponse.success(result, HTTP_STATUS.CREATED).toJSON());
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = ListSourcesRequestDto.fromRequest(req);
      const result = await this.listSourcesUseCase.execute(dto);
      res.status(HTTP_STATUS.OK).json(ApiResponse.success(result, HTTP_STATUS.OK).toJSON());
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = GetSourceRequestDto.fromRequest(req);
      const result = await this.getSourceUseCase.execute(dto);
      res.status(HTTP_STATUS.OK).json(ApiResponse.success(result, HTTP_STATUS.OK).toJSON());
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = DeleteSourceRequestDto.fromRequest(req);
      await this.deleteSourceUseCase.execute(dto);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
