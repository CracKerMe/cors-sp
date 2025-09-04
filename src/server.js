// 基础 HTTP 服务器，ESM 语法
import http from "http";
import httpProxy from "http-proxy";
import { createProxyHandler } from "./proxyHandler.js";

import { withCORS } from "./cors.js";
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 4399;

const createServer = (options) => {
  const proxy = httpProxy.createProxyServer(options);
  proxy.on("error", (err, req, res) => {
    const headers = withCORS({ "Content-Type": "text/plain" }, req);
    res.writeHead(502, headers);
    res.end("Proxy error: " + err.message);
  });

  const handler = createProxyHandler(options, proxy);
  return http.createServer(handler);
};

// 当直接运行时，启动服务器
// This allows the server to be started directly with `node src/server.js`
// and also to be imported and used in tests.
// Check if this file is being run directly, works on both Windows and Unix
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer({});
  server.listen(PORT, () => {
    console.log(`Proxy Server listening on http://localhost:${PORT}`);
  });
}

export { createServer };
