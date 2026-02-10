---
description: "Task list for Patient Data Domain implementation"
---

# Tasks: Patient Data Domain

**Input**: Design documents from `/specs/001-patient-domain/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml, research.md

**Tests**: Tests are included as integration tests per User Story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: [US1] Registration, [US2] Search, [US3] Contacts, [US4] Clinical, [US5] Admin, [US6] Merge

## Phase 1: Setup (Infrastructure)

**Purpose**: Initialize project structure and database connectivity.

- [x] T001 Create `package.json` and install dependencies (Express, Drizzle, PG, Zod, Jest) in `.`
- [x] T002 Create `tsconfig.json` and basic source folder structure (`src/controllers`, `src/services`, `src/repositories`, `src/models`) in `.`
- [x] T003 Create `docker-compose.yml` for PostgreSQL 16 (with volume persistence) in `.`
- [x] T004 Define Drizzle schema for `patients` and `id_sequences` tables (including JSONB types) in `src/repositories/schema.ts`
- [x] T005 Create DB connection factory and Drizzle client instance in `src/repositories/db.ts`
- [x] T006 Create DB migration output (SQL) and run migration to init DB in `migrations/`

## Phase 2: Foundational (Models & Utilities)

**Purpose**: Core logic required before any User Story can function.

- [x] T007 Define Zod schemas for all JSONB structures (`AddressInfo`, `ContactInfo`, `FamilyInfo`, `AuditInfo`) in `src/models/types.ts`
- [x] T008 [P] Implement `IdSequenceRepository` with method `getNextValue(key)` using atomic `UPDATE...RETURNING` in `src/repositories/idSequenceRepository.ts`
- [x] T009 Create `AuditMiddleware` (stub/pass-through) to attach `workstation_id` and `user_id` to requests in `src/middleware/audit.ts`
- [x] T010 Setup Express app with global error handler and JSON body parser in `src/app.ts`

## Phase 3: User Story 1 (Registration & Identity)

**Goal**: Create new patients with uniquely generated MRNs.

- [x] T011 [US1] Implement `PatientRepository.create` with transaction support (locks ID sequence, inserts patient) in `src/repositories/patientRepository.ts`
- [x] T012 [US1] Implement `PatientService.createPatient` (validates input via Zod, calls repo) in `src/services/patientService.ts`
- [x] T013 [US1] Implement `PatientController.create` and map to `POST /patients` in `src/controllers/patientController.ts`
- [x] T014 [US1] Add uniqueness check for National ID in Repository (handle 409 conflict) in `src/repositories/patientRepository.ts`
- [x] T015 [US1] Create integration test: Register patient -> Verify MRN format and DB record in `tests/integration/registration.test.ts`

## Phase 4: User Story 2 (Search & Retrieval)

**Goal**: Find patients by MRN, Name, DOB.

- [x] T016 [US2] Implement `PatientRepository.findById` in `src/repositories/patientRepository.ts`
- [x] T017 [US2] Implement `PatientRepository.search` (handling partial name match, exact MRN/NationalID) in `src/repositories/patientRepository.ts`
- [x] T018 [P] [US2] Implement `PatientService.search` and `PatientService.getById` in `src/services/patientService.ts`
- [x] T019 [US2] Implement `PatientController.search` (`GET /patients`) and `getById` (`GET /patients/:id`) in `src/controllers/patientController.ts`
- [x] T020 [US2] Create integration test: Seed patients -> Search by substring -> Verify results in `tests/integration/search.test.ts`

## Phase 5: User Stories 3, 4, 5 (Updates & Management)

**Goal**: Update demographics, clinical context, and admin status.
*Note: Since this is a single table update, these stories are implemented via the unified Update operation.*

- [x] T021 [US3] Implement `PatientRepository.update` (Generic partial update) in `src/repositories/patientRepository.ts`
- [x] T022 [US3] Implement `PatientService.updatePatient` (Merging logic for JSONB fields if needed, or replacement) in `src/services/patientService.ts`
- [x] T023 [US3] Implement `PatientController.update` (`PUT /patients/:id`) in `src/controllers/patientController.ts`
- [x] T024 [P] [US4] Add validation logic for Blood Type and Family Info updates in `src/models/types.ts`
- [x] T025 [P] [US5] Add validation logic for Payer Info and Deceased status updates in `src/models/types.ts`
- [x] T026 [US3] Create integration test: Update Address/Phone and Verify persistence in `tests/integration/update.test.ts`

## Phase 6: User Story 6 (Record Merging)

**Goal**: Merge duplicate records (Migrate & Delete).

- [x] T027 [US6] Implement `PatientRepository.transactionalMerge` (Read Source/Target -> Move 1:N List Items -> Delete Source) in `src/repositories/patientRepository.ts`
- [x] T028 [US6] Implement `PatientService.mergePatients` (Business rules: Target exists check, Source exists check) in `src/services/patientService.ts`
- [x] T029 [US6] Implement `PatientController.merge` (`POST /patients/:id/merge`) in `src/controllers/patientController.ts`
- [x] T030 [US6] Create integration test: Create 2 patients -> Merge -> Verify Source deleted & Target has Source's distinct contacts in `tests/integration/merge.test.ts`

## Phase 7: Polish & Documentation

- [x] T031 Setup Swagger UI middleware serving `openapi.yaml` at `/docs` in `src/app.ts`
- [x] T032 Final manual verification of all endpoints against success criteria in `manual_verification.md`

## Dependencies

- **US2 (Search)** depends on **US1 (Create)** (Need data to search)
- **US3/4/5 (Updates)** depend on **US1**
- **US6 (Merge)** depends on **US1** and **US3** (Need complex data to migrate)
