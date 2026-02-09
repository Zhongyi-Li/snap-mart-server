# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# ---------------- deps (full deps for build/migrate) ----------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY scripts ./scripts
COPY prisma ./prisma
# ✅ Prisma 7 migrate config file (TS)
COPY prisma.config.ts ./prisma.config.ts
RUN pnpm install --frozen-lockfile

# ---------------- build ----------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ build 阶段生成 Prisma Client（允许联网下载二进制）
RUN pnpm prisma generate

# ✅ 编译 Nest
RUN pnpm run build

# ---------------- migrate (one-off job image) ----------------
# 这个 target 专门用来跑 prisma migrate deploy（包含 prisma CLI + @prisma/config）
FROM base AS migrate
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
CMD ["sh", "-lc", "pnpm prisma migrate deploy"]

# ---------------- runner (api runtime) ----------------
FROM base AS runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY scripts ./scripts
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# ✅ 只装生产依赖（更轻）
RUN pnpm install --prod --frozen-lockfile

# ✅ 拷贝编译产物
COPY --from=build /app/dist ./dist

# ✅ Prisma runtime 相关内容从 build 拷过来（避免 runner 再 generate / 再下载）
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3001
# ✅ 注意：runner 不再做 migrate
CMD ["sh", "-lc", "node dist/src/main.js"]
