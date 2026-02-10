import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';
import { CreatePatientDTO, UpdatePatientDTO } from '../repositories/patientRepository';
import { HTTP_STATUS } from '../config/constants';

const service = new PatientService();

/**
 * Helper function to extract error message safely
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Create a new patient record
 */
export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto: CreatePatientDTO = req.body;
    
    // Extract audit context from middleware
    const auditContext = req.auditContext || { userId: 'system', workstationId: 'system' };
    
    dto.audit_info = {
      created_by_user_id: auditContext.userId,
      created_workstation_id: auditContext.workstationId,
      created_at: new Date().toISOString(),
      last_updated_by_user_id: auditContext.userId,
      last_updated_workstation_id: auditContext.workstationId,
    };

    const patient = await service.createPatient(dto);
    res.status(HTTP_STATUS.CREATED).json(patient);
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: getErrorMessage(error) });
  }
};

/**
 * Search for patients with filters
 */
export const searchPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const patients = await service.searchPatients(req.query as any);
    res.status(HTTP_STATUS.OK).json(patients);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
};

/**
 * Get a specific patient by ID
 */
export const getPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string;
    const patient = await service.getPatient(patientId);
    res.status(HTTP_STATUS.OK).json(patient);
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ error: getErrorMessage(error) });
  }
};

/**
 * Update patient demographics
 */
export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string;
    const dto: UpdatePatientDTO = req.body;
    const result = await service.updatePatient(patientId, dto);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: getErrorMessage(error) });
  }
};

/**
 * Soft-delete a patient record
 */
export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string;
    const auditContext = req.auditContext || { userId: 'system', workstationId: 'system' };
    await service.deletePatient(patientId, auditContext.userId, auditContext.workstationId);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: getErrorMessage(error) });
  }
};

/**
 * Merge a source patient into a target patient
 */
export const mergePatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const auditContext = req.auditContext || { userId: 'system', workstationId: 'system' };
    const { targetId, sourceId } = req.body;
    const result = await service.mergePatients(targetId, sourceId, auditContext.userId, auditContext.workstationId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: getErrorMessage(error) });
  }
};
