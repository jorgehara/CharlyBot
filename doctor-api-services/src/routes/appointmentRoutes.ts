import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

// Rutas para citas
router.get('/available-slots', appointmentController.getAvailableSlots);
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.listAppointments);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;