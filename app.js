'use strict';

// The Express server — already done for you. Do not edit.
// It wires your four functions into real routes. Production config (Module 5):
// CORS is locked to one origin and the JWT secret is read from .env.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  hashPassword,
  checkPassword,
  makeToken,
  requireAuth,
  requireAdmin,
  getBook,
} = require('./operations');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Demo users kept in memory. Passwords are hashed at startup (never stored plain).
const users = [];
(async () => {
  users.push({
    id: 1,
    email: 'reader@booknook.dev',
    role: 'member',
    passwordHash: await hashPassword('reader123'),
  });
  users.push({
    id: 2,
    email: 'boss@booknook.dev',
    role: 'admin',
    passwordHash: await hashPassword('boss123'),
  });
})();

// Log in: check the password, then hand back a token.
app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  res.json({ token: makeToken(user) });
});

// Any logged-in user can read a book (served through the Redis cache).
app.get('/books/:id', requireAuth, async (req, res) => {
  const { source, book } = await getBook(Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'book not found' });
  res.json({ source, book });
});

// Admin-only route.
app.delete('/books/:id', requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, deleted: Number(req.params.id) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BookNook API on http://localhost:${PORT}`));
