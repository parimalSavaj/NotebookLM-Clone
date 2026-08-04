import { config } from "./shared/config/index.ts";
import express from "express";
import { DatabaseService } from "./shared/services/database/database.service.ts";

const app = express();

// Initialize database service
const databaseService = DatabaseService.getInstance({
  connectionString: config.databaseUrl,
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function bootstrap() {
  await databaseService.connect();

  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
