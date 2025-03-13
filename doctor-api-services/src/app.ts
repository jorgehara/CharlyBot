import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import config from './config';

// Crear la aplicación Express
const app = express();

// Middleware
app.use(helmet()); // Seguridad
app.use(cors(config.cors)); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de formularios

// Rutas
app.use('/api', routes);

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar el servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada no manejada:', error);
});

export default app;