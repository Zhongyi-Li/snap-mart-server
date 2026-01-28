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

# ✅ 在 build 阶段生成 Prisma Client（允许联网下载二进制）
RUN pnpm prisma generate

# ✅ 编译 Nest
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY scripts ./scripts
COPY prisma ./prisma

RUN pnpm install --prod --frozen-lockfile

# ✅ 拷贝编译产物
COPY --from=build /app/dist ./dist

# ✅ 关键：把 Prisma runtime 相关内容从 build 拷过来（避免 runner 再 generate / 再下载）
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

# ✅ prisma.config 供 migrate deploy 使用
RUN cp -f ./dist/prisma.config.js ./prisma.config.js

EXPOSE 3001
CMD ["sh", "-lc", "pnpm prisma migrate deploy && node dist/src/main.js"]