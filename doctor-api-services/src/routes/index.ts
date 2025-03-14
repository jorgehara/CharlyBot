import { Router } from 'express';
import appointmentRoutes from './appointmentRoutes';
import registrationRoutes from './registrationRoutes';
import { GoogleCalendarService } from '../services/google/calendar';
import config from '../config';

const router = Router();

// Crear una instancia del servicio
const calendarService = new GoogleCalendarService();

// Rutas de prueba
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

router.get('/json-test', (req, res) => {
  const data = {
    message: 'Esto es una respuesta JSON',
    timestamp: new Date().toISOString(),
    success: true
  };
  res.status(200).json(data);
});

// Ruta de prueba para verificar la conexión con Google Calendar
router.get('/test-calendar', async (req, res) => {
  try {
    const result = await calendarService.verifyConnection(config.google.calendarId!);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: 'Conexión con Google Calendar verificada correctamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'No se pudo verificar la conexión con Google Calendar'
      });
    }
  } catch (error) {
    console.error('Error al verificar la conexión con Google Calendar:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al verificar la conexión con Google Calendar: ' + error.message
    });
  }
});

// Ruta de prueba para crear un evento simple
router.post('/test-event', async (req, res) => {
  try {
    // Evento de prueba simple
    const testEvent = {
      summary: 'Evento de prueba',
      description: 'Este es un evento de prueba para verificar la integración con Google Calendar',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: config.google.timezone
      },
      end: {
        dateTime: new Date(Date.now() + 30 * 60000).toISOString(),
        timeZone: config.google.timezone
      }
    };
    
    console.log('Intentando crear evento de prueba:', testEvent);
    
    const createdEvent = await calendarService.createEvent(config.google.calendarId!, testEvent);
    
    res.status(201).json({
      success: true,
      message: 'Evento de prueba creado correctamente',
      data: createdEvent
    });
  } catch (error) {
    console.error('Error al crear evento de prueba:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al crear evento de prueba: ' + error.message
    });
  }
});

// Montar las rutas específicas
router.use('/appointments', appointmentRoutes);
router.use('/registration', registrationRoutes);

export default router;