import { config } from "./shared/config/index.ts";
import { aiConfig } from "./shared/config/ai.config.ts";
import { DatabaseService } from "./shared/services/database/database.service.ts";
import { AuthService } from "./shared/services/auth/auth.service.ts";
import { LoggerService } from "./shared/services/logger/logger.service.ts";
import { IdService } from "./shared/services/id/id.service.ts";
import { ChunkingService } from "./shared/services/chunking/chunking.service.ts";
import { PdfParserService } from "./shared/services/pdf-parser/pdf-parser.service.ts";
import { QueueService } from "./shared/services/queue/queue.service.ts";
import { RetrievalService } from "./shared/services/retrieval/retrieval.service.ts";
import { EmbeddingExternalService } from "./infrastructure/external-services/embedding/embedding.external-service.ts";
import { FirecrawlExternalService } from "./infrastructure/external-services/firecrawl/firecrawl.external-service.ts";
import { CloudinaryExternalService } from "./infrastructure/external-services/cloudinary/cloudinary.external-service.ts";
import { YoutubeExternalService } from "./infrastructure/external-services/youtube/youtube.external-service.ts";
import { LlmExternalService } from "./infrastructure/external-services/llm/llm.external-service.ts";
import { TavilyExternalService } from "./infrastructure/external-services/tavily/tavily.external-service.ts";
import { SourceChunksRepository } from "./infrastructure/repositories/source-chunks/source-chunks.repository.ts";
import { createJobRegistry } from "./jobs/registry.ts";
import { createApp } from "./app.ts";

async function bootstrap() {
  // Initialize services
  const db = DatabaseService.getInstance({ connectionString: config.databaseUrl });
  const authService = AuthService.getInstance();
  const logger = LoggerService.getInstance();
  const idService = IdService.getInstance();
  const chunkingService = ChunkingService.getInstance(aiConfig.chunking.chunkSize, aiConfig.chunking.chunkOverlap);
  const pdfParserService = PdfParserService.getInstance();
  const embeddingService = EmbeddingExternalService.getInstance(config.openrouterApiKey, aiConfig.embedding.model);
  const firecrawlService = FirecrawlExternalService.getInstance(config.firecrawlApiKey);
  const cloudinaryService = CloudinaryExternalService.getInstance(config.cloudinary);
  const youtubeService = YoutubeExternalService.getInstance();
  const queueService = QueueService.getInstance();
  const llmService = LlmExternalService.getInstance(config.openrouterApiKey);
  const webSearchService = TavilyExternalService.getInstance(config.tavilyApiKey);

  // Create retrieval service (for RAG)
  const sourceChunksRepository = new SourceChunksRepository(db);
  const retrievalService = new RetrievalService(embeddingService, sourceChunksRepository);

  // Register job functions with queue service
  const jobFunctions = createJobRegistry(queueService.getClient(), {
    db,
    idService,
    logger,
    chunkingService,
    pdfParserService,
    embeddingService,
    firecrawlService,
    cloudinaryService,
    youtubeService,
    llmService,
  });
  queueService.registerFunctions(jobFunctions);

  // Connect to database
  await db.connect();

  // Create Express app
  const app = createApp({ db, idService, logger, authService, queueService, retrievalService, llmService, webSearchService });

  // Start server
  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
