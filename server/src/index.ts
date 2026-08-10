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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Better Auth handler - handles all /api/auth/* routes
app.all("/api/auth/*splat", (req, res) => {
  // CORS middleware already handles OPTIONS, but if it reaches here just return 200
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
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
