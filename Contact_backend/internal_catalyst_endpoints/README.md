# HOGC – hogcHomePage (Zoho Catalyst Project)

Step-by-step guide to clone, set up, and deploy the **hogcHomePage** Catalyst project under the **HOGC** organisation.

---

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | v18 or later | [https://nodejs.org](https://nodejs.org) |
| **npm** | Comes with Node.js | — |
| **Zoho Catalyst CLI** | Latest | `npm install -g zcatalyst-cli` |
| **Git** | Any recent version | [https://git-scm.com](https://git-scm.com) |

You also need a **Zoho account** that is part of the **HOGC** organisation with access to the **hogcHomePage** project.

---

## Step 1 – Install the Catalyst CLI

If you haven't installed the Catalyst CLI yet:

```bash
npm install -g zcatalyst-cli
```

Verify the installation:

```bash
catalyst --version
```

---

## Step 2 – Sign In with Your HOGC Account

Log in to the Catalyst CLI using your HOGC Zoho credentials:

```bash
catalyst login
```

1. This opens a browser window with the Zoho login page.
2. Sign in with your **HOGC organisation email** (e.g. `yourname@hogc.in`).
3. If prompted, **authorise** the Catalyst CLI to access your account.
4. Once successful, the terminal will display: `Logged in successfully`.

> **Tip:** If you have multiple Zoho accounts, make sure you select the one associated with the HOGC organisation.

---

## Step 3 – Clone the Repository

Clone the project from the Git repository:

```bash
git clone <your-hogc-git-repo-url>
```

Navigate into the project directory:

```bash
cd HOGC
```

---

## Step 4 – Link to the HOGC Organisation & hogcHomePage Project

Initialise (link) the local directory to your Catalyst project:

```bash
catalyst init
```

The CLI will walk you through an interactive setup:

### 4.1 – Select the Organisation

```
? Select the Organization:
  ❯ HOGC
```

Choose **HOGC** from the list of organisations tied to your Zoho account.

### 4.2 – Select the Project

```
? Select the project:
  ❯ hogcHomePage
```

Choose **hogcHomePage** from the list of projects under the HOGC org.

### 4.3 – Confirm Function Linking

The CLI will detect the existing `catalyst.json` and the `functions/` directory. Confirm when prompted to link the functions.

> After this step, a `.catalyst` file is created locally (already in `.gitignore`) that stores your project context.

---

## Step 5 – Install Dependencies

Navigate to each function directory and install its npm packages:

```bash
cd functions/EmailLeadCollector
npm install
cd ../..
```

---

## Step 6 – Set Up the Data Store Table

Before the APIs will work, you need the `EmailLead` table in Catalyst Data Store.

1. Open the Catalyst console: [https://console.catalyst.zoho.com](https://console.catalyst.zoho.com)
2. Select the **HOGC** org → **hogcHomePage** project.
3. Go to **Data Store** in the left sidebar.
4. Click **Create Table** and name it **EmailLead**.
5. Add the following columns:

| Column Name | Data Type |
|-------------|-----------|
| `Email` | varchar |
| `Name` | varchar |
| `Phone_No` | varchar |
| `Source` | text |

6. Click **Create**.

> System columns `ROWID`, `CREATEDTIME`, and `MODIFIEDTIME` are added automatically.

---

## Step 7 – Serve Locally (Development)

You can test the function locally using the Catalyst CLI:

```bash
catalyst serve
```

This starts a local development server. The function will be available at:

```
http://localhost:9000/server/emailleadcollector/
```

Test the endpoints:

```bash
# Health check
curl http://localhost:9000/server/emailleadcollector/

# Create a contact
curl -X POST http://localhost:9000/server/emailleadcollector/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone_no": "9876543210",
    "source": "dev-test"
  }'

# Fetch contacts
curl http://localhost:9000/server/emailleadcollector/contacts
```

---

## Step 8 – Deploy to Catalyst

Once everything works locally, deploy to the Catalyst cloud:

```bash
catalyst deploy
```

The CLI will prompt you to confirm the components being deployed. After deployment, the live endpoints will be:

```
https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contact
https://hogchomepage-60067036113.development.catalystserverless.in/server/emailleadcollector/contacts
```

---

## Project Structure

```
HOGC/
├── .gitignore
├── catalyst.json                        # Catalyst project config
├── README.md                            # ← You are here (setup guide)
└── functions/
    └── EmailLeadCollector/
        ├── README.md                    # API documentation & usage guide
        ├── catalyst-config.json         # Function deployment config
        ├── index.js                     # Route handler (entry point)
        ├── package.json                 # Dependencies
        ├── services/
        │   └── emailLeadService.js      # Data Store CRUD operations
        └── validators/
            └── contactValidator.js      # Input validation logic
```

> For detailed API documentation (endpoints, request/response formats, pagination), see **[functions/EmailLeadCollector/README.md](functions/EmailLeadCollector/README.md)**.

---

## Common CLI Commands

| Command | Description |
|---------|-------------|
| `catalyst login` | Sign in to your Zoho account |
| `catalyst logout` | Sign out |
| `catalyst whoami` | Show current logged-in user & org |
| `catalyst init` | Link local directory to a Catalyst project |
| `catalyst serve` | Start local development server |
| `catalyst deploy` | Deploy to Catalyst cloud |
| `catalyst logs` | View function execution logs |
| `catalyst functions:exec emailleadcollector` | Execute the function from the CLI |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `catalyst: command not found` | Run `npm install -g zcatalyst-cli` |
| Wrong organisation shown | Run `catalyst logout` then `catalyst login` with the correct HOGC account |
| `No project found` during init | Ensure you have access to **hogcHomePage** in the Catalyst console |
| Data Store errors (table not found) | Make sure the `EmailLead` table is created (see Step 6) |
| `ECONNREFUSED` on local serve | Check that port 9000 is not in use; try `catalyst serve --port 9001` |

---

## Team

Maintained by the **HOGC** development team.
