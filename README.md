# cors-sp

> 一个现代化、基于 ESM 的 CORS 代理服务，重构自 [cors-anywhere](https://github.com/Rob--W/cors-anywhere)。

## ✨ 功能特性

- **现代架构**：完全基于 ES Modules (ESM) 和最新的 Node.js 实践，无 CommonJS 依赖。
- **核心代理功能**：保持 `cors-anywhere` 的核心代理能力，解决跨域资源访问问题。
- **清晰的模块化**：项目结构经过精心设计，分为服务、代理处理、URL 解析、CORS 逻辑等模块，易于维护和扩展。
- **开发友好**：集成 `nodemon` 实现热重载，`vitest` 提供快速的单元测试体验。
- **代码规范**：使用 `eslint` 和 `prettier` 保证代码风格一致性和高质量。

## 🚀 快速开始

1. **安装依赖**

   ```bash
   pnpm install
   ```

2. **启动开发服务器**

   ```bash
   pnpm dev
   ```

服务将默认启动在 `http://localhost:4399`。

## � Docker 支持

本项目提供了 `Dockerfile`，支持通过 Docker 进行构建和部署。

### 生产环境

构建并运行生产环境镜像：

```bash
# 构建镜像
docker build -t cors-sp:latest --target prod .

# 运行容器
docker run -d --name cors-sp -p 4399:4399 cors-sp:latest
```

### 开发与测试

你也可以使用 Docker 来运行测试：

```bash
# 构建开发环境镜像并运行测试
docker build -t cors-sp-dev --target dev .
```

## �📁 目录结构

```text
cors-sp/
├── src/
│   ├── server.js        # 服务器入口
│   ├── proxyHandler.js  # 核心代理逻辑
│   ├── urlParser.js     # URL 解析
│   ├── cors.js          # CORS 请求处理
│   └── utils.js         # 工具函数
├── test/
│   └── api.test.js      # API 测试
├── package.json
└── README.md
```

## 🛠️ 配置选项

- `originBlacklist` / `originWhitelist`：来源黑/白名单，用于控制允许访问的来源。
- `requireHeader`：要求请求中必须包含的头部字段。
- `removeHeaders` / `setHeaders`：在转发请求前移除或设置特定的请求头。
- `checkRateLimit`：自定义函数，用于实现速率限制。
- `redirectSameOrigin`：当请求目标与代理同源时，执行重定向。

## 📡 WebSocket 支持

- 直接将真实 WS/WSS 地址拼接在代理前缀后：
  - 示例：`ws://localhost:4399/ws://echo.websocket.events`
  - 或：`ws://localhost:4399/wss://echo.websocket.events`
- 服务器对 `upgrade` 事件进行转发，并为上游创建协议对应的 Keep-Alive `Agent`。

### Docker 部署注意事项
- 使用 `-p 4399:4399` 映射端口即可同时支持 HTTP 与 WebSocket（同端口）。
- 若容器前有反向代理（如 Nginx/Caddy），需确保转发 `Upgrade` 与 `Connection` 头：
  - Nginx 示例：
    - `proxy_set_header Upgrade $http_upgrade;`
    - `proxy_set_header Connection $connection_upgrade;`
- 镜像内置 `HEALTHCHECK` 请求 `GET /healthz`；可用于编排系统就绪探针。

## 📜 产品迭代日志

### **v0.1.5 (2025-10-06)**

- 新增：根路径 `http://localhost:4399/` 返回说明页。
- 文档：更新 `README.md`、`docs/quick-start.md`、`docs/server-usage.md`、`docs/api-reference.md`。
- 兼容性：不影响代理路由与错误处理。

### **v0.1.0 (2025-09-04)**

- **项目初始化与重构**
  - 使用 ESM 模块系统搭建项目基础架构。
  - 从原版 `cors-anywhere` 迁移核心逻辑，并进行现代化改造。
- **核心功能实现**
  - `server.js`: 创建并启动 HTTP 服务器。
  - `proxyHandler.js`: 实现核心反向代理功能，使用 `http-proxy` 转发请求。
  - `cors.js`: 增加 CORS 头部处理逻辑，以允许跨域请求。
  - `urlParser.js`: 添加 URL 解析和验证逻辑。
- **开发与测试环境**
  - 配置 `nodemon` 用于开发环境下的文件监听和服务器自动重启。
  - 集成 `vitest` 测试框架，并编写了基础的 API 测试用例 (`api.test.js`)。
- **依赖现代化**
  - 使用 `tldjs` 替代过时的 `regexp-tld` 用于顶级域名解析。
  - 引入 `eslint` 和 `prettier` 来规范代码风格。

## ✅ 测试

运行以下命令来执行单元测试：

```bash
pnpm test
```

## 📄 许可证

[MIT](./LICENSE)

提示：直接访问根路径 `http://localhost:4399/` 将返回一页简要说明（文档页），用于快速检查服务运行状态与了解基本用法。

快速验证：

```text
GET http://localhost:4399/                # 返回说明页
GET http://localhost:4399/https://api.github.com/users/octocat
```

## 变更摘要

- 新增：访问根路径 `http://localhost:4399/` 返回简要说明页，便于快速验证与了解用法。
- 文档更新：同步 `README.md`、`docs/quick-start.md`、`docs/server-usage.md`、`docs/api-reference.md`。

## 运行端点（可观测性/可靠性）

- `GET /healthz`：返回 `{ status: "ok", uptime }` 用于健康检查。
- `GET /metrics`：Prometheus 指标（`cors_sp_requests_total`、`cors_sp_requests_inflight`、`cors_sp_errors_total`）。
- 统一错误响应：错误场景将返回 `application/json`，包含 `error` 字段。
