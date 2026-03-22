const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

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
  console.error("[startup] ❌ Failed to generate Prisma Client:", error.message);
  process.exit(1);
}

// Run migrations
console.log("[startup] Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("[startup] ✓ Migrations completed");
} catch (error) {
  console.error("[startup] ❌ Migration failed:", error.message);
  process.exit(1);
}

// Seed database
console.log("[startup] Seeding database...");
try {
  execSync("node prisma/seed.js", { stdio: "inherit" });
  console.log("[startup] ✓ Database seeded");
} catch (error) {
  console.error("[startup] ⚠ Seed warning:", error.message);
  // Don't exit on seed failure - just warn
}

// Start the server
console.log("[startup] Starting server...");
require("./server");
