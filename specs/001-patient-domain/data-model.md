# Data Model: Patient Domain

## Overview

**Storage Engine**: PostgreSQL
**Strategy**: Single Table (`patients`) + JSONB for nested entities.
**ORM**: Drizzle

## Tables

### 1. `patients`

The master record for all patients.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Defaults to gen_random_uuid() | Internal System ID |
| `mrn` | VARCHAR(20) | UNIQUE, NOT NULL | Medical Record Number (e.g., `MR-100001`) |
| `national_id` | VARCHAR(50) | UNIQUE, NOT NULL | National Identity Number (KTP/NIK) |
| `name` | VARCHAR(255) | NOT NULL, INDEX (GIST/GIN trigram) | Full Name |
| `birth_date` | DATE | NOT NULL, INDEX | Date of Birth |
| `gender` | VARCHAR(10) | NOT NULL | 'male', 'female', 'other' |
| `photo_url` | TEXT | NULL | URL to external object storage |
| `is_deceased` | BOOLEAN | DEFAULT false | Deceased Flag |
| `deceased_date` | TIMESTAMP | NULL | Date of Death |
| `status` | VARCHAR(20) | DEFAULT 'active' | 'active', 'merged', 'deleted' |
| `merged_to_id` | UUID | NULL, FK(patients.id) | If merged, point to the Primary Patient ID |
| `address_info` | JSONB | DEFAULT '[]' | Array of addresses |
| `contact_info` | JSONB | DEFAULT '{}' | Phones and Emails |
| `family_info` | JSONB | DEFAULT '{}' | Parents and Emergency Contacts |
| `clinical_info` | JSONB | DEFAULT '{}' | Blood Type, etc. |
| `payer_info` | JSONB | DEFAULT '{}' | Insurance details |
| `audit_info` | JSONB | DEFAULT '{}' | Audit trail (created/updated by) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

### 2. `id_sequences`

Utility table for generating gapless sequences.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `key` | VARCHAR(50) | PK | Key name (e.g., 'patient_mrn') |
| `current_val` | BIGINT | NOT NULL, DEFAULT 0 | Last used number |

## JSONB Structures (TypeScript Types)

These structures are strictly enforced by the Application Layer (Zod + Drizzle).

### `AddressInfo` (Array)
```typescript
{
  type: 'current' | 'permanent';
  street: string;
  city_id: string; // References external City Master (not enforcing FK at DB level)
  postal_code?: string;
}[]
```

### `ContactInfo`
```typescript
{
  phones: string[]; // e.g. ["+62...", "+62..."]
  emails: string[];
}
```

### `FamilyInfo`
```typescript
{
  father_name?: string;
  mother_name?: string;
  emergency_contacts: {
    name: string;
    phone: string;
    relationship?: string;
  }[];
}
```

### `PayerInfo`
```typescript
{
  payer_id?: string;
  policy_number?: string;
}
```

### `ClinicalInfo`
```typescript
{
  blood_type?: 'A' | 'B' | 'AB' | 'O';
  rhesus?: '+' | '-';
}
```

### `AuditInfo`
```typescript
{
  created_by_user_id: string;
  created_workstation_id: string;
  last_updated_by_user_id: string;
  last_updated_workstation_id: string;
}
```
