import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { validateAppointment } from '../validators/appointmentValidator';

const appointmentService = new AppointmentService();

export const appointmentController = {
    // Obtener slots disponibles
    getAvailableSlots: async (req: Request, res: Response) => {
        try {
            const { date } = req.query;
            if (!date || typeof date !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha es requerida y debe ser una cadena válida'
                });
            }

            const slots = await appointmentService.getAvailableSlots(date);
            return res.status(200).json({
                success: true,
                data: slots
            });
        } catch (error) {
            console.error('Error en getAvailableSlots:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los horarios disponibles',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // Obtener todas las citas
    getAppointments: async (req: Request, res: Response) => {
        try {
            const { date, status } = req.query;
            const appointments = await appointmentService.getAppointments(date as string, status as string);
            return res.status(200).json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Error en getAppointments:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las citas',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // Obtener una cita por ID
    getAppointmentById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const appointment = await appointmentService.getAppointmentById(id);
            
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Error en getAppointmentById:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la cita',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // Crear una nueva cita
    createAppointment: async (req: Request, res: Response) => {
        try {
            const validationError = validateAppointment(req.body);
            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de cita inválidos',
                    errors: validationError
                });
            }

            const appointment = await appointmentService.createAppointment(req.body);
            return res.status(201).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Error en createAppointment:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear la cita',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // Actualizar una cita
    updateAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const validationError = validateAppointment(req.body, true);
            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de actualización inválidos',
                    errors: validationError
                });
            }

            const appointment = await appointmentService.updateAppointment(id, req.body);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Error en updateAppointment:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar la cita',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // Eliminar una cita
    deleteAppointment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await appointmentService.deleteAppointment(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Cita eliminada correctamente'
            });
        } catch (error) {
            console.error('Error en deleteAppointment:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la cita',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};
