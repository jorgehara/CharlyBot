import { Router } from 'express';
import * as registrationController from '../controllers/registrationController';

const router = Router();

// Rutas para registro
router.post('/', registrationController.registerUser);

export default router;