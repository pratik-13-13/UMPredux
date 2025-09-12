// App constants
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRES_IN: '30d',
  BCRYPT_SALT_ROUNDS: 12,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:5000'
};
