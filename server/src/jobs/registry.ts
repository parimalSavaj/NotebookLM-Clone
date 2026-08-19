import { Inngest } from "inngest";
import { IDatabaseService } from "../shared/services/database/database.service.interface.ts";
import { IIdService } from "../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../shared/services/logger/logger.service.interface.ts";
import { IChunkingService } from "../shared/services/chunking/chunking.service.interface.ts";
import { IPdfParserService } from "../shared/services/pdf-parser/pdf-parser.service.interface.ts";
import { IEmbeddingService } from "../infrastructure/external-services/embedding/embedding.external-service.interface.ts";
import { IFirecrawlService } from "../infrastructure/external-services/firecrawl/firecrawl.external-service.interface.ts";
import { ICloudinaryService } from "../infrastructure/external-services/cloudinary/cloudinary.external-service.interface.ts";
import { IYoutubeService } from "../infrastructure/external-services/youtube/youtube.external-service.interface.ts";
import { SourcesRepository } from "../infrastructure/repositories/sources/sources.repository.ts";
import { SourceContentsRepository } from "../infrastructure/repositories/source-contents/source-contents.repository.ts";
import { SourceChunksRepository } from "../infrastructure/repositories/source-chunks/source-chunks.repository.ts";
import { NotebooksRepository } from "../infrastructure/repositories/notebooks/notebooks.repository.ts";
import { ProcessSourceWorker } from "./workers/process-source/process-source.worker.ts";
import { PROCESS_SOURCE_JOB, ProcessSourcePayload } from "./workers/process-source/process-source.types.ts";
import { NonRetryableError } from "../shared/core/job-errors.ts";

interface RegistryDependencies {
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  chunkingService: IChunkingService;
  pdfParserService: IPdfParserService;
  embeddingService: IEmbeddingService;
  firecrawlService: IFirecrawlService;
  cloudinaryService: ICloudinaryService;
  youtubeService: IYoutubeService;
}

/**
 * Creates all Inngest functions (workers) with their dependencies wired up.
 * This is the composition root for the jobs layer.
 */
export function createJobRegistry(inngestClient: Inngest, deps: RegistryDependencies) {
  const { db, idService, logger, chunkingService, pdfParserService, embeddingService, firecrawlService, cloudinaryService, youtubeService } = deps;

  // Instantiate repositories
  const sourcesRepository = new SourcesRepository(db);
  const sourceContentsRepository = new SourceContentsRepository(db);
  const sourceChunksRepository = new SourceChunksRepository(db);
  const notebooksRepository = new NotebooksRepository(db);

  // Instantiate worker
  const processSourceWorker = new ProcessSourceWorker(
    sourcesRepository,
    sourceContentsRepository,
    sourceChunksRepository,
    notebooksRepository,
    embeddingService,
    firecrawlService,
    cloudinaryService,
    youtubeService,
    chunkingService,
    pdfParserService,
    db,
    idService,
    logger
  );

  // Create Inngest function that delegates to the worker
  const processSourceFunction = inngestClient.createFunction(
    {
      id: "process-source",
      retries: 2,
      triggers: [{ event: PROCESS_SOURCE_JOB }],
    },
    async ({ event, step }) => {
      const payload = event.data as ProcessSourcePayload;

      try {
        return await step.run("execute", async () => {
          return processSourceWorker.execute(payload);
        });
      } catch (error) {
        if (error instanceof NonRetryableError) {
          logger.error("Process source job failed (non-retryable)", {
            sourceId: payload.sourceId,
            error: error.message,
          });
        }
        throw error;
      }
    }
  );

  return [processSourceFunction];
}
