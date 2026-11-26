// A fixed-window rate limiter: each key gets `limit` requests per window.
// The window starts at a multiple of `windowMs`, so a burst at the end of one
// window and the start of the next can let through up to 2x `limit`.

export function createLimiter({ limit = 10, windowMs = 60_000, now = Date.now } = {}) {
  const windows = new Map(); // key -> { start, count }

  function check(key) {
    const t = now();
    const start = Math.floor(t / windowMs) * windowMs;
    let w = windows.get(key);
    if (!w || w.start !== start) {
      w = { start, count: 0 };
      windows.set(key, w);
    }
    if (w.count >= limit) return { allowed: false, remaining: 0 };
    w.count += 1;
    return { allowed: true, remaining: limit - w.count };
  }

  return { check };
}
