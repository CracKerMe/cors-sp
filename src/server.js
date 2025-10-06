/**
 * CORS 代理服务器模块
 * 
 * 这是一个基于 Node.js 的 HTTP 代理服务器，专门用于解决跨域问题。
 * 服务器接收请求后，将请求转发到目标服务器，并自动添加 CORS 头部。
 * 
 * 主要功能：
 * - 跨域请求代理
 * - 自动 CORS 头部处理
 * - 错误处理和响应
 * - 支持多种配置选项
 * 
 * @fileoverview CORS 代理服务器核心模块
 * @author cors-sp
 * @version 0.1.4
 */

// 基础 HTTP 服务器，ESM 语法
import http from "http";
import httpProxy from "http-proxy";
import { createProxyHandler } from "./proxyHandler.js";

import { withCORS } from "./cors.js";
import { fileURLToPath } from 'url';

/**
 * 默认服务器端口
 * 可通过环境变量 PORT 覆盖，默认为 4399
 * @constant {number}
 */
const PORT = process.env.PORT || 4399;

/**
 * 创建 CORS 代理服务器
 * 
 * 该函数创建一个配置了代理功能的 HTTP 服务器，能够处理跨域请求。
 * 服务器会自动添加 CORS 头部，并支持多种安全配置选项。
 * 
 * @param {Object} options - 服务器配置选项
 * @param {string[]} [options.originBlacklist=[]] - 被禁止的源列表
 * @param {string[]} [options.originWhitelist=[]] - 允许的源列表（如果设置，只允许列表中的源）
 * @param {string[]} [options.requireHeader=[]] - 必需的请求头列表
 * @param {string[]} [options.removeHeaders=[]] - 需要移除的请求头列表
 * @param {Object} [options.setHeaders={}] - 需要设置的请求头键值对
 * @param {Function} [options.checkRateLimit=null] - 限流检查函数
 * @param {boolean} [options.redirectSameOrigin=false] - 是否只允许同源重定向
 * 
 * @returns {http.Server} 配置好的 HTTP 服务器实例
 * 
 * @example
 * // 基本用法
 * const server = createServer();
 * server.listen(3000);
 * 
 * @example
 * // 带安全配置的用法
 * const server = createServer({
 *   originWhitelist: ['https://example.com', 'https://app.example.com'],
 *   requireHeader: ['authorization'],
 *   setHeaders: {
 *     'x-forwarded-for': 'proxy-server'
 *   }
 * });
 * 
 * @example
 * // 带限流的用法
 * const rateLimitMap = new Map();
 * const checkRateLimit = (req) => {
 *   const ip = req.connection.remoteAddress;
 *   const now = Date.now();
 *   const requests = rateLimitMap.get(ip) || [];
 *   const recentRequests = requests.filter(time => now - time < 60000);
 *   if (recentRequests.length >= 100) return false;
 *   recentRequests.push(now);
 *   rateLimitMap.set(ip, recentRequests);
 *   return true;
 * };
 * 
 * const server = createServer({
 *   checkRateLimit
 * });
 */
const createServer = (options) => {
  // 创建 HTTP 代理服务器实例
  const proxy = httpProxy.createProxyServer(options);
  
  // 处理代理错误
  proxy.on("error", (err, req, res) => {
    const headers = withCORS({ "Content-Type": "text/plain" }, req);
    res.writeHead(502, headers);
    res.end("Proxy error: " + err.message);
  });

  // 创建代理处理器并返回 HTTP 服务器
  const handler = createProxyHandler(options, proxy);
  return http.createServer(handler);
};

/**
 * 直接运行服务器时的启动逻辑
 * 
 * 当直接运行此文件时（如：node src/server.js），会自动启动服务器。
 * 这种设计允许文件既可以作为模块导入使用，也可以直接运行。
 * 
 * 检测逻辑兼容 Windows 和 Unix 系统。
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // 使用默认配置创建服务器
  const server = createServer({});
  
  // 启动服务器并监听指定端口
  server.listen(PORT, () => {
    console.log(`Proxy Server listening on http://localhost:${PORT}`);
    console.log(`Usage: http://localhost:${PORT}/<target-url>`);
    console.log(`Example: http://localhost:${PORT}/https://api.example.com/data`);
  });
}

/**
 * 导出 createServer 函数
 * 
 * 允许其他模块导入并使用 createServer 函数来创建自定义配置的服务器实例。
 * 
 * @exports {Function} createServer - 创建 CORS 代理服务器的函数
 */
export { createServer };
