#!/usr/bin/env node

const jwt = require('jsonwebtoken');

const secret = 'secret_token'; // Из .env файла
const payload = {
  userId: 1,
  email: 'test@gmail.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 часа
};

const token = jwt.sign(payload, secret);
console.log('🔑 Сгенерированный JWT токен:');
console.log(token);
console.log('\n📝 Использование:');
console.log(`curl -H "Authorization: Bearer ${token}" -H "x-domain: test.ru" -H "x-api-key: test" http://localhost:3000/api/products`);
