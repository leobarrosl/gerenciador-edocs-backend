# Gerenciador E-Docs

REST API for managing electronic documents with dynamic template support and PDF generation.

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Database](#database)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Template & Variable System](#template--variable-system)
- [PDF Generation](#pdf-generation)
- [Testing](#testing)
- [Available Scripts](#available-scripts)

---

## About

**Gerenciador E-Docs** is a backend system for creating and managing electronic documents based on templates. Key features:

- Create **HTML templates** with dynamic variable placeholders (e.g., contracts, certificates, invoices)
- Generate **documents** from templates by filling in variables with custom values
- Export any document as a **downloadable PDF**
- Secure access management via JWT authentication

**Example use case:** A contract template with variables `{{clientName}}`, `{{startDate}}`, and `{{amount}}` can be instantiated to generate dozens of personalized documents, each exportable as a PDF.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [NestJS](https://nestjs.com/) v11 |
| Language | TypeScript 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | Passport.js + JWT |
| Password hashing | Argon2 |
| PDF generation | Puppeteer 24 |
| Validation | class-validator + class-transformer |
| Testing | Jest |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) >= 14 running locally or on an accessible server

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gerenciador-edocs.git
cd gerenciador-edocs

# Install dependencies
npm install
```

---

## Configuration

Create a `.env` file in the project root with the following variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/gerenciador_edoc"

# Secret used to sign JWT tokens — use a strong value in production
JWT_SECRET="change-this-in-production"

# JWT token expiration time
JWT_EXPIRES_IN="7d"
```

> **Warning:** Never commit the `.env` file to the repository. It is already listed in `.gitignore`.

---

## Running the Project

```bash
# Apply migrations and generate the Prisma Client
npx prisma migrate deploy
npx prisma generate

# Development mode (hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

---

## Project Structure

```
gerenciador-edocs/
├── src/
│   ├── main.ts                   # Entry point — bootstraps the app
│   ├── app.module.ts             # Root module
│   ├── auth/                     # Authentication (register, login, guards)
│   │   ├── strategies/           # Passport strategies (local + JWT)
│   │   ├── guards/               # Route guards
│   │   └── dto/
│   ├── users/                    # User management
│   │   └── dto/
│   ├── templates/                # Document template CRUD
│   │   └── dto/
│   ├── documents/                # Document creation and retrieval
│   │   ├── dto/
│   │   └── entities/
│   ├── pdf/                      # PDF generation with Puppeteer
│   └── prisma/                   # Prisma Client wrapper
├── prisma/
│   ├── schema.prisma             # Data model definitions
│   └── migrations/               # Migration history
├── docs/
│   └── overview.md               # Additional technical documentation
├── test/                         # E2E tests
└── package.json
```

---

## Database

The project uses PostgreSQL with Prisma as the ORM.

### Entity Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌───────────────┐
│    users    │       │    templates     │       │   documents   │
│─────────────│       │──────────────────│       │───────────────│
│ id (UUID)   │──┐    │ id (UUID)        │──┐    │ id (UUID)     │
│ name        │  │    │ name             │  │    │ templateId FK │
│ email       │  └───>│ userId FK        │  └───>│ userId FK     │
│ passwordHash│       │ content (HTML)   │       │ content       │
│ createdAt   │       │ variables (JSON) │       │ values (JSON) │
│ updatedAt   │       │ pdfOptions (JSON)│       │ createdAt     │
└─────────────┘       │ createdAt        │       │ updatedAt     │
                      │ updatedAt        │       └───────────────┘
                      ┴──────────────────┘
```

### Prisma Commands

```bash
# Create a new migration after changing the schema
npx prisma migrate dev --name migration-name

# Apply migrations in production
npx prisma migrate deploy

# Open the Prisma database GUI
npx prisma studio
```

---

## Authentication

The API uses **JWT (JSON Web Token)**. Protected routes require the token in the `Authorization: Bearer <token>` header.

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## API Endpoints

### Authentication

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new user account | No |
| `POST` | `/auth/login` | Authenticate and get JWT token | No |

---

### Templates

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/templates` | List templates with pagination and search | Yes |
| `GET` | `/templates/:id` | Get a specific template | Yes |
| `POST` | `/templates` | Create a new template | Yes |
| `PATCH` | `/templates/:id` | Update a template | Yes |
| `DELETE` | `/templates/:id` | Delete a template | Yes |

**Query params — `GET /templates`:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `size` | number | Items per page (default: 10) |
| `search` | string | Search by template name |
| `userId` | string | Filter by creator |

**Request body — `POST /templates`:**

```json
{
  "name": "Service Agreement",
  "content": "<h1>Agreement</h1><p>Client: {{clientName}}</p><p>Amount: {{amount}}</p>",
  "variables": [
    { "key": "clientName", "label": "Client Name", "defaultValue": "" },
    { "key": "amount",     "label": "Amount",      "defaultValue": "$0.00" }
  ],
  "pdfOptions": {
    "format": "A4",
    "margin": { "top": "2cm", "bottom": "2cm", "left": "2cm", "right": "2cm" },
    "printBackground": true
  }
}
```

---

### Documents

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/documents` | List documents with pagination and filters | Yes |
| `GET` | `/documents/:id` | Get a specific document | Yes |
| `GET` | `/documents/generate/:id` | Generate and download document as PDF | Yes |
| `POST` | `/documents` | Create a document from a template | Yes |
| `DELETE` | `/documents/:id` | Delete a document | Yes |

**Query params — `GET /documents`:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `size` | number | Items per page |
| `initialDate` | string | Start of date filter (ISO 8601) |
| `finalDate` | string | End of date filter (ISO 8601) |
| `templateId` | string | Filter by template |

**Request body — `POST /documents`:**

```json
{
  "templateId": "template-uuid",
  "values": [
    { "key": "clientName", "value": "Acme Corp" },
    { "key": "amount",     "value": "$5,000.00" }
  ]
}
```

---

## Template & Variable System

Templates use `{{key}}` syntax to define dynamic variable placeholders in HTML content.

**Template example:**

```html
<html>
  <body>
    <h1>Certificate of Completion</h1>
    <p>This certifies that <strong>{{studentName}}</strong> has completed the <strong>{{courseName}}</strong> course.</p>
    <p>Completion date: {{completionDate}}</p>
  </body>
</html>
```

**Variable definitions stored in the template:**

```json
[
  { "key": "studentName",    "label": "Student Name",    "defaultValue": "" },
  { "key": "courseName",     "label": "Course Name",     "defaultValue": "" },
  { "key": "completionDate", "label": "Completion Date", "defaultValue": "" }
]
```

When a document is created, each `{{key}}` in the content is replaced by the corresponding entry in `values`. If a value is not provided, the template's `defaultValue` is used.

---

## PDF Generation

The `GET /documents/generate/:id` endpoint renders the document's HTML to a PDF using **Puppeteer** (headless Chromium) and returns the file as a direct download.

Rendering options are configured per template in the `pdfOptions` field:

```json
{
  "format": "A4",
  "printBackground": true,
  "margin": {
    "top": "2cm",
    "right": "2cm",
    "bottom": "2cm",
    "left": "2cm"
  }
}
```

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Generate test coverage report |
| `npm run lint` | Check for lint issues |
| `npm run format` | Format code with Prettier |

---

## License

This project is licensed under the MIT License.
