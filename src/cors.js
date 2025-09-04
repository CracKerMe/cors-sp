/**
 * 为响应头添加 CORS 相关头部
 * @param {object} headers
 * @param {import('http').IncomingMessage} req
 * @returns {object} 新的 headers
 */
export function withCORS(headers, req) {
  const origin = req.headers.origin || "*";
  return {
    ...headers,
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers":
      req.headers["access-control-request-headers"] || "*",
    "access-control-expose-headers": "*",
  };
}
