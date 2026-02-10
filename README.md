# Patient Data Domain API (Siloam SDD EMR)

A robust backend service for managing patient demographic data, featuring advanced record merging capabilities, MRN auto-generation, and a flexible JSONB-based data schema.

## 🚀 Features

- **Patient Registration**: Automated generation of Medical Record Numbers (MRN) format `MR-XXXXXX`.
- **Advanced Search**: Filter by MRN, National ID, Phonenumber or partial Name.
- **Flexible Data Model**: Uses PostgreSQL `JSONB` columns for storing extensible data like Addresses, Contacts, Family Info, and Clinical Context.
- **Record Merging**: Transactional merging of duplicate patient records (Logic: Migrate child records -> Mark Source as Merged -> Update Target).
- **Audit Logging**: Tracks creation and updates with User ID and Workstation ID context.
- **API Documentation**: Integrated Swagger/OpenAPI UI.

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Testing**: Jest + Supertest

## 📋 Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for local database)

## ⚡ Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd siloam-sdd-emr
npm install
```

### 2. Database Setup

Start the PostgreSQL container:

```bash
docker compose up -d
```

Run database migrations to create tables (`patients`, `id_sequences`):

```bash
npm run db:generate
npm run db:migrate
```

### 3. Running the Server

Start the development server:

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## 📖 API Documentation

Once the server is running, access the full interactive API documentation at:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

### Key Endpoints

- `POST /v1/patients`: Create a new patient.
- `GET /v1/patients`: Search patients.
- `GET /v1/patients/:id`: Get patient details.
- `PATCH /v1/patients/:id`: Update patient demographics.
- `POST /v1/patients/merge`: Merge a duplicate patient into a target patient.

## 🧪 Testing

Run the integration test suite (Registration, Search, Update, Merge):

```bash
npm test
```

## 🏗️ Project Structure

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic (Merge rules, Validation)
├── repositories/   # Data access (Drizzle operations)
├── models/         # Zod schemas and TypeScript interfaces
├── middleware/     # Audit and Error handling middleware
└── routes/         # Express route definitions
specs/              # Design documents and tasks
migrations/         # Drizzle SQL migration files
```

## 🔐 Environment Variables

The application can be configured using a `.env` file in the root directory.

### Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Modify the values in `.env` as needed for your environment.

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | API Server Port |
| `DATABASE_URL` | `postgres://siloam:password@localhost:5432/patient_db` | PostgreSQL Connection String |
| `NODE_ENV` | `development` | Application environment (development/production) |
