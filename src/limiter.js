// A sliding-window rate limiter: each key gets `limit` requests in any
// `windowMs`-long span. It keeps the timestamps of recent requests per key
// (a "sliding log"), so unlike a fixed window there is no 2x burst at a
// window boundary.

// `limits` overrides the default per key, e.g. { "partner-api": { limit: 100 } }.
// A function can be passed instead, to look limits up dynamically.

export function createLimiter({ limit = 10, windowMs = 60_000, limits = {}, now = Date.now } = {}) {
  const logs = new Map(); // key -> sorted timestamps of allowed requests
  const lookup = typeof limits === "function" ? limits : (key) => limits[key];

  function configFor(key) {
    const o = lookup(key) ?? {};
    return { limit: o.limit ?? limit, windowMs: o.windowMs ?? windowMs };
  }

  function prune(log, t, span) {
    while (log.length && log[0] <= t - span) log.shift();
  }

  function check(key) {
    const t = now();
    let log = logs.get(key);
    if (!log) {
      log = [];
      logs.set(key, log);
    }
    const cfg = configFor(key);
    prune(log, t, cfg.windowMs);
    if (log.length >= cfg.limit) {
      // The oldest request in the window is the next to expire.
      const retryAfterMs = log[0] + cfg.windowMs - t;
      return { allowed: false, remaining: 0, limit: cfg.limit, retryAfterMs };
    }
    log.push(t);
    return { allowed: true, remaining: cfg.limit - log.length, limit: cfg.limit };
  }

  return { check };
}

// Standard rate-limit response headers for a check() result.
// Retry-After is in whole seconds, rounded up so clients never retry early.
export function rateLimitHeaders(result) {
  const headers = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
  };
  if (!result.allowed) headers["Retry-After"] = String(Math.ceil(result.retryAfterMs / 1000));
  return headers;
}
