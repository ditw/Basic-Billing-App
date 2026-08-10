# Stage 1
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for building/compiling)
RUN npm ci

# Copy remaining application source code
COPY . .

# Build the NestJS project to generating the dist folder
RUN npm run build

# Remove development-only dependencies
RUN npm prune --omit=dev

# Stage 2
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Security: Create non-root user
USER node

# Copy built application and production node_modules from builder stage
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Expose default application port
EXPOSE 3000

# Start production server
CMD ["node", "dist/main"]