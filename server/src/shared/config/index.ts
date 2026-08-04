import dotenv from "dotenv";
import { z } from "zod/v4";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = {
  port: Number(parsed.data.PORT),
  databaseUrl: parsed.data.DATABASE_URL,
} as const;
