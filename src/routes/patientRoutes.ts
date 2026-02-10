import { Router } from 'express';
import * as controller from '../controllers/patientController';

const router = Router();

/**
 * POST /v1/patients - Create a new patient
 */
router.post('/', controller.createPatient);

/**
 * GET /v1/patients - Search patients by criteria
 */
router.get('/', controller.searchPatients);

/**
 * POST /v1/patients/merge - Merge a source patient into target
 * Must be defined before GET /:id to avoid route conflicts
 */
router.post('/merge', controller.mergePatients);

/**
 * GET /v1/patients/:id - Get a specific patient
 */
router.get('/:id', controller.getPatient);

/**
 * PATCH /v1/patients/:id - Update patient information
 */
router.patch('/:id', controller.updatePatient);

/**
 * DELETE /v1/patients/:id - Soft-delete a patient
 */
router.delete('/:id', controller.deletePatient);

export default router;
