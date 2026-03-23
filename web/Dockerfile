FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY web/package.json web/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY web/ web/

RUN pnpm --filter drive-web run build

FROM nginx:alpine
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
