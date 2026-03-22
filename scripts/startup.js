#!/usr/bin/env node
const { execSync } = require("child_process");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");
const fs = require("fs");

async function startup() {
  const DATABASE_URL = process.env.DATABASE_URL || "";
  
  console.log("[startup] ═══════════════════════════════════════");
  console.log("[startup] 🦆 Duc Panel Startup");
  console.log("[startup] ═══════════════════════════════════════");
  
  // Validate DATABASE_URL is set
  if (!DATABASE_URL) {
    console.error("[startup] ❌ FATAL: DATABASE_URL is not set");
    console.error("[startup] Expected: postgresql://user:pass@host:port/db");
    process.exit(1);
  }

  // Validate DATABASE_URL format strictly
  const isPostgres = /^postgres(ql)?:\/\//.test(DATABASE_URL);
  if (!isPostgres) {
    console.error("[startup] ❌ FATAL: DATABASE_URL format is invalid");
    console.error("[startup] Expected format: postgresql://user:pass@host:port/db");
    console.error("[startup] Current value:", DATABASE_URL.substring(0, 50) + "...");
    console.error("[startup] It appears to be:", 
      DATABASE_URL.startsWith("file:") ? "SQLite" : 
      DATABASE_URL.startsWith("/") ? "SQLite file path" :
      "Unknown database type"
    );
    process.exit(1);
  }

  console.log("[startup] ✓ DATABASE_URL format valid");
  console.log("[startup] Database host:", new URL(DATABASE_URL).hostname);

  // Generate Prisma Client
  console.log("[startup] Generating Prisma Client...");
  try {
    execSync("npx prisma generate", { stdio: "inherit", env: { ...process.env } });
    console.log("[startup] ✓ Prisma Client generated");
  } catch (error) {
    console.error("[startup] ❌ Failed to generate Prisma Client");
    process.exit(1);
  }

  // Run migrations
  console.log("[startup] Running database migrations...");
  console.log("[startup] (This connects to the database for the first time)");
  try {
    execSync("npx prisma migrate deploy", { 
      stdio: "inherit", 
      env: { ...process.env }
    });
    console.log("[startup] ✓ Migrations completed");
  } catch (error) {
    console.error("[startup] ❌ Migration failed - database may not be accessible");
    console.error("[startup] Error:", error.message);
    process.exit(1);
  }

  // Seed database (non-fatal)
  console.log("[startup] Seeding database...");
  try {
    execSync("node prisma/seed.js", { 
      stdio: "inherit", 
      env: { ...process.env }
    });
    console.log("[startup] ✓ Database seeded");
  } catch (error) {
    console.warn("[startup] ⚠ Seed skipped (admin user may already exist)");
  }

  // Start Next.js server
  console.log("[startup] ═══════════════════════════════════════");
  console.log("[startup] Starting Next.js server...");
  
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev, dir: path.resolve(__dirname, "..") });
  const handle = app.getRequestHandler();

  const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  
  const dirsToCreate = [uploadsDir];

  dirsToCreate.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[startup] Created directory: ${dir}`);
    }
  });

  await app.prepare();

  const port = process.env.PORT || 3000;

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`[startup] ═══════════════════════════════════════`);
    console.log(`[startup] 🦆 Duc Panel running on port ${port}`);
    console.log(`[startup] ═══════════════════════════════════════`);
  });
}

startup().catch((err) => {
  console.error("[startup] ❌ Fatal error:", err.message);
  process.exit(1);
});
