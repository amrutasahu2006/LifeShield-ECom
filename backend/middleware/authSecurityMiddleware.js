const attempts = new Map()

const DEFAULT_WINDOW_MS = 15 * 60 * 1000
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000

const getClientKey = (req, scope) => {
  const forwardedFor = req.headers['x-forwarded-for']
  const ip = typeof forwardedFor === 'string' && forwardedFor.length > 0
    ? forwardedFor.split(',')[0].trim()
    : req.ip || req.connection?.remoteAddress || 'unknown'

  return `${scope}:${ip}:${req.originalUrl}`
}

const createRateLimiter = ({ windowMs = DEFAULT_WINDOW_MS, max = 10, message = 'Too many attempts. Please try again later.' } = {}) => {
  return (req, res, next) => {
    const key = getClientKey(req, req.route?.path || req.path || 'auth')
    const now = Date.now()
    const entry = attempts.get(key)

    if (!entry || now > entry.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= max) {
      res.set('Retry-After', Math.ceil((entry.resetAt - now) / 1000))
      return res.status(429).json({ message })
    }

    entry.count += 1
    next()
  }
}

setInterval(() => {
  const now = Date.now()

  for (const [key, entry] of attempts.entries()) {
    if (!entry || now > entry.resetAt) {
      attempts.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS).unref?.()

module.exports = {
  createRateLimiter,
}