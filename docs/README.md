# CORS 代理服务器文档

欢迎使用 CORS 代理服务器文档！这里包含了完整的使用指南、API 参考和最佳实践。

## 📚 文档目录

### 🚀 快速开始
- **[快速开始指南](quick-start.md)** - 5 分钟快速上手
- **[完整使用说明](server-usage.md)** - 详细的使用教程和配置选项
- **[API 参考文档](api-reference.md)** - 完整的 API 文档和参数说明

## 🎯 使用场景

### 开发环境
- 解决前端开发中的跨域问题
- API 测试和调试
- 本地开发服务器代理

### 生产环境
- 安全的 API 代理服务
- 跨域请求统一处理
- 请求限流和安全控制

## 🔧 核心功能

- ✅ **自动 CORS 处理** - 自动添加必要的 CORS 头部
- ✅ **安全控制** - 支持源白名单/黑名单、请求头控制
- ✅ **限流保护** - 可配置的请求限流机制
- ✅ **错误处理** - 完善的错误处理和响应
- ✅ **灵活配置** - 丰富的配置选项满足不同需求

## 📖 文档结构

```
docs/
├── README.md              # 文档首页
├── quick-start.md         # 快速开始指南
├── server-usage.md        # 完整使用说明
└── api-reference.md       # API 参考文档
```

## 🚀 快速链接

### 立即开始
1. [快速开始指南](quick-start.md) - 5 分钟上手
2. [基本配置](server-usage.md#基本配置) - 了解基本配置选项
3. [安全配置](server-usage.md#安全配置) - 生产环境安全设置

### 深入使用
1. [完整配置选项](server-usage.md#配置选项) - 所有配置参数详解
2. [API 参考](api-reference.md) - 完整的 API 文档
3. [最佳实践](api-reference.md#最佳实践) - 生产环境最佳实践

### 故障排除
1. [常见问题](quick-start.md#故障排除) - 常见问题解决方案
2. [调试技巧](server-usage.md#调试技巧) - 调试和监控方法

## 💡 使用示例

### 基本使用
```javascript
import { createServer } from './src/server.js';

const server = createServer();
server.listen(3000);
```

### 安全配置
```javascript
const server = createServer({
  originWhitelist: ['https://yourdomain.com'],
  requireHeader: ['authorization'],
  checkRateLimit: (req) => {
    // 限流逻辑
    return true;
  }
});
```

### 前端使用
```javascript
// 通过代理访问 API
fetch('http://localhost:4399/https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔍 查找信息

### 按功能查找
- **CORS 处理**: [server-usage.md#概述](server-usage.md#概述)
- **安全配置**: [server-usage.md#安全配置](server-usage.md#安全配置)
- **限流控制**: [server-usage.md#限流控制](server-usage.md#限流控制)
- **错误处理**: [api-reference.md#错误码](api-reference.md#错误码)

### 按使用场景查找
- **开发环境**: [quick-start.md#开发环境跨域](quick-start.md#开发环境跨域)
- **生产环境**: [server-usage.md#生产环境部署](server-usage.md#生产环境部署)
- **API 测试**: [quick-start.md#api-测试](quick-start.md#api-测试)

## 📞 获取帮助

### 文档问题
- 查看 [常见问题](quick-start.md#故障排除)
- 阅读 [调试技巧](server-usage.md#调试技巧)

### 配置问题
- 参考 [配置选项详解](server-usage.md#配置选项)
- 查看 [API 参考](api-reference.md)

### 最佳实践
- 阅读 [最佳实践](api-reference.md#最佳实践)
- 了解 [安全配置](server-usage.md#安全配置)

## 🎉 开始使用

1. **新手用户**: 从 [快速开始指南](quick-start.md) 开始
2. **有经验用户**: 直接查看 [完整使用说明](server-usage.md)
3. **开发者**: 参考 [API 参考文档](api-reference.md)

---

*文档持续更新中，如有问题或建议，欢迎反馈！*
