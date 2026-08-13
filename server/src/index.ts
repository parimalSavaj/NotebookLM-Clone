import { config } from "./shared/config/index.ts";
import { aiConfig } from "./shared/config/ai.config.ts";
import { DatabaseService } from "./shared/services/database/database.service.ts";
import { AuthService } from "./shared/services/auth/auth.service.ts";
import { LoggerService } from "./shared/services/logger/logger.service.ts";
import { IdService } from "./shared/services/id/id.service.ts";
import { ChunkingService } from "./shared/services/chunking/chunking.service.ts";
import { EmbeddingExternalService } from "./infrastructure/external-services/embedding/embedding.external-service.ts";
import { FirecrawlExternalService } from "./infrastructure/external-services/firecrawl/firecrawl.external-service.ts";
import { createApp } from "./app.ts";

async function bootstrap() {
  // Initialize services
  const db = DatabaseService.getInstance({ connectionString: config.databaseUrl });
  const authService = AuthService.getInstance();
  const logger = LoggerService.getInstance();
  const idService = IdService.getInstance();
  const chunkingService = ChunkingService.getInstance(aiConfig.chunking.chunkSize, aiConfig.chunking.chunkOverlap);
  const embeddingService = EmbeddingExternalService.getInstance(config.openrouterApiKey, aiConfig.embedding.model);
  const firecrawlService = FirecrawlExternalService.getInstance(config.firecrawlApiKey);

  // Connect to database
  await db.connect();

  // Create Express app
  const app = createApp({ db, idService, logger, authService, chunkingService, embeddingService, firecrawlService });

  // Start server
  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
