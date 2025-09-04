import { parseURL } from "./urlParser.js";
import { isValidHostName } from "./utils.js";
import { withCORS } from "./cors.js";

/**
 * 创建代理处理器
 * @param {object} options
 * @param {import('http-proxy').default} proxy
 * @returns {(req, res) => void}
 */
export function createProxyHandler(options, proxy) {
  const {
    originBlacklist = [],
    originWhitelist = [],
    requireHeader = [],
    removeHeaders = [],
    setHeaders = {},
    checkRateLimit = null,
    redirectSameOrigin = false,
  } = options || {};
  return (req, res) => {
    // 0. 处理 OPTIONS 预检请求
    if (req.method === "OPTIONS") {
      const headers = withCORS({}, req);
      res.writeHead(200, headers);
      res.end();
      return;
    }

    // 0.1 检查来源黑/白名单
    const origin = req.headers.origin || "";
    if (originBlacklist.length && originBlacklist.includes(origin)) {
      res.writeHead(403, withCORS({ "Content-Type": "text/plain" }, req));
      res.end("Origin is blacklisted");
      return;
    }
    if (originWhitelist.length && !originWhitelist.includes(origin)) {
      res.writeHead(403, withCORS({ "Content-Type": "text/plain" }, req));
      res.end("Origin is not whitelisted");
      return;
    }

    // 0.2 检查必需头部
    if (
      requireHeader.length &&
      !requireHeader.every((h) => req.headers[h.toLowerCase()])
    ) {
      res.writeHead(400, withCORS({ "Content-Type": "text/plain" }, req));
      res.end("Missing required header");
      return;
    }

    // 0.3 检查限流
    if (typeof checkRateLimit === "function" && !checkRateLimit(req)) {
      res.writeHead(429, withCORS({ "Content-Type": "text/plain" }, req));
      res.end("Rate limit exceeded");
      return;
    }
    // 1. 提取目标 URL
    const url = decodeURIComponent(req.url.substring(1));
    const targetLocation = parseURL(url);
    if (!targetLocation) {
      res.writeHead(400, withCORS({ "Content-Type": "text/plain" }, req));
      res.end("Invalid target URL");
      return;
    }
    // 2. 主机名校验
    if (!isValidHostName(targetLocation.hostname)) {
      res.writeHead(404, withCORS({ "Content-Type": "text/plain" }, req));
      res.end("Invalid host");
      return;
    }

    // 2.1 移除指定头部
    removeHeaders.forEach((h) => {
      delete req.headers[h.toLowerCase()];
    });
    // 2.2 设置指定头部
    Object.entries(setHeaders).forEach(([k, v]) => {
      req.headers[k.toLowerCase()] = v;
    });

    // 3. 代理请求
    proxy.once("proxyRes", (proxyRes, req2, res2) => {
      // 处理重定向
      if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode)) {
        const loc = proxyRes.headers["location"];
        if (loc) {
          const newUrl = new URL(loc, targetLocation);
          // redirectSameOrigin: 只重定向同源
          if (!redirectSameOrigin || newUrl.origin === targetLocation.origin) {
            proxyRes.headers["location"] = "/" + newUrl.href;
          }
        }
      }
      // 添加 CORS 头
      Object.entries(withCORS({}, req2)).forEach(([k, v]) => {
        res2.setHeader(k, v);
      });
    });
    proxy.web(req, res, {
      target: targetLocation.href,
      ignorePath: true,
      changeOrigin: true,
    });
  };
}
