# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# deps 阶段需要 scripts + prisma（pnpm install 触发 postinstall/以及 prisma 相关）
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
COPY scripts ./scripts
# ✅ 关键：runner 阶段也要有 prisma（generate 需要 schema）
COPY prisma ./prisma

RUN pnpm install --prod --frozen-lockfile
# ✅ 关键：在最终镜像里生成 Prisma Client，避免 .prisma/client/default 缺失
RUN pnpm prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
