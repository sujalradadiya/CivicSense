/**
 * In-memory sliding-window rate limiter for sensitive endpoints
 */
const rateLimitMap = new Map();

/**
 * Creates a rate limiting middleware
 * @param {number} maxAttempts Maximum allowed requests in window
 * @param {number} windowMs Window duration in milliseconds (default: 15 minutes)
 */
const rateLimiter = (maxAttempts = 10, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const key = `${req.baseUrl}${req.path}:${ip}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);

    if (!record) {
      record = {
        attempts: 1,
        resetTime: now + windowMs,
      };
      rateLimitMap.set(key, record);
      return next();
    }

    // If window expired, reset
    if (now > record.resetTime) {
      record.attempts = 1;
      record.resetTime = now + windowMs;
      rateLimitMap.set(key, record);
      return next();
    }

    record.attempts += 1;

    if (record.attempts > maxAttempts) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${waitSeconds} seconds.`,
      });
    }

    next();
  };
};

module.exports = {
  rateLimiter,
};
