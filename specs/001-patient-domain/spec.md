# Feature Specification: Patient Data Domain

**Feature Branch**: `001-patient-domain`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "Patient Data Domain. We need to able store, update or delete our patients data..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Registration & Identity (Priority: P1)

As a Front Desk Registrar, I want to create a new patient profile with core identity details (Name, DOB, Gender, National ID) and have a unique Medical Record Number (MRN) automatically assigned, so that the patient can be uniquely identified in the hospital system for all future clinical care. I also want to upload a patient photo for visual verification.

**Why this priority**: Without registration and unique identification (MRN/National ID), no other clinical or administrative functions can proceed. This is the foundation of the EMR.

**Independent Test**: Can be fully tested by submitting a registration request with valid identity data and verifying that an MRN is generated and the record is retrievable.

**Acceptance Scenarios**:

1. **Given** valid new patient data (Name, DOB, Gender, National ID), **When** a registration request is submitted, **Then** a new patient record is created with a unique system-generated MRN.
2. **Given** a patient registration request with a National ID or MRN that already exists, **When** submitted, **Then** the system returns a conflict error to prevent duplicates.
3. **Given** an existing patient profile, **When** a Registrar uploads a photo file, **Then** the photo is associated with the patient's record for retrieval.

---

### User Story 2 - Patient Search & Retrieval (Priority: P1)

As a Front Desk Registrar or Nurse, I want to search for patients using their Patient ID, MRN, Name, or Date of Birth, so that I can quickly locate the correct record during check-in or clinical review.

**Why this priority**: Enabling users to find the records they just created is essential for workflow.

**Independent Test**: Create several test patients, then perform search queries using different parameters and verify correct results.

**Acceptance Scenarios**:

1. **Given** existing patients, **When** searching by exact MRN, **Then** the specific patient record is returned.
2. **Given** existing patients, **When** searching by Name (partial match) and Date of Birth, **Then** all matching records are returned as a list.
3. **Given** no matching patients, **When** a search is performed, **Then** an empty list is returned (not an error).

---

### User Story 3 - Contact & Demographic Management (Priority: P2)

As a Billing Clerk or Patient Coordinator, I want to record and update patient contact details (Address, Phone, Email, City) and demographics (Birth Place, Nationality), so that communication and billing can be accurately handled.

**Why this priority**: Critical for patient follow-up and billing, though distinct from the core identity.

**Independent Test**: Update an existing patient's address and phone number, then retrieve the record to verify changes.

**Acceptance Scenarios**:

1. **Given** an existing patient, **When** updating their "Current Address" and "Phone Number", **Then** the changes are saved and reflected in subsequent retrievals.
2. **Given** a patient, **When** adding a "Permanent Address" distinct from "Current Address", **Then** both addresses are stored and distinguishable.

---

### User Story 4 - Clinical & Emergency Context (Priority: P2)

As a Triage Nurse or ER Doctor, I want to view and manage critical clinical context (Blood Type, Parents' Names, Emergency Contacts), so that I can make informed decisions in urgent situations.

**Why this priority**: Vital for patient safety during emergencies and legal verification for minors.

**Independent Test**: Update a patient's blood type and emergency contact, then verify these fields are visible.

**Acceptance Scenarios**:

1. **Given** a patient, **When** recording "Blood Type" and "Emergency Contact" info, **Then** this information is stored and readily available on the patient profile.
2. **Given** a pediatric patient, **When** Father's and Mother's names are entered, **Then** they are saved to the profile.

---

### User Story 5 - Administrative, Payer & Audit (Priority: P3)

As a Financial Counselor or Admin, I want to link patients to Payers (Insurance), track record status (Deceased), and have a full audit trail of who modified the record and from which workstation.

**Why this priority**: Necessary for revenue cycle and compliance, but relies on the existence of the patient record first.

**Independent Test**: Update a patient's payer info and verify the "Last Updated By" and "Workstation" audit fields correspond to the request context.

**Acceptance Scenarios**:

1. **Given** an active patient, **When** linking a Payer ID and Policy Number, **Then** the billing information is updated.
2. **Given** a patient context, **When** marking a patient as "Deceased" with a date, **Then** the patient status is updated to prevent future automated outreach.
3. **Given** any update operation, **When** the change is committed, **Then** the system logs the User ID and Workstation ID responsible for the change.

---

### User Story 6 - Record Maintenance & Merging (Priority: P4)

As a Data Quality Specialist, I want to merge duplicate patient records by migrating valid data to the primary record and deleting the duplicate, so that clinical history is consolidated without redundancy.

**Why this priority**: Maintenance function for data quality; low frequency but high impact on data integrity.

**Independent Test**: Create two patients, issue a merge command, and verify that contacts from the duplicate are moved to the primary, the duplicate is deleted, and the primary retains its original core data.

**Acceptance Scenarios**:

1. **Given** two duplicate patient records (A=Target, B=Source), **When** B is merged into A, **Then** compatible list data (e.g., extra phone numbers) is moved from B to A, B is deleted, and A retains its original single-value fields (e.g., Name, DOB).

## Edge Cases

- **Duplicate National ID**: Attempting to register a patient with a National ID already in use by another active patient MUST fail.
- **Concurrent Updates**: Two users updating the same patient record simultaneously should be handled (Optimistic Locking).
- **Incomplete Search**: Searching with very short strings (e.g., 1 letter) should be restricted to prevent performance issues.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating a patient with mandatory fields: Name, DOB, Gender, National ID.
- **FR-002**: System MUST automatically generate a unique Medical Record Number (MRN) using the alphanumeric format `MR-{SEQUENCE}` (e.g., `MR-100001`).
- **FR-003**: System MUST enforce uniqueness on National ID Number.
- **FR-004**: System MUST allow updating demographics, addresses (Current/Permanent), contacts (Phone/Email), and clinical context (Blood Type, Parents).
- **FR-005**: System MUST support associating a patient photo by storing a reference URL (binary file upload is handled externally).
- **FR-006**: System MUST allow searching patients by Patient ID, MRN, Name (partial), and Date of Birth.
- **FR-007**: System MUST record Audit Trail metadata for every create/update: User ID, Workstation ID, Timestamp.
- **FR-008**: System MUST allow linking a patient to a Payer (ID) with a Policy Number.
- **FR-009**: System MUST allow marking a patient as Deceased with a specific Deceased Date.
- **FR-010**: System MUST support merging a patient record into another by migrating related entities, resolving conflicts in favor of the Target record, and updating the Source record `status` to 'merged' with a `merged_to_id` reference.
- **FR-011**: System interaction interfaces MUST follow defined architectural standards and validate all inputs rigorously.

### Key Entities

- **Patient**: Core profile (ID, MRN, Name, DOB, Gender, NationalID, Photo, Status, AuditInfo).
- **PatientContact**: Address details (Street, CityID, Type [Current/Perm]), Phone, Email.
- **PatientFamily**: Father Name, Mother Name, Emergency Contact (Name, Phone).
- **PatientPayer**: PayerID, Policy Number.

## Success Criteria

- **Efficiency**: Patient search by MRN or National ID returns results in under 500ms.
- **Integrity**: Zero duplicate MRNs or National IDs allowed in the active set.
- **Compliance**: 100% of data changes have associated Audit Log (User + Workstation).
- **Usability**: Clients can complete a full registration flow (Create -> Upload Photo -> Add Address) in separate standard interactions.

## Clarifications

### Session 2026-02-09
- Q: MRN Format? -> A: Alphanumeric Prefix `MR-` (e.g., `MR-100001`).
- Q: Photo Upload? -> A: Reference URL Only (File upload is external).
- Q: Merge Strategy? -> A: Migrate & Delete (Move 1:N relations, Target wins 1:1 conflicts, Delete Source).
