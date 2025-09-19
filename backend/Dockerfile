FROM ghcr.io/puppeteer/puppeteer:22.8.0
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm i -D typescript tsx && npx tsc -p tsconfig.json
EXPOSE 4000
CMD ["node","dist/server.js"]
