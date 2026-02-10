# Implementation Plan: Patient Data Domain

**Branch**: `001-patient-domain` | **Date**: 2026-02-09 | **Spec**: [specs/001-patient-domain/spec.md](specs/001-patient-domain/spec.md)
**Input**: Feature specification from `/specs/001-patient-domain/spec.md`

## Summary

Implementation of a Node.js/TypeScript REST API for managing Patient Data. The system will support Create, Update, Delete (CUD) and Search/Read operations.
**Key Constraint**: All data MUST be stored in a **single PostgreSQL table** (`patients`), utilizing JSONB columns for nested structures (contacts, family, payer) to satisfy the user requirement while maintaining the domain richness defined in the spec.
**Authentication**: Disabled for this MVP phase.

## Technical Context

**Language/Version**: Node.js (Latest LTS - v20+), TypeScript 5.x
**Framework**: Express.js
**Database**: PostgreSQL
**Storage**: Single Table (`patients`) with JSONB for complex types.
**Testing**: Jest
**Target Platform**: Linux/Container
**Architecture**: Layered (Controller -> Service -> Repository) per Constitution.
**Dependencies**: `pg` (driver), ORM (decision needed - Drizzle/Prisma/TypeORM?), `zod` (validation).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Layered Architecture**: Plan includes Controller/Service/Repo layers.
- [x] **II. Database Per Service**: Yes, isolated Patient DB.
- [x] **III. RESTful API**: Yes, resource-based URIs design planned.
- [ ] **IV. Resilience**: Circuit breakers/Retry needed for external calls? (None in MVP, strictly internal CRUD).
- [x] **V. Technology**: Node/TS/Postgres.
- [!] **Normalization (2NF)**: **VIOLATION WARNED**. Constitution requires 2NF. User explicitly requested "Store all patients data in one table".
  - *Resolution*: Will use PostgreSQL `JSONB` to strictly adhere to the "Single Table" constraint while supporting the complex data model. This technically effectively denormalizes the schema. This is an explicit override for this feature.
- [!] **Auth**: **DISABLED**. Constitution generally requires middleware auth. User explicitly requested "No need authentication".
  - *Resolution*: Middleware will exist but strictly pass-through.

## Project Structure

### Documentation (this feature)

```text
specs/001-patient-domain/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── controllers/    # API Layer
├── services/       # Business Logic
├── repositories/   # Data Access (Single Table implementation)
├── models/         # DTOs and Zod Schemas
└── app.ts          # Entry point
```

## Phase 0: Research Questions

1.  **ORM/Query Builder**: Which library best supports TypeScript + PostgreSQL + Strong JSONB typing without excessive boilerplate? (Prisma vs Drizzle).
2.  **MRN Generation**: Best pure-Postgres approach for `MR-{SEQUENCE}` generation within a single INSERT transaction or column default?

## Phase 1: Design Artifacts

1.  **Data Model (`data-model.md`)**: Define the `patients` table schema, mapping specific User Story fields to matching columns (flat) or JSONB properties.
2.  **API Contract (`contracts/openapi.yaml`)**: Define endpoints `POST /patients`, `GET /patients`, `GET /patients/{id}`, `PUT /patients/{id}`, `DELETE /patients/{id}`.
3.  **Project Skeleton**: Setup `package.json`, `tsconfig.json`, `docker-compose.yml` (for Postgres).

## Phase 2: Tasks

(To be generated in `tasks.md` following design)
