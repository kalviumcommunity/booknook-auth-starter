'use strict';

/*
 * BookNook — complete the FOUR tasks below.
 *
 * Edit ONLY this file. Do not rename the functions and do not change what they
 * return — the tests in test.js depend on it.
 *
 * Each task is a line or two. Follow the numbered hints in the comments.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('./redisClient');
const db = require('./db');

// ------------------------------------------------------------------
// Task 1 — Hash and check a password (8 marks)
// ------------------------------------------------------------------

async function hashPassword(plain) {
  // TODO: return a bcrypt hash of `plain` using  bcrypt.hash(plain, 10)
}

async function checkPassword(plain, hash) {
  // TODO: return true/false using  bcrypt.compare(plain, hash)
}

// ------------------------------------------------------------------
// Task 2 — Make a login token (7 marks)
// ------------------------------------------------------------------

function makeToken(user) {
  // TODO: return jwt.sign(
  //   { sub: user.id, role: user.role },
  //   process.env.ACCESS_SECRET,
  //   { expiresIn: '15m' }
  // );
}

// ------------------------------------------------------------------
// Task 3 — Check the token and the role (8 marks)
// ------------------------------------------------------------------

function requireAuth(req, res, next) {
  // TODO:
  // 1. const header = req.headers.authorization || '';
  // 2. const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  // 3. if (!token) return res.status(401).json({ error: 'missing token' });
  // 4. try {
  //      const payload = jwt.verify(token, process.env.ACCESS_SECRET);
  //      req.user = { id: payload.sub, role: payload.role };
  //      next();
  //    } catch {
  //      return res.status(401).json({ error: 'invalid token' });
  //    }
}

function requireAdmin(req, res, next) {
  // TODO:
  // if (!req.user) return res.status(401).json({ error: 'not logged in' });
  // if (req.user.role !== 'admin') return res.status(403).json({ error: 'admins only' });
  // next();
}

// ------------------------------------------------------------------
// Task 4 — Read a book through the cache (7 marks)
// ------------------------------------------------------------------

async function getBook(bookId) {
  // TODO:
  // 1. const cached = await redis.get(`book:${bookId}`);
  // 2. if (cached) return { source: 'cache', book: JSON.parse(cached) };
  // 3. const book = await db.getBook(bookId);
  // 4. if (book) await redis.set(`book:${bookId}`, JSON.stringify(book), 'EX', 60);
  // 5. return { source: 'db', book };
}

module.exports = {
  hashPassword,
  checkPassword,
  makeToken,
  requireAuth,
  requireAdmin,
  getBook,
};
