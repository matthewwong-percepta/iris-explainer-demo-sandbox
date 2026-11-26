import { test } from "node:test";
import assert from "node:assert/strict";
import { createLimiter } from "../src/limiter.js";

test("allows up to the limit, then blocks", () => {
  let t = 0;
  const l = createLimiter({ limit: 2, windowMs: 1000, now: () => t });
  assert.equal(l.check("a").allowed, true);
  assert.equal(l.check("a").allowed, true);
  assert.equal(l.check("a").allowed, false);
});

test("requests older than the window stop counting", () => {
  let t = 0;
  const l = createLimiter({ limit: 1, windowMs: 1000, now: () => t });
  assert.equal(l.check("a").allowed, true);
  t = 1000;
  assert.equal(l.check("a").allowed, true);
});

test("no burst across a window boundary", () => {
  let t = 900;
  const l = createLimiter({ limit: 2, windowMs: 1000, now: () => t });
  assert.equal(l.check("a").allowed, true);
  assert.equal(l.check("a").allowed, true);
  t = 1100; // a fixed window would have reset at 1000
  assert.equal(l.check("a").allowed, false);
  t = 1901;
  assert.equal(l.check("a").allowed, true);
});
