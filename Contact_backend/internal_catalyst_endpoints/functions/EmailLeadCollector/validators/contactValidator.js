'use strict';

/**
 * Validation helpers for incoming Contact-Us request payloads.
 */

// Simple RFC-5322-ish email regex (covers the vast majority of valid addresses)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allows digits, spaces, dashes, parens, and an optional leading +
// Minimum 7 characters after stripping non-digit chars
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

/**
 * Validates the request body for POST /contact.
 *
 * @param {object} body – parsed JSON body
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateContactPayload(body = {}) {
  const errors = [];

  // --- email: required & format check -----------------------------------
  if (!body.email || typeof body.email !== 'string' || body.email.trim() === '') {
    errors.push('email is required.');
  } else if (!EMAIL_REGEX.test(body.email.trim())) {
    errors.push('email must be a valid email address.');
  }

  // --- name: required ----------------------------------------------------
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required.');
  }

  // --- phone_no: optional but validated when present --------------------
  if (body.phone_no !== undefined && body.phone_no !== null && body.phone_no !== '') {
    const phone = String(body.phone_no).trim();
    if (!PHONE_REGEX.test(phone)) {
      errors.push('phone_no must be a valid phone number (7-20 digits, optional +, spaces, dashes).');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateContactPayload };
