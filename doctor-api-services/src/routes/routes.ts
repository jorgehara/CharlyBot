import express, { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';

const router = express.Router();
const appointmentService = new AppointmentService();

router.get('/api/appointments', async (req: Request, res: Response) => {
    try {
        const date = req.query.date as string;

        if (!date) {
            return res.status(400).json({ success: false, message: 'La fecha es requerida' });
        }

        const slots = await appointmentService.getAvailableSlots(date);
        return res.status(200).json({ success: true, data: slots });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las citas disponibles',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

router.post('/api/appointments', async (req: Request, res: Response) => {
    try {
        const appointment = await appointmentService.createAppointment(req.body);
        return res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear la cita',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

export default router;
