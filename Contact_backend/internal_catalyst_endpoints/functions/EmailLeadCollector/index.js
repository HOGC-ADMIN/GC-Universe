'use strict';

const catalyst = require('zcatalyst-sdk-node');
const { validateContactPayload } = require('./validators/contactValidator');
const { createLead, getLeads } = require('./services/emailLeadService');

// ---------------------------------------------------------------------------
// Helper – Consistent JSON response wrapper
// ---------------------------------------------------------------------------

/**
 * Sends a uniform JSON response.
 *
 * @param {import("http").ServerResponse} res
 * @param {number}  statusCode
 * @param {string}  status   – "success" | "error"
 * @param {*}       data     – payload (object, array, null)
 * @param {string}  message  – human-readable message
 */
function sendResponse(res, statusCode, status, data, message) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify({ status, data, message }));
}

// ---------------------------------------------------------------------------
// Helper – Parse JSON body from an IncomingMessage stream
// ---------------------------------------------------------------------------
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON in request body.'));
      }
    });
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * POST /contact – Save a new contact lead into the EmailLead table.
 */
async function handlePostContact(req, res, catalystApp) {
  // Step 1 – Parse the request body
  const body = await parseBody(req);

  // Step 2 – Validate input fields
  const { valid, errors } = validateContactPayload(body);
  if (!valid) {
    return sendResponse(res, 400, 'error', null, errors.join(' '));
  }

  // Step 3 – Delegate to the service layer for insertion
  const result = await createLead(catalystApp, {
    email: body.email.trim(),
    name: body.name.trim(),
    phone_no: body.phone_no ? String(body.phone_no).trim() : '',
    source: body.source ? String(body.source).trim() : '',
  });

  // Step 4 – Return success response with the new record ID
  return sendResponse(res, 201, 'success', { ROWID: result.ROWID }, 'Contact lead created successfully.');
}

/**
 * GET /contacts – Fetch all contact leads with optional pagination.
 */
async function handleGetContacts(req, res, catalystApp) {
  // Step 1 – Parse query parameters for pagination
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const limit  = Math.max(1, parseInt(url.searchParams.get('limit'), 10) || 10);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset'), 10) || 0);

  // Step 2 – Fetch data via service layer
  const { leads, total } = await getLeads(catalystApp, limit, offset);

  // Step 3 – Return paginated results
  return sendResponse(res, 200, 'success', { leads, total, limit, offset }, 'Contacts fetched successfully.');
}

// ---------------------------------------------------------------------------
// Main request handler (entry point for Catalyst Advanced I/O function)
// ---------------------------------------------------------------------------

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse}  res
 */
module.exports = async (req, res) => {

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    const catalystApp = catalyst.initialize(req);
    const pathname = req.url.split('?')[0];
    const method   = req.method.toUpperCase();

    console.log(`[Router] ${method} ${req.url}`);

    if (method === 'POST' && pathname === '/contact') {
      return await handlePostContact(req, res, catalystApp);
    }

    if (method === 'GET' && pathname === '/contacts') {
      return await handleGetContacts(req, res, catalystApp);
    }

    if (pathname === '/') {
      return sendResponse(res, 200, 'success', null, 'EmailLeadCollector API is running.');
    }

    return sendResponse(res, 404, 'error', null, `Route ${method} ${pathname} not found.`);

  } catch (err) {
    console.error('[Error]', err.message || err);
    const code = err.statusCode || 500;
    const msg  = code === 500 ? 'Internal server error.' : err.message;
    return sendResponse(res, code, 'error', null, msg);
  }
};