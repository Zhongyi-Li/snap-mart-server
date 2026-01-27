# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# ✅ 关键1：deps 阶段也要有 scripts（否则 pnpm install 触发 postinstall 会找不到脚本）
COPY scripts ./scripts
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
# runner 阶段同样保留（避免 prod install 也触发 postinstall 出问题）
COPY scripts ./scripts
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3001
# ✅ 关键2：Nest 的产物通常是 dist/main.js，不是 dist/main
CMD ["node", "dist/main.js"]
