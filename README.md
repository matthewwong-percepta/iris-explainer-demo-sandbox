# ratelimit-demo

A tiny in-memory rate limiter. It exists as a sandbox for testing the Iris
explainer bot: comment `@iris-explain` on a pull request here to get a narrated
explainer of it (and of the rest of its stack).

```js
import { createLimiter } from "./src/limiter.js";
const limiter = createLimiter({ limit: 10, windowMs: 60_000 });
limiter.check("user-123"); // { allowed: true, remaining: 9 }
```

Run the tests with `npm test`.

## When to use it

It keeps all state in memory, so it suits a single process: a CLI, a worker,
or one server instance. Behind a load balancer each instance would count
separately; use a shared store (Redis, for example) for that.
