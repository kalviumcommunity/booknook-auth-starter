'use strict';

// A pretend "slow" book database — already done for you. Do not edit.
// In a real app this would be PostgreSQL/Prisma. Here it is an object, with a
// 150ms delay on every read so the Redis cache speed-up is easy to see.

const BOOKS = {
  1: { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas' },
  2: { id: 2, title: 'Clean Code', author: 'Robert C. Martin' },
  3: { id: 3, title: "You Don't Know JS", author: 'Kyle Simpson' },
};

// Returns the book, or null if there is no book with that id.
async function getBook(id) {
  await new Promise((resolve) => setTimeout(resolve, 150)); // simulate a slow query
  return BOOKS[id] || null;
}

module.exports = { getBook };
