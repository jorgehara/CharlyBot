import express from 'express';
import { appointmentController } from '../controllers/appointmentController';
import cors from 'cors';

const router = express.Router();

router.use(cors());

// Rutas de citas médicas
router.get('/api/appointments/available-slots', appointmentController.getAvailableSlots);
router.get('/api/appointments', appointmentController.getAppointments);
router.get('/api/appointments/:id', appointmentController.getAppointmentById);
router.post('/api/appointments', appointmentController.createAppointment);
router.put('/api/appointments/:id', appointmentController.updateAppointment);
router.delete('/api/appointments/:id', appointmentController.deleteAppointment);

export default router;
