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

# ✅ 只装生产依赖（不再在 runner generate）
RUN pnpm install --prod --frozen-lockfile

# ✅ 拷贝编译产物
COPY --from=build /app/dist ./dist

# ✅ 关键：把 Prisma Client 生成产物一起带过来（避免 runner 下载 binaries）
# 1) Prisma client JS 代码
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
# 2) .prisma（包含 query engine / schema engine 等生成产物，pnpm 下路径在 node_modules/.prisma）
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# ✅ 关键：把 dist 里的 prisma.config 放到根目录给 migrate deploy 用
RUN cp -f ./dist/prisma.config.js ./prisma.config.js

EXPOSE 3001

# ✅ 启动前自动迁移
CMD ["sh", "-lc", "pnpm prisma migrate deploy && node dist/src/main.js"]
