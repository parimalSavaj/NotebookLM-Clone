import dotenv from "dotenv";
import { z } from "zod/v4";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  CLIENT_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
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
  betterAuthSecret: parsed.data.BETTER_AUTH_SECRET,
  betterAuthUrl: parsed.data.BETTER_AUTH_URL,
  clientUrl: parsed.data.CLIENT_URL,
  googleClientId: parsed.data.GOOGLE_CLIENT_ID,
  googleClientSecret: parsed.data.GOOGLE_CLIENT_SECRET,
} as const;
