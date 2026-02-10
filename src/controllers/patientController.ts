import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';
import { CreatePatientDTO, UpdatePatientDTO } from '../repositories/patientRepository';

const service = new PatientService();

export const createPatient = async (req: Request, res: Response) => {
  try {
    // Assuming Request body is validated by middleware (Zod)
    const dto: CreatePatientDTO = req.body;
    
    // Extract audit context from middleware
    const auditContext = (req as any).auditContext || { userId: 'system', workstationId: 'system' };
    
    dto.audit_info = {
        created_by_user_id: auditContext.userId,
        created_workstation_id: auditContext.workstationId,
        created_at: new Date().toISOString(),
        last_updated_by_user_id: auditContext.userId,
        last_updated_workstation_id: auditContext.workstationId
    };

    const patient = await service.createPatient(dto);
    res.status(201).json(patient);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const searchPatients = async (req: Request, res: Response) => {
  try {
    const patients = await service.searchPatients(req.query as any);
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatient = async (req: Request, res: Response) => {
  try {
    const patient = await service.getPatient(req.params.id);
    res.json(patient);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
      const dto: UpdatePatientDTO = req.body;
      const result = await service.updatePatient(req.params.id, dto);
      res.json(result);
  } catch (error: any) {
      res.status(400).json({ error: error.message });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
    try {
        const auditContext = (req as any).auditContext || { userId: 'system', workstationId: 'system' };
        await service.deletePatient(req.params.id, auditContext.userId, auditContext.workstationId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const mergePatients = async (req: Request, res: Response) => {
    try {
        const auditContext = (req as any).auditContext || { userId: 'system', workstationId: 'system' };
        const { targetId, sourceId } = req.body;
        const result = await service.mergePatients(targetId, sourceId, auditContext.userId, auditContext.workstationId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
