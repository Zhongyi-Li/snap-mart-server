FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable

# ---------------- deps (full deps for build/migrate) ----------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY scripts ./scripts
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN pnpm install --frozen-lockfile

# ---------------- build (generate prisma + build nest) ----------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma Client（会产生 node_modules/.prisma 等运行时必须内容）
RUN pnpm prisma generate

# 编译 Nest
RUN pnpm run build

# ---------------- prod-deps (prune to production deps, keep .prisma) ----------------
FROM build AS prod-deps
# 将 node_modules 精简为生产依赖，但保留 prisma client/runtime 需要的内容
RUN pnpm prune --prod

# ---------------- migrate (one-off job image) ----------------
FROM base AS migrate
ENV NODE_ENV=production
# migrate 需要 prisma CLI 等工具，所以用 build 阶段的全量 node_modules
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
CMD ["sh", "-lc", "pnpm prisma migrate deploy"]

# ---------------- runner (api runtime) ----------------
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# 不再在 runner 里 pnpm install（避免丢 .prisma），直接拷贝 prod-deps 的 node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# 可选：运行期如果你希望容器内也有 prisma 目录/配置（一般无害）
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3001
CMD ["sh", "-lc", "node dist/src/main.js"]
