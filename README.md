# BookNook — A Safe Login API (Starter)

A tiny library API. Everything is already written **except four small functions**
in `operations.js`. Finish them, make the tests go green, and submit a ZIP.

## Setup

```bash
npm install
cp .env.example .env

# start Redis (any one):
redis-server
# or:  docker run -d --name redis -p 6379:6379 redis

npm test
```

## What you edit

Only **`operations.js`**. Each function has a step-by-step hint in the comments.

| Task | Function(s) | Concept |
|------|-------------|---------|
| 1 (8 marks) | `hashPassword`, `checkPassword` | bcrypt password hashing |
| 2 (7 marks) | `makeToken` | JWT `jwt.sign` |
| 3 (8 marks) | `requireAuth`, `requireAdmin` | auth middleware + RBAC |
| 4 (7 marks) | `getBook` | cache-aside with Redis |

## Do not edit

`app.js`, `db.js`, `redisClient.js`, `test.js`, `package.json`.

## When you are done

A correct solution ends with:

```
  RESULT: all passed, 0 failed
✓ All tests passed!
```

## Submit

One ZIP (no `node_modules`, no `.env`):

- your completed `operations.js`, and
- `RESULT.txt` — your full `npm test` output.
