'use strict';

// The Redis connection — already done for you. Do not edit.
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

module.exports = redis;
