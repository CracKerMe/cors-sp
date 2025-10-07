import { parseURL } from "./urlParser.js";
import { isValidHostName } from "./utils.js";
import { withCORS } from "./cors.js";
import { onRequestStart, onRequestEnd, onError, renderPrometheus } from "./metrics.js";

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
  // 根路径文档页渲染（KISS/YAGNI：仅提供必要说明）
  const renderLandingHTML = (req) => {
    const host = req.headers.host || `localhost:${process.env.PORT || 4399}`;
    const base = `http://${host}`;
    return `<!doctype html>\n<html lang="zh-CN">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>CORS Proxy 服务</title>\n  <style>\n    body { font-family: system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif; margin: 2rem; line-height: 1.6; }\n    code, pre { background: #f5f7fa; padding: 0.2rem 0.4rem; border-radius: 4px; }\n    pre { padding: 0.8rem; overflow: auto; }\n    h1, h2 { margin: 0.2rem 0 0.6rem; }\n    .tip { color: #666; }\n  </style>\n</head>\n<body>\n  <h1>CORS Proxy Server</h1>\n  <p class="tip">通过在目标 URL 前加上代理前缀来解决跨域。</p>\n  <h2>用法</h2>\n  <pre><code>${base}/&lt;目标URL&gt;</code></pre>\n  <h2>示例</h2>\n  <pre><code>GET ${base}/https://api.github.com/users/octocat\nGET ${base}/https://jsonplaceholder.typicode.com/posts/1</code></pre>\n  <h2>说明</h2>\n  <ul>\n    <li>支持 <code>GET/POST/PUT/DELETE</code> 等常见方法。</li>\n    <li>自动添加 CORS 响应头。</li>\n    <li>可设置 <code>PORT</code> 环境变量修改端口（默认 4399）。</li>\n  </ul>\n  <p class="tip">将真实 API 地址拼接在 <code>${base}/</code> 后即可。</p>\n</body>\n</html>`;
  };
  return (req, res) => {
    const start = Date.now();
    const reqId = Math.random().toString(36).slice(2, 10);
    onRequestStart();
    const log = (level, data) => {
      try {
        console.log(JSON.stringify({ level, reqId, method: req.method, path: req.url, origin: req.headers.origin || null, ...data }));
      } catch {}
    };

    // 健康检查与指标
    if (req.url === "/healthz") {
      const headers = withCORS({ "Content-Type": "application/json" }, req);
      res.writeHead(200, headers);
      res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
      onRequestEnd();
      return;
    }
    if (req.url === "/metrics") {
      const text = renderPrometheus();
      res.writeHead(200, { "Content-Type": "text/plain; version=0.0.4" });
      res.end(text);
      onRequestEnd();
      return;
    }
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
      onError();
      res.writeHead(403, withCORS({ "Content-Type": "application/json" }, req));
      res.end(JSON.stringify({ error: "origin_blacklisted" }));
      onRequestEnd();
      return;
    }
    if (originWhitelist.length && !originWhitelist.includes(origin)) {
      onError();
      res.writeHead(403, withCORS({ "Content-Type": "application/json" }, req));
      res.end(JSON.stringify({ error: "origin_not_whitelisted" }));
      onRequestEnd();
      return;
    }

    // 0.2 检查必需头部
    if (
      requireHeader.length &&
      !requireHeader.every((h) => req.headers[h.toLowerCase()])
    ) {
      onError();
      res.writeHead(400, withCORS({ "Content-Type": "application/json" }, req));
      res.end(JSON.stringify({ error: "missing_required_header" }));
      onRequestEnd();
      return;
    }

    // 0.3 检查限流
    if (typeof checkRateLimit === "function" && !checkRateLimit(req)) {
      onError();
      res.writeHead(429, withCORS({ "Content-Type": "application/json" }, req));
      res.end(JSON.stringify({ error: "rate_limit_exceeded" }));
      onRequestEnd();
      return;
    }
    // 1. 提取目标 URL
    const url = decodeURIComponent(req.url.substring(1));
    if (!url || req.url === "/") {
      const headers = withCORS({ "Content-Type": "text/html; charset=utf-8" }, req);
      res.writeHead(200, headers);
      res.end(renderLandingHTML(req));
      onRequestEnd();
      return;
    }
    const targetLocation = parseURL(url);
    if (!targetLocation) {
      onError();
      res.writeHead(400, withCORS({ "Content-Type": "application/json" }, req));
      res.end(JSON.stringify({ error: "invalid_target_url" }));
      onRequestEnd();
      return;
    }
    // 2. 主机名校验
    if (!isValidHostName(targetLocation.hostname)) {
      onError();
      res.writeHead(404, withCORS({ "Content-Type": "application/json" }, req));
      res.end(JSON.stringify({ error: "invalid_host" }));
      onRequestEnd();
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
      // 记录成功日志
      try { console.log(JSON.stringify({ level: "info", reqId, status: proxyRes.statusCode, target: targetLocation.href, duration_ms: Date.now() - start })); } catch {}
    });
    proxy.web(req, res, {
      target: targetLocation.href,
      ignorePath: true,
      changeOrigin: true,
    });
    res.on("close", () => {
      onRequestEnd();
    });
  };
}
    // 基础可靠性：socket 超时（15s 默认）
    try {
      req.socket.setTimeout(15000, () => {
        onError();
        try {
          res.writeHead(504, withCORS({ "Content-Type": "application/json" }, req));
          res.end(JSON.stringify({ error: "client_timeout" }));
        } catch {}
        try { req.destroy(); } catch {}
        onRequestEnd();
      });
    } catch {}
