# Base stage
FROM node:18-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN yarn global add turbo

# Prune stage for frontend
FROM base AS builder
COPY . .
RUN turbo prune --scope=frontend --docker

# Install dependencies for frontend
FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/json/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

# Build frontend
FROM base AS build-frontend
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/yarn.lock ./yarn.lock
COPY --from=builder /app/out/full/ .
# Copy the shared TypeScript config (if needed, based on previous fixes)
COPY packages/typescript-config/ ./packages/typescript-config/
RUN yarn turbo run build --filter=frontend

# Final frontend image (using Nginx to serve static files)
FROM nginx:alpine AS runner
# Copy the built static files from the build stage
COPY --from=build-frontend /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]