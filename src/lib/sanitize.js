/**
 * Input Sanitization & Validation Utilities
 * Addresses: Finding 7 (XSS), Finding 8 (Type Confusion), Finding 9 (Length),
 *            Finding 10 (Required Fields), Finding 12 (Type Confusion)
 */

/**
 * Strips all HTML tags from a string to prevent Stored XSS (Finding 7).
 * @param {string} str
 * @returns {string}
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')         // Remove HTML tags
    .replace(/&lt;/g, '<')           // Decode common HTML entities for re-strip
    .replace(/<[^>]*>/g, '')         // Re-strip after decode
    .replace(/javascript:/gi, '')    // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')      // Remove event handlers like onerror=, onclick=
    .trim();
}

/**
 * Validates that a value is a non-empty string (Finding 8, 12).
 * Rejects objects, arrays, numbers, booleans — only accepts strings.
 * @param {*} value
 * @returns {boolean}
 */
export function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Safely casts a value to a string (Finding 8, 12).
 * Returns empty string for non-string types.
 * @param {*} value
 * @returns {string}
 */
export function safeString(value) {
  if (typeof value !== 'string') return '';
  return value;
}

/**
 * Validates a string field: type check + length check + XSS sanitization (Finding 7, 9, 12).
 * @param {*} value - The input value
 * @param {number} maxLength - Maximum allowed length
 * @returns {{ valid: boolean, sanitized: string, error: string|null }}
 */
export function validateAndSanitize(value, maxLength) {
  if (typeof value !== 'string') {
    return { valid: false, sanitized: '', error: 'must be a string' };
  }

  if (value.length > maxLength) {
    return { valid: false, sanitized: '', error: `must be ${maxLength} characters or fewer` };
  }

  const sanitized = stripHtml(value);
  return { valid: true, sanitized, error: null };
}

/**
 * Field length limits (Finding 9) — centralized config.
 */
export const FIELD_LIMITS = {
  // Auth fields
  name: 100,
  email: 254,
  password: 128,

  // Application fields
  organizationName: 200,
  contactPersonName: 100,
  contactEmail: 254,
  productName: 200,
  productCategory: 200,
  productCategoryOther: 200,
  deploymentModel: 200,
  briefDescription: 5000,
  keyFeatures: 5000,
  indigenousContent: 5000,
  ipOwnership: 2000,
  foreignComponents: 2000,
  sbomAvailability: 500,
  sbomFormat: 500,
  pocAvailability: 500,
  awards: 5000,
  benchmarking: 5000,
  deployments: 5000,
  aiAssessment: 5000,
  rvdPolicy: 5000,
};

/**
 * Required fields for application submission (Finding 10).
 */
export const REQUIRED_APPLICATION_FIELDS = [
  'organizationName',
  'contactPersonName',
  'contactEmail',
  'productName',
  'productCategory',
  'briefDescription',
];
