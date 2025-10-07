// 简易 Prometheus 指标（KISS/YAGNI）：仅计数与活动数
const metrics = {
  requestsTotal: 0,
  requestsInFlight: 0,
  errorsTotal: 0,
};

export function onRequestStart() {
  metrics.requestsTotal += 1;
  metrics.requestsInFlight += 1;
}

export function onRequestEnd() {
  if (metrics.requestsInFlight > 0) metrics.requestsInFlight -= 1;
}

export function onError() {
  metrics.errorsTotal += 1;
}

export function renderPrometheus() {
  return [
    '# HELP cors_sp_requests_total Total HTTP requests received',
    '# TYPE cors_sp_requests_total counter',
    `cors_sp_requests_total ${metrics.requestsTotal}`,
    '# HELP cors_sp_requests_inflight In-flight HTTP requests',
    '# TYPE cors_sp_requests_inflight gauge',
    `cors_sp_requests_inflight ${metrics.requestsInFlight}`,
    '# HELP cors_sp_errors_total Total error responses',
    '# TYPE cors_sp_errors_total counter',
    `cors_sp_errors_total ${metrics.errorsTotal}`,
  ].join('\n') + '\n';
}

