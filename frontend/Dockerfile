# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

# Copy shared types (needed for imports)
COPY shared ../shared

# Copy source code
COPY frontend ./

# Verify the env var is set (for debugging)
RUN echo "Building with VITE_API_URL=$VITE_API_URL"

# Build the application with production tsconfig
RUN npx tsc --project tsconfig.build.json && npx vite build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
