FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies and build the backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy compiled code and Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

EXPOSE 8080

CMD ["node", "dist/server.js"]
