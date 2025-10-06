# 快速开始指南

## 安装和运行

### 1. 启动服务器

```bash
# 使用默认配置启动
npm start

# 或直接运行
node src/server.js

# 开发模式（自动重启）
npm run dev
```

### 2. 验证服务器运行

服务器启动后会显示：
```
Proxy Server listening on http://localhost:4399
Usage: http://localhost:4399/<target-url>
Example: http://localhost:4399/https://api.example.com/data
```

## 基本使用

### 在浏览器中测试

打开浏览器控制台，运行：

```javascript
// 测试 GitHub API
fetch('http://localhost:4399/https://api.github.com/users/octocat')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 在代码中使用

```javascript
// 前端代码示例
async function fetchData() {
  try {
    const response = await fetch('http://localhost:4399/https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 常见使用场景

### 1. 开发环境跨域

```javascript
// 原本会跨域失败的请求
fetch('https://api.example.com/data')  // ❌ CORS 错误

// 通过代理解决
fetch('http://localhost:4399/https://api.example.com/data')  // ✅ 成功
```

### 2. API 测试

```bash
# 使用 curl 测试
curl "http://localhost:4399/https://api.github.com/users/octocat"

# 使用 Postman 测试
GET http://localhost:4399/https://jsonplaceholder.typicode.com/posts/1
```

### 3. 前端项目集成

```javascript
// 在 React/Vue/Angular 项目中使用
const API_BASE = 'http://localhost:4399/https://api.example.com';

fetch(`${API_BASE}/users`)
  .then(response => response.json())
  .then(users => {
    // 处理用户数据
  });
```

## 配置选项

### 基本配置

```javascript
import { createServer } from './src/server.js';

const server = createServer({
  // 只允许特定域名
  originWhitelist: ['http://localhost:3000', 'https://myapp.com'],
  
  // 添加自定义头部
  setHeaders: {
    'x-custom-header': 'my-value'
  }
});

server.listen(3000);
```

### 安全配置

```javascript
const server = createServer({
  // 白名单控制
  originWhitelist: ['https://yourdomain.com'],
  
  // 必需头部
  requireHeader: ['authorization'],
  
  // 限流
  checkRateLimit: (req) => {
    // 简单的 IP 限流
    const ip = req.connection.remoteAddress;
    // 实现限流逻辑
    return true;
  }
});
```

## 故障排除

### 常见问题

1. **服务器无法启动**
   ```bash
   # 检查端口是否被占用
   netstat -an | grep 4399
   
   # 使用其他端口
   PORT=3000 node src/server.js
   ```

2. **请求仍然跨域**
   ```javascript
   // 确保使用正确的代理 URL 格式
   fetch('http://localhost:4399/https://api.example.com/data')
   ```

3. **代理错误**
   ```bash
   # 检查目标 URL 是否可访问
   curl -I https://api.example.com/data
   ```

### 调试技巧

```javascript
// 添加请求日志
const server = createServer();

server.on('request', (req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
});
```

## 下一步

- 查看 [完整使用说明](server-usage.md)
- 阅读 [API 参考文档](api-reference.md)
- 了解 [配置选项详解](server-usage.md#配置选项)
