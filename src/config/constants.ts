/**
 * Application Constants
 * Centralized definitions to avoid magic strings and numbers
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PATIENT_STATUS = {
  ACTIVE: 'active',
  MERGED: 'merged',
  DELETED: 'deleted',
} as const;

export const MRN_PREFIX = 'MR-';
export const MRN_PADDING_LENGTH = 6;

export const AUDIT_CONTEXT_DEFAULTS = {
  USER_ID: 'system',
  WORKSTATION_ID: 'system',
} as const;

export const ERROR_MESSAGES = {
  PATIENT_NOT_FOUND: 'Patient not found',
  BIRTH_DATE_FUTURE: 'Birth date cannot be in the future',
  SELF_MERGE: 'Cannot merge patient with themselves',
  INACTIVE_PATIENTS: 'Both patients must be active to merge',
  TARGET_NOT_FOUND_MERGE: 'Target patient not found during merge transaction',
  SOURCE_NOT_FOUND_MERGE: 'Source patient not found during merge transaction',
  INVALID_REQUEST: 'Invalid request',
} as const;
