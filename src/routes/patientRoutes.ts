import { Router } from 'express';
import * as controller from '../controllers/patientController';

const router = Router();

router.post('/', controller.createPatient);
router.get('/', controller.searchPatients);
router.get('/:id', controller.getPatient);
router.patch('/:id', controller.updatePatient);
router.delete('/:id', controller.deletePatient);
router.post('/merge', controller.mergePatients);

export default router;
