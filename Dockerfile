# Build stage - NO runtime environment variables needed
FROM node:22.22.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies only (no postinstall hooks that trigger Prisma)
RUN npm ci

# Copy source code
COPY . .

# Set environment for build (only NODE_ENV needed for Next.js build optimization)
ENV PRISMA_SKIP_VALIDATION=true
ENV NODE_ENV=production

# Generate Prisma Client without validating datasource (JWT_SECRET not needed at build time)
RUN npx prisma generate

# Build Next.js (does NOT require DATABASE_URL or JWT_SECRET)
RUN npm run build

# Runtime stage
FROM node:22.22.1-alpine

WORKDIR /app

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/scripts/startup.js ./scripts/startup.js

# Create directories for uploads
RUN mkdir -p uploads

# Set production environment
ENV NODE_ENV=production
ENV PRISMA_SKIP_VALIDATION=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application via startup script
# Dependencies injected at runtime: DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
CMD ["node", "scripts/startup.js"]
