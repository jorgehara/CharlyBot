import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

// Rutas para citas
router.get('/available-slots', appointmentController.getAvailableSlots);
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.listAppointments);
router.delete('/:id', appointmentController.deleteAppointment);

// Nueva ruta para obtener slots de una semana completa
router.get('/weekly-slots', appointmentController.getWeeklySlots);

export default router;