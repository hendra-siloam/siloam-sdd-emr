# Research Phase: Patient Data Domain

**Date**: 2026-02-09
**Status**: Complete

## 1. ORM Selection: [Drizzle ORM](https://orm.drizzle.team/)

### Decision
We will use **Drizzle ORM** over Prisma.

### Rationale
*   **JSONB Typing**: The patient schema relies heavily on storing nested configurations (e.g., specific payer details, multiple contacts) and complex clinical data in a single table constraints (via JSONB). Prisma treats JSONB as `any` by default. Drizzle allows enforcing TypeScript interfaces on JSONB columns (`.json().$type<MyInterface>()`), ensuring safety.
*   **Performance**: Drizzle is lightweight with no Rust sidecar, offering faster cold starts and lower latency.
*   **Simplicity**: Fits the Constitution's "Node.js + Postgres" mandate without introducing a heavy DSL layer.

## 2. MRN Generation Strategy

### Decision
We will use a **Transactional Counter Table** (`id_sequences`) pattern.

### Rationale
*   **Requirement**: Generate `MR-{SEQUENCE}` (e.g., `MR-100001`).
*   **Problem with Native Sequences**: Postgres `SEQUENCE` objects are non-transactional (they do not roll back). A failed transaction burns a number, creating gaps. In EMR contexts, sequential integrity is often preferred for auditing.
*   **Solution**:
    1.  A dedicated table `id_sequences` stores the current counter.
    2.  `UPDATE id_sequences SET current_val = current_val + 1 WHERE key = 'mrn' RETURNING current_val` is run inside the Patient Create transaction.
    3.  This row-lock ensures serialization (no duplicate checks needed) and guarantees no gaps on rollback.
*   **Format**: `MR-` prefix + padded integer.

## 3. Single-Table JSONB Schema

### Decision
All Patient attributes will be mapped to a single `patients` table.

### Schema mapping
*   **Core Columns** (Indexed, Searchable):
    *   `id` (UUID, PK)
    *   `mrn` (VARCHAR, Unique, Indexed)
    *   `national_id` (VARCHAR, Unique, Indexed)
    *   `name` (VARCHAR, Indexed with `pg_trgm`)
    *   `birth_date` (DATE, Indexed)
    *   `gender` (VARCHAR)
    *   `status` (ENUM: active, deceased, merged)
*   **JSONB Columns** (Complex Data):
    *   `address_info`: `[{ type: 'current'|'permanent', street: ..., city_id: ... }]`
    *   `contact_info`: `{ phones: [], emails: [] }`
    *   `clinical_info`: `{ blood_type: ..., height: ..., weight: ... }`
    *   `family_info`: `{ father_name: ..., mother_name: ..., emergency_contacts: [...] }`
    *   `payer_info`: `{ payer_id: ..., policy_number: ... }`
    *   `audit_info`: `{ created_by: ..., created_station: ..., last_updated_by: ... }`

### Indexing Strategy regarding JSONB
*   Search requirements are primarily on Core Columns (Name, DOB, MRN).
*   PostgreSQL `GIN` index will be applied to `contact_info` ONLY IF we need to search by phone number later (not currently P1).
