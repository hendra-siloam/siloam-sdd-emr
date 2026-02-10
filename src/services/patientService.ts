import { PatientRepository, CreatePatientDTO, UpdatePatientDTO, PatientSearchParams } from '../repositories/patientRepository';
import { AddressInfo, ContactInfo, FamilyInfo, ClinicalInfo, PayerInfo, AuditInfo } from '../models/types';
import { PATIENT_STATUS, ERROR_MESSAGES } from '../config/constants';

export class PatientService {
  private repository: PatientRepository;

  constructor() {
    this.repository = new PatientRepository();
  }

  /**
   * Create a new patient record
   */
  async createPatient(data: CreatePatientDTO): Promise<any> {
    // Validate birth date is not in future
    const dob = new Date(data.birth_date);
    if (dob > new Date()) {
      throw new Error(ERROR_MESSAGES.BIRTH_DATE_FUTURE);
    }

    return await this.repository.create(data);
  }

  /**
   * Get patient by ID
   */
  async getPatient(id: string): Promise<any> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new Error(ERROR_MESSAGES.PATIENT_NOT_FOUND);
    }
    return patient;
  }

  /**
   * Search patients by criteria
   */
  async searchPatients(params: PatientSearchParams): Promise<any[]> {
    return await this.repository.search(params);
  }

  /**
   * Update patient demographics
   */
  async updatePatient(id: string, data: UpdatePatientDTO): Promise<any> {
    // Check patient exists
    await this.getPatient(id);
    return await this.repository.update(id, data);
  }

  /**
   * Soft-delete a patient
   */
  async deletePatient(id: string, userId: string, workstationId: string): Promise<any> {
    await this.getPatient(id);
    return await this.repository.softDelete(id, userId, workstationId);
  }

  /**
   * Merge a source patient into a target patient
   * Transfer all data from source to target in a transaction
   */
  async mergePatients(
    targetId: string,
    sourceId: string,
    userId: string,
    workstationId: string
  ): Promise<{ success: boolean; targetId: string; sourceId: string }> {
    if (targetId === sourceId) {
      throw new Error(ERROR_MESSAGES.SELF_MERGE);
    }

    const target = await this.getPatient(targetId);
    const source = await this.getPatient(sourceId);

    if (target.status !== PATIENT_STATUS.ACTIVE || source.status !== PATIENT_STATUS.ACTIVE) {
      throw new Error(ERROR_MESSAGES.INACTIVE_PATIENTS);
    }

    // Prepare merged data
    // 1. Array Merges (Address, Family)
    const targetAddresses = Array.isArray(target.address_info) ? target.address_info : [];
    const sourceAddresses = Array.isArray(source.address_info) ? source.address_info : [];
    const mergedAddresses = [...targetAddresses, ...sourceAddresses];

    // Family - merge emergency contacts
    const mergedEmergencyContacts = [
      ...(target.family_info?.emergency_contacts || []),
      ...(source.family_info?.emergency_contacts || []),
    ];

    // 2. Contact Info Merges (Phones, Emails - Deduplicate)
    const mergedPhones: string[] = Array.from(
      new Set([...(target.contact_info?.phones || []), ...(source.contact_info?.phones || [])])
    );
    const mergedEmails: string[] = Array.from(
      new Set([...(target.contact_info?.emails || []), ...(source.contact_info?.emails || [])])
    );

    // 3. Object Merges (Clinical, Payer - Target wins conflicts)
    const mergedClinical: ClinicalInfo = {
      ...(source.clinical_info || {}),
      ...(target.clinical_info || {}),
    };
    const mergedPayer: PayerInfo = {
      ...(source.payer_info || {}),
      ...(target.payer_info || {}),
    };

    const sourceAuditInfo = source.audit_info as AuditInfo;
    const targetAuditInfo = target.audit_info as AuditInfo;

    const targetUpdates: UpdatePatientDTO = {
      address_info: mergedAddresses,
      contact_info: { phones: mergedPhones, emails: mergedEmails },
      family_info: { ...target.family_info, emergency_contacts: mergedEmergencyContacts },
      clinical_info: mergedClinical,
      payer_info: mergedPayer,
      audit_info: {
        ...targetAuditInfo,
        last_updated_by_user_id: userId,
        last_updated_workstation_id: workstationId,
        last_updated_at: new Date().toISOString(),
      } as AuditInfo,
    };

    const updatedSourceAuditInfo: AuditInfo = {
      ...sourceAuditInfo,
      last_updated_by_user_id: userId,
      last_updated_workstation_id: workstationId,
      last_updated_at: new Date().toISOString(),
    };

    // Transactional Merge
    await this.repository.transactionalMerge(targetId, sourceId, targetUpdates, updatedSourceAuditInfo);

    return { success: true, targetId, sourceId };
  }
}
