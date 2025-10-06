# API 参考文档

## createServer(options)

创建 CORS 代理服务器实例。

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `Object` | `{}` | 服务器配置选项 |

### options 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `originBlacklist` | `string[]` | `[]` | 被禁止的源列表 |
| `originWhitelist` | `string[]` | `[]` | 允许的源列表 |
| `requireHeader` | `string[]` | `[]` | 必需的请求头列表 |
| `removeHeaders` | `string[]` | `[]` | 需要移除的请求头列表 |
| `setHeaders` | `Object` | `{}` | 需要设置的请求头键值对 |
| `checkRateLimit` | `Function` | `null` | 限流检查函数 |
| `redirectSameOrigin` | `boolean` | `false` | 是否只允许同源重定向 |

### 返回值

- **类型**: `http.Server`
- **说明**: 配置好的 HTTP 服务器实例

### 示例

```javascript
import { createServer } from './src/server.js';

// 基本用法
const server = createServer();

// 带配置的用法
const server = createServer({
  originWhitelist: ['https://example.com'],
  requireHeader: ['authorization'],
  setHeaders: {
    'x-forwarded-for': 'proxy-server'
  }
});
```

## 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | `number` | `4399` | 服务器监听端口 |

## 错误码

| 状态码 | 说明 |
|--------|------|
| `200` | 成功（包括 OPTIONS 预检请求） |
| `400` | 无效的目标 URL 或缺少必需头部 |
| `403` | 源被禁止或不在白名单中 |
| `404` | 无效的主机名 |
| `429` | 触发限流 |
| `502` | 代理错误 |

## 请求格式

### 基本格式

```
GET http://localhost:4399/<目标URL>
```

### 示例

```
GET http://localhost:4399/https://api.github.com/users/octocat
POST http://localhost:4399/https://api.example.com/data
```

## 响应头

服务器会自动添加以下 CORS 头部：

| 头部名 | 值 | 说明 |
|--------|-----|------|
| `Access-Control-Allow-Origin` | 请求的 Origin 或 `*` | 允许的源 |
| `Access-Control-Allow-Credentials` | `true` | 允许携带凭证 |
| `Access-Control-Allow-Methods` | `GET,POST,PUT,PATCH,DELETE,OPTIONS` | 允许的 HTTP 方法 |
| `Access-Control-Allow-Headers` | 请求的头部或 `*` | 允许的请求头 |
| `Access-Control-Expose-Headers` | `*` | 暴露的响应头 |

## 配置示例

### 安全配置

```javascript
const server = createServer({
  originWhitelist: [
    'https://myapp.com',
    'https://staging.myapp.com'
  ],
  requireHeader: ['authorization'],
  removeHeaders: ['user-agent'],
  setHeaders: {
    'x-forwarded-for': 'cors-proxy',
    'x-real-ip': '127.0.0.1'
  }
});
```

### 限流配置

```javascript
const rateLimitMap = new Map();

const checkRateLimit = (req) => {
  const ip = req.connection.remoteAddress;
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 100) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
};

const server = createServer({
  checkRateLimit
});
```

### 重定向配置

```javascript
const server = createServer({
  redirectSameOrigin: true  // 只允许同源重定向
});
```

## 事件处理

### 服务器事件

```javascript
const server = createServer();

server.on('request', (req, res) => {
  console.log(`${req.method} ${req.url}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
```

### 代理错误处理

代理错误会自动处理，返回 502 状态码和错误信息。

## 最佳实践

1. **生产环境安全**
   ```javascript
   const server = createServer({
     originWhitelist: ['https://yourdomain.com'],
     requireHeader: ['x-api-key'],
     checkRateLimit: (req) => {
       // 实现适当的限流逻辑
       return true;
     }
   });
   ```

## 说明

直接访问根路径 `http://localhost:4399/` 会返回一页简要说明（文档页），用于快速检查服务运行状态与了解基本用法。

示例验证：

```text
GET http://localhost:4399/                # 返回说明页
GET http://localhost:4399/https://api.github.com/users/octocat
```

2. **开发环境便利**
   ```javascript
   const server = createServer({
     // 开发环境可以放宽限制
     setHeaders: {
       'x-dev-mode': 'true'
     }
   });
   ```

3. **监控和日志**
   ```javascript
   const server = createServer();
   
   server.on('request', (req, res) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
     });
   });
   ```
