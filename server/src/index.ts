import { config } from "./shared/config/index.ts";
import express from "express";
import cors from "cors";
import { DatabaseService } from "./shared/services/database/database.service.ts";
import { AuthService } from "./shared/services/auth/auth.service.ts";

const app = express();

// Initialize services
const databaseService = DatabaseService.getInstance({
  connectionString: config.databaseUrl,
});
const authService = AuthService.getInstance();

// Middleware
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());

// Better Auth handler - handles all /api/auth/* routes
app.all("/api/auth/*splat", (req, res) => {
  return authService.getAuthHandler()(req, res);
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
