/**
 * DEPRECATED: This file is no longer used.
 * 
 * All startup logic has been moved to scripts/startup.js
 * Docker uses scripts/startup.js as the container entry point.
 * 
 * This file is kept only for backwards compatibility if referenced in old code paths.
 * It should be safely deleted from the repository.
 */

console.warn("[DEPRECATED] scripts/check-database-url.js is obsolete. Use scripts/startup.js instead.");
process.exit(1);
