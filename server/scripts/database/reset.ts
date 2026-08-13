import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function resetDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log("Dropping all tables...\n");

    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO public;
    `);

    console.log("✓ All tables dropped.");
    console.log("\nRun 'npm run db:migrate' to recreate tables.");
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase().catch((err) => {
  console.error("Reset failed:", err.message);
  process.exit(1);
});
