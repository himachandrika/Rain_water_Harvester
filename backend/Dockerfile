# Builder stage: compile TypeScript and bundle assets
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Ensure JSON/data assets are available at runtime
RUN mkdir -p dist/data && cp -r src/data/* dist/data/ || true

# Runtime stage: Puppeteer base with Chromium for PDF generation
FROM ghcr.io/puppeteer/puppeteer:22.8.0
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Include CSV and other top-level data used by the server at /data (as expected by server.ts)
COPY /data /data
EXPOSE 4000
CMD ["node","dist/server.js"]
