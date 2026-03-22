const value = process.env.DATABASE_URL || "";
const isValid = /^postgres(ql)?:\/\//.test(value);

if (!isValid) {
  console.error("[startup] DATABASE_URL is invalid or missing.");
  console.error("[startup] Expected a PostgreSQL URL starting with postgres:// or postgresql://");
  console.error("[startup] Current value:", value ? value : "<empty>");
  process.exit(1);
}

console.log("[startup] DATABASE_URL format looks valid.");
