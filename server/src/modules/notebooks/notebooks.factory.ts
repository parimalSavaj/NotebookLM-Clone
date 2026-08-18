import { IDatabaseService } from "../../shared/services/database/database.service.interface.ts";
import { IIdService } from "../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../shared/services/logger/logger.service.interface.ts";
import { NotebooksRepository } from "../../infrastructure/repositories/notebooks/notebooks.repository.ts";
import { SourcesRepository } from "../../infrastructure/repositories/sources/sources.repository.ts";
import { SourceContentsRepository } from "../../infrastructure/repositories/source-contents/source-contents.repository.ts";
import { SourceChunksRepository } from "../../infrastructure/repositories/source-chunks/source-chunks.repository.ts";
import { CreateNotebookUseCase } from "./application/create-notebook.use-case.ts";
import { ListNotebooksUseCase } from "./application/list-notebooks.use-case.ts";
import { GetNotebookUseCase } from "./application/get-notebook.use-case.ts";
import { UpdateNotebookUseCase } from "./application/update-notebook.use-case.ts";
import { UpdateNotebookSettingsUseCase } from "./application/update-notebook-settings.use-case.ts";
import { DeleteNotebookUseCase } from "./application/delete-notebook.use-case.ts";
import { NotebooksController } from "./presentation/notebooks.controller.ts";

export class NotebooksFactory {
  static create(db: IDatabaseService, idService: IIdService, logger: ILoggerService): NotebooksController {
    const notebooksRepository = new NotebooksRepository(db);
    const sourcesRepository = new SourcesRepository(db);
    const sourceContentsRepository = new SourceContentsRepository(db);
    const sourceChunksRepository = new SourceChunksRepository(db);

    const createNotebookUseCase = new CreateNotebookUseCase(notebooksRepository, idService, logger);
    const listNotebooksUseCase = new ListNotebooksUseCase(notebooksRepository, logger);
    const getNotebookUseCase = new GetNotebookUseCase(notebooksRepository, logger);
    const updateNotebookUseCase = new UpdateNotebookUseCase(notebooksRepository, logger);
    const updateNotebookSettingsUseCase = new UpdateNotebookSettingsUseCase(notebooksRepository, logger);
    const deleteNotebookUseCase = new DeleteNotebookUseCase(notebooksRepository, sourcesRepository, sourceContentsRepository, sourceChunksRepository, db, logger);

    return new NotebooksController(
      createNotebookUseCase,
      listNotebooksUseCase,
      getNotebookUseCase,
      updateNotebookUseCase,
      updateNotebookSettingsUseCase,
      deleteNotebookUseCase
    );
  }
}
