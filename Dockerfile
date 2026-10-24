FROM node:22-bookworm-slim AS backend-build

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --include=dev
COPY backend/ ./
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
RUN npm run build

FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx \
  && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=backend-build /app/backend/src/database-url.ts ./backend/src/database-url.ts
COPY --from=backend-build /app/backend/package.json ./backend/package.json
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/next.config.mjs ./frontend/next.config.mjs
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/start.js ./deploy/start.js

RUN mkdir -p /app/backend/uploads

EXPOSE 10000
CMD ["node", "deploy/start.js"]
