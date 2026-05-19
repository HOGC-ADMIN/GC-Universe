# EmailLeadCollector API

A backend API built on **Zoho Catalyst (Node.js)** to manage "Contact Us" form submissions. It stores leads in a Catalyst Data Store table and exposes REST endpoints to create and retrieve them.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Data Store Schema](#data-store-schema)
4. [API Endpoints](#api-endpoints)
   - [POST /contact](#post-contact)
   - [GET /contacts](#get-contacts)
   - [GET /](#get--health-check)
5. [Pagination](#pagination)
6. [Validation Rules](#validation-rules)
7. [Duplicate Email Prevention](#duplicate-email-prevention)
8. [Response Format](#response-format)
9. [Error Handling](#error-handling)
10. [Deployment](#deployment)

---

## Architecture Overview

```
Client (Browser / Form / Postman)
        │
        ▼
┌──────────────────────────┐
│  index.js  (Router)      │  ← Catalyst Advanced I/O Function
│  • Parses request        │
│  • Routes to handler     │
│  • Returns JSON response │
└────────┬─────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  validators/                 │
    │  contactValidator.js         │  ← Input validation layer
    └────┬─────────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  services/                   │
    │  emailLeadService.js         │  ← Business logic + Data Store ops
    └────┬─────────────────────────┘
         │
         ▼
   Catalyst Data Store (EmailLead table)
```

**How it works:**

1. A request hits the Catalyst Advanced I/O function entry point (`index.js`).
2. The Catalyst SDK is initialised from the incoming request.
3. The router matches the HTTP method + path and calls the appropriate handler.
4. The handler validates input (for `POST`) and delegates to the **service layer**.
5. The service layer communicates with the **Catalyst Data Store** via the SDK and ZCQL queries.
6. A consistent JSON response is sent back to the client.

---

## Project Structure

```
functions/EmailLeadCollector/
├── index.js                        # Main entry point – routing & response helpers
├── package.json                    # Dependencies (zcatalyst-sdk-node)
├── catalyst-config.json            # Catalyst deployment config
├── services/
│   └── emailLeadService.js         # CRUD operations against Data Store
└── validators/
    └── contactValidator.js         # Request body validation logic
```

| File | Responsibility |
|------|----------------|
| `index.js` | HTTP routing, body parsing, response formatting |
| `emailLeadService.js` | Insert & query operations on the `EmailLead` table |
| `contactValidator.js` | Validates email, name, and phone fields |

---

## Data Store Schema

**Table Name:** `EmailLead`

| Column | Type | Description |
|--------|------|-------------|
| `Email` | varchar | Contact's email address |
| `Name` | varchar | Contact's full name |
| `Phone_No` | varchar | Contact's phone number (optional) |
| `Source` | text | Where the lead came from (e.g. "website", "landing-page") |
| `ROWID` | bigint | Auto-generated unique row ID (system column) |
| `CREATEDTIME` | datetime | Auto-generated creation timestamp (system column) |
| `MODIFIEDTIME` | datetime | Auto-generated last-modified timestamp (system column) |

> **Note:** `ROWID`, `CREATEDTIME`, and `MODIFIEDTIME` are system-managed columns provided automatically by Catalyst Data Store.

---

## API Endpoints

### POST /contact

**Purpose:** Save a new contact lead into the `EmailLead` table.

**URL:** `/contact`
**Method:** `POST`
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "phone_no": "+1-555-123-4567",
  "source": "website-contact-form"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | **Yes** | Must be a valid email format |
| `name` | string | **Yes** | Contact's name |
| `phone_no` | string | No | Valid phone number (7-20 digits, optional `+`, spaces, dashes) |
| `source` | string | No | Origin of the lead |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "data": {
    "ROWID": "3440000000012345"
  },
  "message": "Contact lead created successfully."
}
```

#### Validation Error (400 Bad Request)

```json
{
  "status": "error",
  "data": null,
  "message": "email is required. name is required."
}
```

#### Duplicate Email (409 Conflict)

```json
{
  "status": "error",
  "data": null,
  "message": "A contact with email \"john@example.com\" already exists."
}
```

#### cURL Example

```bash
curl -X POST https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "name": "Jane Smith",
    "phone_no": "9876543210",
    "source": "landing-page"
  }'
```

---

### GET /contacts

**Purpose:** Fetch all contact leads with pagination support.

**URL:** `/contacts`
**Method:** `GET`

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | `10` | Maximum number of records to return (min 1) |
| `offset` | number | `0` | Number of records to skip |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "leads": [
      {
        "ROWID": "3440000000012345",
        "Email": "jane@example.com",
        "Name": "Jane Smith",
        "Phone_No": "9876543210",
        "Source": "landing-page",
        "CREATEDTIME": "2026-04-11 10:30:00",
        "MODIFIEDTIME": "2026-04-11 10:30:00"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  },
  "message": "Contacts fetched successfully."
}
```

#### cURL Examples

```bash
# Fetch first 10 contacts (defaults)
curl https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contacts

# Fetch 5 contacts, skipping the first 10
curl "https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contacts?limit=5&offset=10"
```

---

### GET / (Health Check)

**Purpose:** Verify the API is running.

```bash
curl https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": null,
  "message": "EmailLeadCollector API is running."
}
```

---

## Pagination

Pagination is implemented using **limit/offset** via ZCQL queries against the Catalyst Data Store.

### How it works

1. The client sends `limit` and `offset` as query parameters on `GET /contacts`.
2. The service layer runs **two ZCQL queries**:
   - `SELECT COUNT(ROWID) FROM EmailLead` → returns the **total** number of records.
   - `SELECT ... FROM EmailLead ORDER BY CREATEDTIME DESC LIMIT {offset}, {limit}` → returns the **page** of records.
3. Results are sorted **newest first** (`CREATEDTIME DESC`).
4. The response includes `total`, `limit`, and `offset` so the client can calculate:
   - **Total pages:** `Math.ceil(total / limit)`
   - **Current page:** `Math.floor(offset / limit) + 1`
   - **Has next page:** `offset + limit < total`

### Pagination examples

| Scenario | Query | Records returned |
|----------|-------|-----------------|
| First page (default) | `/contacts` | Records 1–10 |
| Second page | `/contacts?limit=10&offset=10` | Records 11–20 |
| Custom page size | `/contacts?limit=25&offset=0` | Records 1–25 |
| Third page, 5 per page | `/contacts?limit=5&offset=10` | Records 11–15 |

### Client-side pagination example (JavaScript)

```javascript
let currentPage = 1;
const pageSize = 10;

async function loadPage(page) {
  const offset = (page - 1) * pageSize;
  const res = await fetch(`/contacts?limit=${pageSize}&offset=${offset}`);
  const json = await res.json();

  const totalPages = Math.ceil(json.data.total / pageSize);
  console.log(`Page ${page} of ${totalPages}`);
  console.log(json.data.leads);
}
```

---

## Validation Rules

All validation is performed in `validators/contactValidator.js` before any database operation.

| Field | Rule | Regex / Logic |
|-------|------|---------------|
| `email` | Required, valid format | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `name` | Required, non-empty string | Type check + trim |
| `phone_no` | Optional; if provided must be valid | `/^[+]?[\d\s\-().]{7,20}$/` |
| `source` | Optional, no validation | Passed as-is |

If validation fails, a **400** response is returned with all error messages concatenated.

---

## Duplicate Email Prevention

Before inserting a new lead, the service layer runs a ZCQL query:

```sql
SELECT ROWID FROM EmailLead WHERE Email = '<submitted_email>'
```

- If a matching row exists → **409 Conflict** is returned.
- If no match → the insert proceeds normally.

This prevents the same email from being stored twice.

---

## Response Format

Every endpoint returns a **consistent JSON structure**:

```json
{
  "status": "success | error",
  "data": { },
  "message": "Human-readable description"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"success"` or `"error"` | Indicates outcome |
| `data` | object / array / null | Payload (null on errors) |
| `message` | string | Explanation of the result |

### HTTP Status Codes Used

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET |
| 201 | Created | Successful POST (new record inserted) |
| 400 | Bad Request | Validation errors |
| 404 | Not Found | Unknown route |
| 409 | Conflict | Duplicate email |
| 500 | Internal Server Error | Unexpected failures |

---

## Error Handling

- A **top-level `try/catch`** in `index.js` wraps all route handling.
- Known errors (validation, duplicate) carry a custom `statusCode` property and surface a meaningful message.
- Unknown / unexpected errors return a generic **500 Internal Server Error** message (to avoid leaking internals).
- All errors are logged to `console.error` for debugging in the Catalyst logs console.

---

## Deployment

1. **Install dependencies:**

   ```bash
   cd functions/EmailLeadCollector
   npm install
   ```

2. **Create the Data Store table** in the Catalyst console:
   - Go to **Data Store → Create Table** → name it `EmailLead`.
   - Add columns: `Email` (varchar), `Name` (varchar), `Phone_No` (varchar), `Source` (text).

3. **Deploy the function:**

   ```bash
   catalyst deploy
   ```

4. **Test your endpoints** using the Catalyst domain URL:

   ```
   https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contact
   https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contacts
   ```

---

## License

Internal project — HOGC.
