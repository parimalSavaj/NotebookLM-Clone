import { IDatabaseService } from "../../shared/services/database/database.service.interface.ts";
import { IIdService } from "../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../shared/services/logger/logger.service.interface.ts";
import { IChunkingService } from "../../shared/services/chunking/chunking.service.interface.ts";
import { IPdfParserService } from "../../shared/services/pdf-parser/pdf-parser.service.interface.ts";
import { IEmbeddingService } from "../../infrastructure/external-services/embedding/embedding.external-service.interface.ts";
import { IFirecrawlService } from "../../infrastructure/external-services/firecrawl/firecrawl.external-service.interface.ts";
import { ICloudinaryService } from "../../infrastructure/external-services/cloudinary/cloudinary.external-service.interface.ts";
import { IYoutubeService } from "../../infrastructure/external-services/youtube/youtube.external-service.interface.ts";
import { SourcesRepository } from "../../infrastructure/repositories/sources/sources.repository.ts";
import { SourceContentsRepository } from "../../infrastructure/repositories/source-contents/source-contents.repository.ts";
import { SourceChunksRepository } from "../../infrastructure/repositories/source-chunks/source-chunks.repository.ts";
import { NotebooksRepository } from "../../infrastructure/repositories/notebooks/notebooks.repository.ts";
import { CreateSourceUseCase } from "./application/create-source.use-case.ts";
import { ListSourcesUseCase } from "./application/list-sources.use-case.ts";
import { GetSourceUseCase } from "./application/get-source.use-case.ts";
import { DeleteSourceUseCase } from "./application/delete-source.use-case.ts";
import { SourcesController } from "./presentation/sources.controller.ts";

export class SourcesFactory {
  static create(
    db: IDatabaseService,
    idService: IIdService,
    logger: ILoggerService,
    chunkingService: IChunkingService,
    embeddingService: IEmbeddingService,
    firecrawlService: IFirecrawlService,
    cloudinaryService: ICloudinaryService,
    pdfParserService: IPdfParserService,
    youtubeService: IYoutubeService
  ): SourcesController {
    const sourcesRepository = new SourcesRepository(db);
    const sourceContentsRepository = new SourceContentsRepository(db);
    const sourceChunksRepository = new SourceChunksRepository(db);
    const notebooksRepository = new NotebooksRepository(db);

    const createSourceUseCase = new CreateSourceUseCase(
      sourcesRepository,
      sourceContentsRepository,
      sourceChunksRepository,
      notebooksRepository,
      idService,
      logger,
      chunkingService,
      embeddingService,
      firecrawlService,
      cloudinaryService,
      pdfParserService,
      youtubeService
    );
    const listSourcesUseCase = new ListSourcesUseCase(sourcesRepository, notebooksRepository, logger);
    const getSourceUseCase = new GetSourceUseCase(sourcesRepository, sourceContentsRepository, notebooksRepository, logger);
    const deleteSourceUseCase = new DeleteSourceUseCase(sourcesRepository, sourceChunksRepository, notebooksRepository, logger);

    return new SourcesController(
      createSourceUseCase,
      listSourcesUseCase,
      getSourceUseCase,
      deleteSourceUseCase
    );
  }
}
