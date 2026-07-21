// In-memory blacklist for JWT tokens (F-07 fix).
// Note: For a multi-instance deployment, this should use Redis or Postgres.
import crypto from 'crypto';

class TokenBlacklist {
  constructor() {
    this.blacklist = new Map();
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * Add a JTI (JWT ID) to the blacklist.
   * @param {string} jti - The JWT ID to blacklist
   * @param {number} expiryTimestamp - When the token naturally expires (in ms)
   */
  add(jti, expiryTimestamp) {
    if (!jti) return;
    this.blacklist.set(jti, expiryTimestamp);
  }

  /**
   * Check if a JTI is blacklisted.
   * @param {string} jti - The JWT ID to check
   * @returns {boolean} True if blacklisted
   */
  isBlacklisted(jti) {
    if (!jti) return false;
    return this.blacklist.has(jti);
  }

  /**
   * Remove expired tokens from the blacklist map to prevent memory leaks.
   */
  cleanup() {
    const now = Date.now();
    for (const [jti, expiry] of this.blacklist.entries()) {
      if (now > expiry) {
        this.blacklist.delete(jti);
      }
    }
  }
}

// Singleton instance
export const sessionBlacklist = new TokenBlacklist();

/**
 * Generate a unique JTI.
 */
export function generateJti() {
  return crypto.randomUUID();
}
