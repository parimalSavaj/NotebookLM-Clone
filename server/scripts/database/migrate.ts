import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureMigrationsTable(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client: pg.PoolClient): Promise<Set<string>> {
  const result = await client.query<{ filename: string }>(
    "SELECT filename FROM migrations ORDER BY filename"
  );
  return new Set(result.rows.map((row) => row.filename));
}

async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.resolve(process.cwd(), "migrations");

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  return files.sort();
}

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const files = await getMigrationFiles();
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    console.log(`Found ${pending.length} pending migration(s):\n`);

    for (const file of pending) {
      const filePath = path.resolve(process.cwd(), "migrations", file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`  Running: ${file}...`);

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`  ✓ Applied: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  ✗ Failed: ${file}`);
        throw err;
      }
    }

    console.log(`\nAll ${pending.length} migration(s) applied successfully.`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
