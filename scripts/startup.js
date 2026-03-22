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
    console.error("[startup] Expected: postgresql://user:pass@host:5432/db");
    console.error("[startup] Railway should auto-inject this from PostgreSQL service");
    process.exit(1);
  }

  // Validate DATABASE_URL is a valid PostgreSQL URL
  const isPostgres = /^postgres(ql)?:\/\//.test(DATABASE_URL);
  if (!isPostgres) {
    console.error("[startup] ❌ FATAL: DATABASE_URL is malformed");
    console.error("[startup] Expected format: postgresql://user:pass@host:5432/db");
    console.error("[startup] Current value:", DATABASE_URL.substring(0, 80));
    console.error("[startup] ");
    console.error("[startup] Detected type:");
    if (DATABASE_URL.startsWith("file:")) {
      console.error("[startup]   SQLite (file:) - NOT supported");
    } else if (DATABASE_URL.startsWith("/")) {
      console.error("[startup]   SQLite file path - NOT supported");
    } else if (DATABASE_URL.includes("://")) {
      console.error("[startup]   Unknown protocol -", DATABASE_URL.split("://")[0] + "://");
    } else if (DATABASE_URL.includes(":")) {
      console.error("[startup]   Looks like partial host:port -", DATABASE_URL);
    } else {
      console.error("[startup]   Unknown format");
    }
    console.error("[startup] ");
    console.error("[startup] Fix: In Railway's Web service Variables, ensure:");
    console.error("[startup]   DATABASE_URL is set AND points to PostgreSQL service");
    process.exit(1);
  }

  let dbHost = "unknown";
  try {
    const url = new URL(DATABASE_URL);
    dbHost = url.hostname;
  } catch (e) {
    console.error("[startup] ❌ FATAL: DATABASE_URL is not a valid URL");
    console.error("[startup] Error:", e.message);
    process.exit(1);
  }

  console.log("[startup] ✓ DATABASE_URL format valid");
  console.log("[startup] Database host:", dbHost);
  console.log("[startup] ");

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
  console.log("[startup] (Connecting to database for the first time)");
  try {
    execSync("npx prisma migrate deploy", { 
      stdio: "inherit", 
      env: { ...process.env }
    });
    console.log("[startup] ✓ Migrations completed");
  } catch (error) {
    console.error("[startup] ❌ Migration failed");
    console.error("[startup] Error:", error.message);
    console.error("[startup] ");
    console.error("[startup] This likely means:");
    console.error("[startup]   - DATABASE_URL is incorrect or host is unreachable");
    console.error("[startup]   - PostgreSQL service is not running");
    console.error("[startup]   - PostgreSQL credentials are wrong");
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
