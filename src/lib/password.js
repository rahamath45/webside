/**
 * Password Hashing — Node.js built-in crypto (no external packages)
 *
 * Uses scrypt key derivation with a random 16-byte salt.
 * Format stored in DB: "salt:hash" (both hex-encoded).
 */
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hash a plain-text password.
 * @param {string} password
 * @returns {Promise<string>} "salt:hash" string to store in DB
 */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${salt}:${buf.toString('hex')}`;
}

/**
 * Verify a plain-text password against a stored "salt:hash".
 * Uses timingSafeEqual to prevent timing attacks.
 * @param {string} password  — user input
 * @param {string} stored    — "salt:hash" from DB
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  const buf = await scryptAsync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return timingSafeEqual(buf, keyBuffer);
}
