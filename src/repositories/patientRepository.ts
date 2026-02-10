import { eq, ilike, or, and, sql } from 'drizzle-orm';
import { db } from './db';
import { patients, idSequences } from './schema';
import { AddressInfo, ContactInfo, FamilyInfo, ClinicalInfo, PayerInfo, AuditInfo } from '../models/types';

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
  
  private async getNextMRN(): Promise<string> {
    return await db.transaction(async (tx) => {
      // Upsert id_sequences for key 'mrn' and increment
      // Drizzle doesn't have native upsert with returning optimized for all drivers, but PG supports it.
      // We'll try to update first.
      
      const [seq] = await tx
        .insert(idSequences)
        .values({ key: 'mrn', current_val: 1 })
        .onConflictDoUpdate({
          target: idSequences.key,
          set: { current_val: sql`${idSequences.current_val} + 1` }
        })
        .returning();

      const val = seq.current_val;
      return `MR-${String(val).padStart(6, '0')}`;
    });
  }

  async create(data: CreatePatientDTO) {
    return await db.transaction(async (tx) => {
      const mrn = await this.getNextMRN();
      const [newPatient] = await tx.insert(patients).values({
        mrn,
        name: data.name,
        birth_date: data.birth_date, // Drizzle handles string to date/msg
        gender: data.gender,
        national_id: data.national_id,
        address_info: data.address_info || [],
        contact_info: data.contact_info || { phones: [], emails: [] },
        family_info: data.family_info || { emergency_contacts: [] },
        clinical_info: data.clinical_info || {},
        payer_info: data.payer_info || {},
        audit_info: data.audit_info,
        status: 'active'
      }).returning();
      return newPatient;
    });
  }

  async findById(id: string) {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0];
  }

  async search(params: PatientSearchParams) {
    const conditions = [];

    if (params.name) {
      conditions.push(ilike(patients.name, `%${params.name}%`));
    }
    if (params.mrn) {
      conditions.push(ilike(patients.mrn, `%${params.mrn}%`));
    }
    if (params.national_id) {
      conditions.push(eq(patients.national_id, params.national_id));
    }
    
    // For phone search inside JSONB, we need specific operator
    // This is tricky with Drizzle's typed JSON.
    // We can use a raw SQL filter if needed: sql`contact_info->'phones' ? ${params.phone}`
    // Or just simple text search on the JSON columncast to text if volume is low, but better use JSON operators.
    if (params.phone) {
       // Check if the phone number exists in the array of strings at contact_info->phones
       conditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(${patients.contact_info}->'phones') WHERE value ILIKE ${`%${params.phone}%`})`);
    }

    // Default to only showing active patients unless specific status requested?
    // Let's assume search returns all not deleted unless filtered?
    conditions.push(or(eq(patients.status, 'active'), eq(patients.status, 'merged'))); // Hide deleted?

    if (conditions.length === 0) return [];

    return await db.select().from(patients).where(and(...conditions));
  }

  async update(id: string, data: UpdatePatientDTO) {
    const [updated] = await db.update(patients)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  async softDelete(id: string, userId: string, workstationId: string) {
      // Fetch current audit info to update? Or just merge?
      // Since it's a JSON blob, we probably need to fetch-modify-save or usage `sql` to update json field. 
      // For simplicity, let's just update status.
      
      const [deleted] = await db.update(patients)
          .set({
              status: 'deleted',
              updated_at: new Date()
          })
          .where(eq(patients.id, id))
          .returning();
      return deleted;
  }

  async transactionalMerge(targetId: string, sourceId: string, targetUpdates: UpdatePatientDTO, sourceAuditInfo: AuditInfo) {
      return await db.transaction(async (tx) => {
          // 1. Update Target with merged data
          const [updatedTarget] = await tx.update(patients)
              .set({
                  ...targetUpdates,
                  updated_at: new Date()
              })
              .where(eq(patients.id, targetId))
              .returning();

          if (!updatedTarget) throw new Error("Target patient not found during merge transaction");

          // 2. Mark Source as Merged
          const [updatedSource] = await tx.update(patients)
              .set({
                  status: 'merged',
                  merged_to_id: targetId,
                  audit_info: sourceAuditInfo,
                  updated_at: new Date()
              })
              .where(eq(patients.id, sourceId))
              .returning();

          if (!updatedSource) throw new Error("Source patient not found during merge transaction");

          return { target: updatedTarget, source: updatedSource };
      });
  }
}
