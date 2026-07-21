export class RateLimiter {
  constructor(windowMs = 60000, max = 5) {
    this.windowMs = windowMs;
    this.max = max;
    this.hits = new Map();
  }

  /**
   * Checks if the given key (e.g., IP address or User ID) has exceeded the rate limit.
   * @param {string} key
   * @returns {{ success: boolean, remaining: number, resetTime: Date }}
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

    const success = record.count <= this.max;
    const remaining = Math.max(0, this.max - record.count);
    const resetTime = new Date(record.startTime + this.windowMs);

    return { success, remaining, resetTime };
  }
}

// Singleton instances for different endpoints
export const authRateLimiter = new RateLimiter(60 * 1000, 25); // 25 attempts per minute to support legitimate multi-step workflows (F-14)
export const submitRateLimiter = new RateLimiter(60 * 60 * 1000, 1); // 1 submission per hour per user/IP
