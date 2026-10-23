'use strict';

// Test runner — already done for you. Do not edit.
// Run it with:  npm test   (Redis must be running).

require('dotenv').config();
process.env.ACCESS_SECRET = process.env.ACCESS_SECRET || 'test-secret';

const jwt = require('jsonwebtoken');
const redis = require('./redisClient');
const ops = require('./operations');

let passed = 0;
let failed = 0;

function check(name, cond) {
  if (cond) {
    console.log('  PASS  ' + name);
    passed++;
  } else {
    console.log('  FAIL  ' + name);
    failed++;
  }
}

// Runs one task's checks; a thrown error counts as a failure but does not stop
// the rest of the suite.
async function task(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.log('  FAIL  ' + name + ' threw: ' + err.message);
    failed++;
  }
}

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

(async () => {
  console.log('Running BookNook tests...\n');

  // ---- Task 1 ----
  await task('Task 1', async () => {
    const hash = await ops.hashPassword('secret123');
    check(
      'Task 1: hashPassword returns a bcrypt hash (not the plain text)',
      typeof hash === 'string' && hash.startsWith('$2') && hash !== 'secret123'
    );
    check(
      'Task 1: checkPassword is true for the right password',
      (await ops.checkPassword('secret123', hash)) === true
    );
    check(
      'Task 1: checkPassword is false for a wrong password',
      (await ops.checkPassword('wrong', hash)) === false
    );
  });

  // ---- Task 2 ----
  await task('Task 2', async () => {
    const token = ops.makeToken({ id: 7, role: 'admin' });
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    check('Task 2: makeToken puts the user id in "sub"', String(decoded.sub) === '7');
    check('Task 2: makeToken puts the role in the payload', decoded.role === 'admin');
    check('Task 2: makeToken sets an expiry', typeof decoded.exp === 'number');
  });

  // ---- Task 3: requireAuth ----
  await task('Task 3 requireAuth', async () => {
    const good = ops.makeToken({ id: 9, role: 'member' });

    let req = { headers: { authorization: 'Bearer ' + good } };
    let res = fakeRes();
    let nexted = false;
    ops.requireAuth(req, res, () => { nexted = true; });
    check('Task 3: requireAuth calls next() for a valid token', nexted === true);
    check('Task 3: requireAuth sets req.user.id from the token', req.user && String(req.user.id) === '9');

    req = { headers: {} };
    res = fakeRes();
    nexted = false;
    ops.requireAuth(req, res, () => { nexted = true; });
    check('Task 3: requireAuth sends 401 when the token is missing', nexted === false && res.statusCode === 401);

    req = { headers: { authorization: 'Bearer not.a.real.token' } };
    res = fakeRes();
    nexted = false;
    ops.requireAuth(req, res, () => { nexted = true; });
    check('Task 3: requireAuth sends 401 for an invalid token', nexted === false && res.statusCode === 401);
  });

  // ---- Task 3: requireAdmin ----
  await task('Task 3 requireAdmin', async () => {
    let req = { user: { id: 1, role: 'admin' } };
    let res = fakeRes();
    let nexted = false;
    ops.requireAdmin(req, res, () => { nexted = true; });
    check('Task 3: requireAdmin allows an admin through', nexted === true);

    req = { user: { id: 2, role: 'member' } };
    res = fakeRes();
    nexted = false;
    ops.requireAdmin(req, res, () => { nexted = true; });
    check('Task 3: requireAdmin sends 403 for a non-admin', nexted === false && res.statusCode === 403);

    req = {};
    res = fakeRes();
    nexted = false;
    ops.requireAdmin(req, res, () => { nexted = true; });
    check('Task 3: requireAdmin sends 401 when nobody is logged in', nexted === false && res.statusCode === 401);
  });

  // ---- Task 4: cache-aside ----
  await task('Task 4', async () => {
    await redis.del('book:1');

    const miss = await ops.getBook(1);
    check(
      'Task 4: first read comes from the db',
      miss && miss.source === 'db' && miss.book && miss.book.id === 1
    );

    const hit = await ops.getBook(1);
    check(
      'Task 4: second read comes from the cache',
      hit && hit.source === 'cache' && hit.book && hit.book.id === 1
    );

    const ttl = await redis.ttl('book:1');
    check('Task 4: the cached book expires in ~60 seconds', ttl > 0 && ttl <= 60);
  });

  // ---- Result ----
  console.log('');
  console.log(
    '  RESULT: ' + (failed === 0 ? 'all passed' : passed + ' passed') + ', ' + failed + ' failed'
  );
  if (failed === 0) console.log('\u2713 All tests passed!');

  await redis.quit();
  process.exit(failed === 0 ? 0 : 1);
})();
