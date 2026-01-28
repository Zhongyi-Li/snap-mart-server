# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
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
COPY prisma ./prisma

RUN pnpm install --prod --frozen-lockfile
RUN pnpm prisma generate

# ✅ 拷贝编译产物
COPY --from=build /app/dist ./dist

# ✅ 关键：把 dist 里的 prisma.config 放到项目根目录（Prisma CLI 才能识别）
# 这样 pnpm prisma migrate deploy 才能拿到 datasource.url（来自 DATABASE_URL）
RUN cp -f ./dist/prisma.config.js ./prisma.config.js

EXPOSE 3001

# ✅ 启动前自动应用迁移（推荐上线必做）
CMD ["sh", "-lc", "pnpm prisma migrate deploy && node dist/src/main.js"]
