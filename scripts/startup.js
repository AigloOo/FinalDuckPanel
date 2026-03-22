#!/usr/bin/env node
const { execSync } = require("child_process");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");
const fs = require("fs");

async function startup() {
  const DATABASE_URL = process.env.DATABASE_URL || "";
  const isValid = /^postgres(ql)?:\/\//.test(DATABASE_URL);

  console.log("[startup] Validating DATABASE_URL...");
  if (!isValid) {
    console.error("[startup] ❌ DATABASE_URL is invalid or missing.");
    console.error("[startup] Expected a PostgreSQL URL starting with postgres:// or postgresql://");
    console.error("[startup] Current value:", DATABASE_URL ? DATABASE_URL : "<empty>");
    process.exit(1);
  }

  console.log("[startup] ✓ DATABASE_URL format valid");

  // Generate Prisma Client
  console.log("[startup] Generating Prisma Client...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("[startup] ✓ Prisma Client generated");
  } catch (error) {
    console.error("[startup] ❌ Failed to generate Prisma Client");
    process.exit(1);
  }

  // Run migrations
  console.log("[startup] Running database migrations...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("[startup] ✓ Migrations completed");
  } catch (error) {
    console.error("[startup] ❌ Migration failed");
    process.exit(1);
  }

  // Seed database (non-fatal)
  console.log("[startup] Seeding database...");
  try {
    execSync("node prisma/seed.js", { stdio: "inherit" });
    console.log("[startup] ✓ Database seeded");
  } catch (error) {
    console.warn("[startup] ⚠ Seed skipped or already applied");
  }

  // Start Next.js server
  console.log("[startup] Starting Next.js server...");
  
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
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
    console.log(`[startup] 🦆 Duc Panel running on port ${port}`);
  });
}

startup().catch((err) => {
  console.error("[startup] Fatal error:", err);
  process.exit(1);
});
