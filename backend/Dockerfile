FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json backend/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY backend/ backend/

RUN pnpm --filter drive-backend run build

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=base /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/.npmrc ./
COPY --from=base /app/backend/package.json backend/
COPY --from=base /app/backend/dist/ backend/dist/

RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/backend
EXPOSE 3007
CMD ["node", "dist/index.js"]
