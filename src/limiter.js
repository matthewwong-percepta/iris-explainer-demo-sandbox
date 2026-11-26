// A sliding-window rate limiter: each key gets `limit` requests in any
// `windowMs`-long span. It keeps the timestamps of recent requests per key
// (a "sliding log"), so unlike a fixed window there is no 2x burst at a
// window boundary.

export function createLimiter({ limit = 10, windowMs = 60_000, now = Date.now } = {}) {
  const logs = new Map(); // key -> sorted timestamps of allowed requests

  function prune(log, t) {
    while (log.length && log[0] <= t - windowMs) log.shift();
  }

  function check(key) {
    const t = now();
    let log = logs.get(key);
    if (!log) {
      log = [];
      logs.set(key, log);
    }
    prune(log, t);
    if (log.length >= limit) return { allowed: false, remaining: 0 };
    log.push(t);
    return { allowed: true, remaining: limit - log.length };
  }

  return { check };
}
