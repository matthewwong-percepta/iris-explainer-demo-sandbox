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

test("a new window resets the count", () => {
  let t = 0;
  const l = createLimiter({ limit: 1, windowMs: 1000, now: () => t });
  assert.equal(l.check("a").allowed, true);
  t = 1000;
  assert.equal(l.check("a").allowed, true);
});
