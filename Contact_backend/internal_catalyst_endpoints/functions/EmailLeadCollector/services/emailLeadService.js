'use strict';

/**
 * Service layer for EmailLead Data Store operations.
 * Encapsulates all CRUD logic against the Catalyst Data Store "EmailLead" table.
 */

const TABLE_NAME = 'EmailLead';

// ---------------------------------------------------------------------------
// Helper – build a Catalyst datastore table reference
// ---------------------------------------------------------------------------
function _getTable(catalystApp) {
  return catalystApp.datastore().table(TABLE_NAME);
}

// ---------------------------------------------------------------------------
// CREATE – Insert a new contact lead
// ---------------------------------------------------------------------------

/**
 * Inserts a new row into the EmailLead table.
 * Before inserting, checks for duplicate email addresses.
 *
 * @param {object} catalystApp  – initialised Catalyst SDK app instance
 * @param {object} leadData     – { email, name, phone_no, source }
 * @returns {object}            – the newly created row from the Data Store
 */
async function createLead(catalystApp, leadData) {
  const table = _getTable(catalystApp);

  // --- Duplicate-email check via ZCQL ----------------------------------
  const zcql = catalystApp.zcql();
  const duplicateQuery = `SELECT ROWID FROM ${TABLE_NAME} WHERE Email = '${leadData.email}'`;
  const existing = await zcql.executeZCQLQuery(duplicateQuery);

  if (existing && existing.length > 0) {
    const err = new Error(`A contact with email "${leadData.email}" already exists.`);
    err.statusCode = 409; // Conflict
    throw err;
  }

  // --- Build row object matching Data Store column names ----------------
  const row = {
    Email: leadData.email,
    Name: leadData.name,
    Phone_No: leadData.phone_no || '',
    Source: leadData.source || '',
  };

  console.log('[EmailLeadService] Inserting new lead:', JSON.stringify(row));

  // --- Insert via SDK ---------------------------------------------------
  const result = await table.insertRow(row);

  console.log('[EmailLeadService] Insert successful. ROWID:', result.ROWID);
  return result;
}

// ---------------------------------------------------------------------------
// READ – Fetch all leads with pagination
// ---------------------------------------------------------------------------

/**
 * Retrieves leads from the EmailLead table using ZCQL for pagination & sorting.
 *
 * @param {object} catalystApp  – initialised Catalyst SDK app instance
 * @param {number} limit        – max records to return  (default 10)
 * @param {number} offset       – number of records to skip (default 0)
 * @returns {{ leads: object[], total: number }}
 */
async function getLeads(catalystApp, limit = 10, offset = 0) {
  const zcql = catalystApp.zcql();

  // --- Total count query ------------------------------------------------
  const countQuery = `SELECT COUNT(ROWID) FROM ${TABLE_NAME}`;
  const countResult = await zcql.executeZCQLQuery(countQuery);

  // The SDK returns count in the first row under the table name key
  const total = countResult && countResult.length > 0
    ? parseInt(Object.values(countResult[0])[0] || '0', 10)
    : 0;

  // --- Paginated data query (sorted latest first by CREATEDTIME) -------
  const dataQuery =
    `SELECT ROWID, Email, Name, Phone_No, Source, CREATEDTIME, MODIFIEDTIME ` +
    `FROM ${TABLE_NAME} ORDER BY CREATEDTIME DESC LIMIT ${offset}, ${limit}`;

  const rows = await zcql.executeZCQLQuery(dataQuery);

  // Normalise rows – ZCQL wraps each row under the table name key
  const leads = (rows || []).map((row) => {
    const record = row[TABLE_NAME] || row;
    return {
      ROWID: record.ROWID,
      Email: record.Email,
      Name: record.Name,
      Phone_No: record.Phone_No,
      Source: record.Source,
      CREATEDTIME: record.CREATEDTIME,
      MODIFIEDTIME: record.MODIFIEDTIME,
    };
  });

  console.log(`[EmailLeadService] Fetched ${leads.length} of ${total} total leads.`);
  return { leads, total };
}

module.exports = {
  createLead,
  getLeads,
};
