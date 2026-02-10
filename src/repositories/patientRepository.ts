import { eq, ilike, or, and, sql } from 'drizzle-orm';
import { db } from './db';
import { patients, idSequences } from './schema';
import { AddressInfo, ContactInfo, FamilyInfo, ClinicalInfo, PayerInfo, AuditInfo } from '../models/types';
import { PATIENT_STATUS, MRN_PREFIX, MRN_PADDING_LENGTH, ERROR_MESSAGES } from '../config/constants';

export type CreatePatientDTO = {
  name: string;
  birth_date: string; // ISO Date
  gender: string;
  national_id: string;
  address_info?: AddressInfo;
  contact_info?: ContactInfo;
  family_info?: FamilyInfo;
  clinical_info?: ClinicalInfo;
  payer_info?: PayerInfo;
  audit_info: AuditInfo;
};

export type UpdatePatientDTO = Partial<CreatePatientDTO> & {
  photo_url?: string;
  is_deceased?: boolean;
  deceased_date?: Date;
  status?: string;
  merged_to_id?: string;
};

export type PatientSearchParams = {
  name?: string;
  mrn?: string;
  national_id?: string;
  phone?: string;
};

export class PatientRepository {
  /**
   * Generate the next Medical Record Number
   */
  private async getNextMRN(): Promise<string> {
    return await db.transaction(async (tx) => {
      const [seq] = await tx
        .insert(idSequences)
        .values({ key: 'mrn', current_val: 1 })
        .onConflictDoUpdate({
          target: idSequences.key,
          set: { current_val: sql`${idSequences.current_val} + 1` },
        })
        .returning();

      if (!seq) {
        throw new Error('Failed to generate MRN sequence');
      }

      const sequenceValue = seq.current_val;
      return `${MRN_PREFIX}${String(sequenceValue).padStart(MRN_PADDING_LENGTH, '0')}`;
    });
  }

  /**
   * Create a new patient record
   */
  async create(data: CreatePatientDTO): Promise<any> {
    return await db.transaction(async (tx) => {
      const mrn = await this.getNextMRN();
      const [newPatient] = await tx
        .insert(patients)
        .values({
          mrn,
          name: data.name,
          birth_date: data.birth_date,
          gender: data.gender,
          national_id: data.national_id,
          address_info: data.address_info || [],
          contact_info: data.contact_info || { phones: [], emails: [] },
          family_info: data.family_info || { emergency_contacts: [] },
          clinical_info: data.clinical_info || {},
          payer_info: data.payer_info || {},
          audit_info: data.audit_info,
          status: PATIENT_STATUS.ACTIVE,
        })
        .returning();
      return newPatient;
    });
  }

  /**
   * Find a patient by ID
   */
  async findById(id: string): Promise<any> {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0];
  }

  /**
   * Search patients by multiple criteria
   */
  async search(params: PatientSearchParams): Promise<any[]> {
    const conditions: any[] = [];

    if (params.name) {
      conditions.push(ilike(patients.name, `%${params.name}%`));
    }

    if (params.mrn) {
      conditions.push(ilike(patients.mrn, `%${params.mrn}%`));
    }

    if (params.national_id) {
      conditions.push(eq(patients.national_id, params.national_id));
    }

    // Search for phone number in JSONB array with proper parameterization
    if (params.phone) {
      const phoneSearch = `%${params.phone}%`;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${patients.contact_info}->'phones') 
          WHERE value ILIKE ${phoneSearch}
        )`
      );
    }

    // Show only active and merged patients (hide deleted)
    conditions.push(
      or(eq(patients.status, PATIENT_STATUS.ACTIVE), eq(patients.status, PATIENT_STATUS.MERGED))
    );

    if (conditions.length === 0) {
      return [];
    }

    return await db.select().from(patients).where(and(...conditions));
  }

  /**
   * Update patient information
   */
  async update(id: string, data: UpdatePatientDTO): Promise<any> {
    const [updated] = await db
      .update(patients)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  /**
   * Soft-delete a patient (mark as deleted instead of removing)
   */
  async softDelete(id: string, _userId: string, _workstationId: string): Promise<any> {
    const [deleted] = await db
      .update(patients)
      .set({
        status: PATIENT_STATUS.DELETED,
        updated_at: new Date(),
      })
      .where(eq(patients.id, id))
      .returning();
    return deleted;
  }

  /**
   * Merge two patient records transactionally
   * Transfers all data from source to target and marks source as merged
   */
  async transactionalMerge(
    targetId: string,
    sourceId: string,
    targetUpdates: UpdatePatientDTO,
    sourceAuditInfo: AuditInfo
  ): Promise<any> {
    return await db.transaction(async (tx) => {
      // 1. Update Target with merged data
      const [updatedTarget] = await tx
        .update(patients)
        .set({
          ...targetUpdates,
          updated_at: new Date(),
        })
        .where(eq(patients.id, targetId))
        .returning();

      if (!updatedTarget) {
        throw new Error(ERROR_MESSAGES.TARGET_NOT_FOUND_MERGE);
      }

      // 2. Mark Source as Merged
      const [updatedSource] = await tx
        .update(patients)
        .set({
          status: PATIENT_STATUS.MERGED,
          merged_to_id: targetId,
          audit_info: sourceAuditInfo,
          updated_at: new Date(),
        })
        .where(eq(patients.id, sourceId))
        .returning();

      if (!updatedSource) {
        throw new Error(ERROR_MESSAGES.SOURCE_NOT_FOUND_MERGE);
      }

      return { target: updatedTarget, source: updatedSource };
    });
  }
}
