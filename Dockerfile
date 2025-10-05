# ============================================
# Base Stage - 使用最小的 Alpine 镜像
# ============================================
FROM node:20-alpine AS base

# 安装 pnpm 并创建非 root 用户（合并层以减少体积）
RUN npm install -g pnpm@latest && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# ============================================
# Dependencies Stage - 依赖安装层
# ============================================
FROM base AS deps

# 仅复制依赖清单文件以利用 Docker 缓存
COPY package.json pnpm-lock.yaml ./

# 安装生产依赖
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# ============================================
# Development Stage - 开发环境
# ============================================
FROM base AS dev

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 使用非 root 用户
USER nodejs

EXPOSE 4399

CMD ["pnpm", "test"]

# ============================================
# Production Stage - 生产环境（极致精简）
# ============================================
FROM node:20-alpine AS prod

# 创建非 root 用户并清理不必要的 Yarn（合并层优化）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    rm -rf /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production \
    PORT=4399

# 从 deps 阶段复制 node_modules（仅生产依赖，无 pnpm）
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# 仅复制必要的应用文件
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs index.js ./
COPY --chown=nodejs:nodejs src ./src

# 切换到非 root 用户
USER nodejs

EXPOSE 4399

# 健康检查（轻量级 TCP 端口检测）
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('net').connect(4399,'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

# Node.js 18+ 已内置信号处理，无需 dumb-init
CMD ["node", "src/server.js"]
