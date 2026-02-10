import { PatientRepository, CreatePatientDTO, UpdatePatientDTO, PatientSearchParams } from '../repositories/patientRepository';
import { AddressInfo, ContactInfo, FamilyInfo, ClinicalInfo, PayerInfo, AuditInfo } from '../models/types';

export class PatientService {
  private repository: PatientRepository;

  constructor() {
    this.repository = new PatientRepository();
  }

  async createPatient(data: CreatePatientDTO) {
    // Business logic: Check for duplicates?
    // For now trust constraints (unique National ID).
    
    // Validate birth date is not in future?
    const dob = new Date(data.birth_date);
    if (dob > new Date()) {
        throw new Error("Birth date cannot be in the future");
    }

    return await this.repository.create(data);
  }

  async getPatient(id: string) {
    const patient = await this.repository.findById(id);
    if (!patient) throw new Error("Patient not found");
    return patient;
  }

  async searchPatients(params: PatientSearchParams) {
    return await this.repository.search(params);
  }

  async updatePatient(id: string, data: UpdatePatientDTO) {
    // Check existence
    await this.getPatient(id);
    return await this.repository.update(id, data);
  }

  async deletePatient(id: string, userId: string, workstationId: string) {
    await this.getPatient(id);
    return await this.repository.softDelete(id, userId, workstationId);
  }

  async mergePatients(targetId: string, sourceId: string, userId: string, workstationId: string) {
    if (targetId === sourceId) throw new Error("Cannot merge patient with themselves");

    const target = await this.getPatient(targetId);
    const source = await this.getPatient(sourceId);

    if (target.status !== 'active' || source.status !== 'active') {
        throw new Error("Both patients must be active to merge");
    }

    // Prepare merged data
    // 1. Array Merges (Address, Family)
    const mergedAddresses = [...(target.address_info || []), ...(source.address_info || [])];
    
    // Family - merge emergency contacts
    const mergedEmergencyContacts = [
        ...(target.family_info?.emergency_contacts || []),
        ...(source.family_info?.emergency_contacts || [])
    ];
    
    // 2. Contact Info Merges (Phones, Emails - Deduplicate?)
    const mergedPhones = Array.from(new Set([...(target.contact_info?.phones || []), ...(source.contact_info?.phones || [])]));
    const mergedEmails = Array.from(new Set([...(target.contact_info?.emails || []), ...(source.contact_info?.emails || [])]));

    // 3. Object Merges (Clinical, Payer - Target wins conflicts, but fill gaps from Source)
    const mergedClinical = { ...source.clinical_info, ...target.clinical_info }; // Target props overwrite Source
    const mergedPayer = { ...source.payer_info, ...target.payer_info };

    const targetUpdates = {
        address_info: mergedAddresses,
        contact_info: { phones: mergedPhones, emails: mergedEmails },
        family_info: { ...target.family_info, emergency_contacts: mergedEmergencyContacts },
        clinical_info: mergedClinical,
        payer_info: mergedPayer,
        audit_info: {
            ...target.audit_info as AuditInfo,
            last_updated_by_user_id: userId,
            last_updated_workstation_id: workstationId,
            last_updated_at: new Date().toISOString()
        }
    };

    const sourceAuditInfo = {
        ...source.audit_info as AuditInfo,
        last_updated_by_user_id: userId,
        last_updated_workstation_id: workstationId,
        last_updated_at: new Date().toISOString()
    };

    // Transactional Merge
    await this.repository.transactionalMerge(targetId, sourceId, targetUpdates, sourceAuditInfo);

    return { success: true, targetId, sourceId };
  }
}
