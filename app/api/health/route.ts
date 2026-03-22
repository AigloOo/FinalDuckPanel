import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    dbUrlSet: !!process.env.DATABASE_URL,
    dbUrlFormat: process.env.DATABASE_URL ? (
      process.env.DATABASE_URL.startsWith("postgresql://") ? "PostgreSQL" :
      process.env.DATABASE_URL.startsWith("postgres://") ? "PostgreSQL" :
      process.env.DATABASE_URL.startsWith("file:") ? "SQLite (file:)" :
      process.env.DATABASE_URL.startsWith("/") ? "SQLite (file path)" :
      "Unknown"
    ) : "Not set",
    dbHost: process.env.DATABASE_URL ? (() => {
      try {
        const url = new URL(process.env.DATABASE_URL);
        return url.hostname;
      } catch {
        return "Invalid URL";
      }
    })() : null,
  };

  // Try to test database connection
  let dbConnected = false;
  let dbError = null;

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    await prisma.$disconnect();
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  }

  const status = dbConnected ? 200 : 503;
  
  return NextResponse.json(
    {
      status: dbConnected ? "✓ Connected" : "✗ Connection Failed",
      diagnostics,
      error: dbError,
    },
    { status }
  );
}
