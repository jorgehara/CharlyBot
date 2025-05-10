import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

/**
 * @swagger
 * /appointments/available-slots:
 *   get:
 *     summary: Obtiene los horarios disponibles para una fecha específica
 *     description: Devuelve los horarios disponibles para una fecha. Si no se especifica fecha, devuelve los horarios para hoy.
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para la cual obtener horarios (YYYY-MM-DD)
 *       - in: query
 *         name: showOccupied
 *         schema:
 *           type: boolean
 *         description: Indica si se deben incluir los horarios ocupados en la respuesta
 *     responses:
 *       200:
 *         description: Lista de horarios disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 date:
 *                   type: string
 *                   format: date
 *                 displayDate:
 *                   type: string
 *                 available:
 *                   type: object
 *                   properties:
 *                     morning:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeSlot'
 *                     afternoon:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeSlot'
 *                     total:
 *                       type: integer
 *                 slots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         description: Formato de fecha inválido
 *       500:
 *         description: Error del servidor
 */
router.get('/available-slots', appointmentController.getAvailableSlots);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Crea una nueva cita
 *     description: Crea una nueva cita en el calendario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentRequest'
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       400:
 *         description: Datos inválidos o horario no disponible
 *       500:
 *         description: Error del servidor
 */
router.post('/', appointmentController.createAppointment);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Lista todas las citas
 *     description: Obtiene todas las citas o filtra por teléfono del paciente
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Teléfono del paciente para filtrar citas
 *     responses:
 *       200:
 *         description: Lista de citas
 *       500:
 *         description: Error del servidor
 */
router.get('/', appointmentController.listAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancela una cita
 *     description: Cancela una cita existente por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cita a cancelar
 *     responses:
 *       200:
 *         description: Cita cancelada exitosamente
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', appointmentController.deleteAppointment);

/**
 * @swagger
 * /appointments/weekly-slots:
 *   get:
 *     summary: Obtiene los horarios disponibles para una semana
 *     description: Devuelve los horarios disponibles para 7 días a partir de la fecha especificada
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Horarios disponibles para la semana
 *       400:
 *         description: Formato de fecha inválido
 *       500:
 *         description: Error del servidor
 */
router.get('/weekly-slots', appointmentController.getWeeklySlots);

/**
 * @swagger
 * /appointments/confirm-iteration:
 *   get:
 *     summary: Confirma si el usuario desea continuar con la iteración
 *     description: Devuelve un mensaje preguntando si el usuario desea continuar
 *     responses:
 *       200:
 *         description: Opciones de confirmación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 options:
 *                   type: object
 *                   properties:
 *                     yes:
 *                       type: string
 *                     no:
 *                       type: string
 *       500:
 *         description: Error del servidor
 */
router.get('/confirm-iteration', appointmentController.confirmIterationContinue);

export default router;