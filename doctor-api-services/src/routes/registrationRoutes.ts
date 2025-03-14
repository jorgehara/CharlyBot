import { Router } from 'express';
import * as registrationController from '../controllers/registrationController';

const router = Router();

// Rutas para registro de pacientes
router.post('/', registrationController.registerPatient);

export default router;