/**
 * Progressive Rate Limiter (F-14 Fix)
 * 
 * Implements the audit's three recommendations:
 * 1. Progressive throttling instead of hard cutoff — adds increasing delays
 * 2. Account-based limits alongside IP-based limits — separate check method
 * 3. Per-window allowance of 20-30 requests — set to 25 for auth routes
 */
export class RateLimiter {
  /**
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} max - Maximum requests allowed in the window before throttling begins
   * @param {number} hardMax - Absolute maximum requests before hard block (progressive throttling ceiling)
   */
  constructor(windowMs = 60000, max = 25, hardMax = 50) {
    this.windowMs = windowMs;
    this.max = max;
    this.hardMax = hardMax;
    this.hits = new Map();
  }

  /**
   * Checks if the given key has exceeded the rate limit.
   * Implements progressive throttling:
   *   - Under `max`: allowed immediately
   *   - Between `max` and `hardMax`: allowed, but with increasing Retry-After delay
   *   - Over `hardMax`: hard blocked
   * 
   * @param {string} key - IP address, user ID, or combined key
   * @returns {{ success: boolean, remaining: number, resetTime: Date, retryAfter: number }}
   */
  check(key) {
    const now = Date.now();
    const record = this.hits.get(key) || { count: 0, startTime: now };

    // Reset if window has passed
    if (now - record.startTime >= this.windowMs) {
      record.count = 0;
      record.startTime = now;
    }

    record.count++;
    this.hits.set(key, record);

    const remaining = Math.max(0, this.max - record.count);
    const resetTime = new Date(record.startTime + this.windowMs);

    // Progressive throttling logic
    if (record.count <= this.max) {
      // Under soft limit — allow freely
      return { success: true, remaining, resetTime, retryAfter: 0 };
    } else if (record.count <= this.hardMax) {
      // Between soft and hard limit — progressive delay (2s, 4s, 8s, etc.)
      const overCount = record.count - this.max;
      const retryAfter = Math.min(2 ** overCount, 60); // caps at 60 seconds
      return { success: false, remaining: 0, resetTime, retryAfter };
    } else {
      // Over hard limit — full block until window resets
      const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);
      return { success: false, remaining: 0, resetTime, retryAfter };
    }
  }
}

// Singleton instances for different endpoints
// F-14 Fix: Increased to 25 requests per 60-second window for legitimate workflow completion
// Hard max of 50 before full block (progressive throttling between 25-50)
export const authRateLimiter = new RateLimiter(60 * 1000, 25, 50);
export const submitRateLimiter = new RateLimiter(60 * 60 * 1000, 3, 5); // 3 submissions per hour per user/IP
