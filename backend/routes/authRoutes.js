const express = require('express');
const { signup, login } = require('../controllers/authController');
const { validateBody } = require('../middleware/validationMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { signupSchema, loginSchema } = require('../utils/validations');

const router = express.Router();

const signupLimiter = createRateLimiter({
  prefix: 'signup',
  ipMax: 10,
  identityMax: 5,
  windowMs: 60 * 60 * 1000,
  identityResolver: (req) =>
    typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : 'unknown',
});

const loginLimiter = createRateLimiter({
  prefix: 'login',
  ipMax: 20,
  identityMax: 8,
  windowMs: 15 * 60 * 1000,
  identityResolver: (req) =>
    typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : 'unknown',
});

router.post('/signup', signupLimiter, validateBody(signupSchema), signup);
router.post('/login', loginLimiter, validateBody(loginSchema), login);

module.exports = router;
