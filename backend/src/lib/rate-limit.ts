import { rateLimit } from 'express-rate-limit'
import { AppError } from './app-error.ts'

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (_req, _res, next) => {
    next(new AppError(429, 'TOO_MANY_REQUESTS', 'Terlalu banyak upload, coba lagi nanti'))
  },
})
