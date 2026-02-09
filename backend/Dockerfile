# Stage 1: Build
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy prisma schema
COPY backend/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy shared types
COPY shared ../shared

# Copy source code
COPY backend ./

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-bullseye-slim

# OpenSSL 1.1 is included in Debian Bullseye by default (no need to install)

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy prisma schema and generate client (needed at runtime)
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]
