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

RUN npm prune --omit=dev

RUN apk add --no-cache bash

# Ensure scripts are executable
RUN chmod +x ./scripts/dev-db.sh

# ---------- runtime stage ----------
FROM node:24-alpine3.21
WORKDIR /app

# Prisma engines need these on Alpine
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production

# Bring in built app, node_modules, generated Prisma client, and scripts
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

CMD ["./scripts/dev-db.sh"]
