import fs from "fs";
import path from "path";

const description = process.argv[2];

if (!description) {
  console.error("Usage: npm run db:create-migration <description>");
  console.error("Example: npm run db:create-migration create-users-table");
  process.exit(1);
}

// Validate kebab-case
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(description)) {
  console.error("Description must be kebab-case (e.g., create-users-table)");
  process.exit(1);
}

// Generate timestamp: YYYYMMDDHHmmss
const now = new Date();
const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
  String(now.getHours()).padStart(2, "0"),
  String(now.getMinutes()).padStart(2, "0"),
  String(now.getSeconds()).padStart(2, "0"),
].join("");

const fileName = `${timestamp}_${description}.sql`;
const migrationsDir = path.resolve(process.cwd(), "migrations");

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const filePath = path.join(migrationsDir, fileName);

const template = `-- Migration: ${description}
-- Created at: ${now.toISOString()}

`;

fs.writeFileSync(filePath, template, "utf-8");
console.log(`Created migration: migrations/${fileName}`);
