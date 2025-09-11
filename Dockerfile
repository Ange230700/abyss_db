# abyss_db/Dockerfile

# ---------- build stage ----------
FROM node:24-alpine3.21 AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy sources
COPY . .

# Generate Prisma client (needs dev deps available)
RUN npx prisma generate

# Ensure scripts are executable
RUN chmod +x ./scripts/dev-db.sh

# ---------- runtime stage ----------
FROM node:24-alpine3.21
WORKDIR /app

# Prisma engines need these on Alpine
RUN apk add --no-cache libc6-compat openssl

# Default to dev (you can override at runtime)
ENV NODE_ENV=development

# Bring in built app, node_modules, generated Prisma client, and scripts
COPY --from=build /app ./

# Optional: expose Prisma Studio (if you enable OPEN_STUDIO=true)
EXPOSE 5555

# Start the consolidated DB tooling flow:
#  - waits for MySQL (reads DATABASE_URL, WAIT_RETRIES, WAIT_DELAY_MS)
#  - prisma db push (unless SKIP_PUSH=true)
#  - prisma:seed (unless SKIP_SEED=true)
#  - optionally opens Prisma Studio (OPEN_STUDIO=true)
CMD ["./scripts/dev-db.sh"]
