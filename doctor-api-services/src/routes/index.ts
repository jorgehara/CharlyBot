import { Router } from 'express';
import appointmentRoutes from './appointmentRoutes';
import registrationRoutes from './registrationRoutes';

const router = Router();

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

// Montar las rutas específicas
router.use('/appointments', appointmentRoutes);
router.use('/registration', registrationRoutes);

export default router;