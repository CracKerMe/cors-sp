# CORS 代理服务器使用说明

## 概述

`server.js` 是一个基于 Node.js 的 CORS 代理服务器，专门用于解决跨域请求问题。它接收来自客户端的请求，转发到目标服务器，并自动添加必要的 CORS 头部。

## 快速开始

### 基本使用

```bash
# 启动服务器（默认端口 4399）
node src/server.js

# 或使用 npm 脚本
npm start
npm run dev
```

提示：直接访问根路径 `http://localhost:4399/` 将返回一页简要说明（文档页），用于快速检查服务运行状态与了解基本用法。

快速验证：

```text
GET http://localhost:4399/                # 返回说明页
GET http://localhost:4399/https://api.github.com/users/octocat
```

### 使用代理

启动服务器后，可以通过以下方式使用代理：

```
http://localhost:4399/<目标URL>
```

**示例：**
```
# 代理到 GitHub API
http://localhost:4399/https://api.github.com/users/octocat

# 代理到其他 API
http://localhost:4399/https://jsonplaceholder.typicode.com/posts/1
```

## 配置选项

### 基本配置

```javascript
import { createServer } from './src/server.js';

const server = createServer({
  // 配置选项
});
```

### 安全配置

#### 1. 源控制

```javascript
const server = createServer({
  // 白名单：只允许指定的源
  originWhitelist: [
    'https://example.com',
    'https://app.example.com'
  ],
  
  // 黑名单：禁止指定的源
  originBlacklist: [
    'https://malicious-site.com'
  ]
});
```

#### 2. 请求头控制

```javascript
const server = createServer({
  // 必需的请求头
  requireHeader: ['authorization', 'x-api-key'],
  
  // 移除指定的请求头
  removeHeaders: ['user-agent', 'referer'],
  
  // 设置自定义请求头
  setHeaders: {
    'x-forwarded-for': 'proxy-server',
    'x-custom-header': 'custom-value'
  }
});
```

#### 3. 限流控制

```javascript
// 简单的内存限流实现
const rateLimitMap = new Map();

const checkRateLimit = (req) => {
  const ip = req.connection.remoteAddress;
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // 清理 1 分钟前的请求记录
  const recentRequests = requests.filter(time => now - time < 60000);
  
  // 限制每分钟最多 100 个请求
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

#### 4. 重定向控制

```javascript
const server = createServer({
  // 只允许同源重定向
  redirectSameOrigin: true
});
```

## 完整配置示例

```javascript
import { createServer } from './src/server.js';

const server = createServer({
  // 安全配置
  originWhitelist: ['https://myapp.com'],
  requireHeader: ['authorization'],
  
  // 请求头处理
  removeHeaders: ['user-agent'],
  setHeaders: {
    'x-forwarded-for': 'cors-proxy'
  },
  
  // 限流
  checkRateLimit: (req) => {
    // 自定义限流逻辑
    return true;
  },
  
  // 重定向控制
  redirectSameOrigin: true
});

server.listen(3000, () => {
  console.log('CORS Proxy Server running on port 3000');
});
```

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `4399` | 服务器监听端口 |

## 错误处理

服务器会自动处理以下错误情况：

- **400 Bad Request**: 无效的目标 URL
- **403 Forbidden**: 源被禁止或不在白名单中
- **404 Not Found**: 无效的主机名
- **429 Too Many Requests**: 触发限流
- **502 Bad Gateway**: 代理错误

## 使用场景

### 1. 开发环境跨域

```javascript
// 前端代码
fetch('http://localhost:4399/https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 2. API 聚合

```javascript
// 聚合多个 API
const apis = [
  'https://api1.example.com/data',
  'https://api2.example.com/data'
];

const results = await Promise.all(
  apis.map(api => 
    fetch(`http://localhost:4399/${api}`)
      .then(res => res.json())
  )
);
```

### 3. 生产环境部署

```javascript
// 生产环境配置
const server = createServer({
  originWhitelist: ['https://yourdomain.com'],
  requireHeader: ['x-api-key'],
  checkRateLimit: (req) => {
    // 生产环境限流逻辑
    return true;
  }
});

server.listen(process.env.PORT || 3000);
```

## 注意事项

1. **安全性**: 在生产环境中务必配置 `originWhitelist` 和 `requireHeader`
2. **性能**: 使用适当的限流机制防止滥用
3. **日志**: 建议添加请求日志记录
4. **监控**: 监控服务器性能和错误率

## 故障排除

### 常见问题

1. **CORS 错误仍然存在**
   - 检查目标服务器是否支持 CORS
   - 确认代理服务器正确添加了 CORS 头部

2. **请求被拒绝**
   - 检查源是否在白名单中
   - 确认必需的请求头已包含

3. **限流触发**
   - 检查限流配置是否过于严格
   - 考虑调整限流参数

### 调试技巧

```javascript
// 添加调试日志
const server = createServer({
  // ... 其他配置
});

server.on('request', (req, res) => {
  console.log(`${req.method} ${req.url} from ${req.headers.origin}`);
});
```

## 相关文件

- `src/proxyHandler.js` - 代理请求处理器
- `src/cors.js` - CORS 头部处理
- `src/urlParser.js` - URL 解析工具
- `src/utils.js` - 工具函数
