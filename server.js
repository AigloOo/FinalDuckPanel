/**
 * DEPRECATED: This file is no longer used.
 * 
 * The application now uses scripts/startup.js as the entry point in Docker.
 * Use 'npm run dev' locally or ensure scripts/startup.js is in your Docker CMD.
 * 
 * This placeholder is kept to prevent "module not found" errors if legacy code references it.
 */

throw new Error(
  'server.js is deprecated. Use scripts/startup.js instead. ' +
  'If you see this error, your Docker image or package.json is misconfigured.'
);
