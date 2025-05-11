import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/routes';
import errorHandler from './middleware/errorHandler';
import config from './config';
import { connectDB } from './database/connection';
import { setupSwagger } from './swagger';

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno críticas
console.log('Verificando variables de entorno:');
console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('TIMEZONE:', process.env.TIMEZONE);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger
setupSwagger(app);

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

// Iniciar servidor y conectar a la base de datos
const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(config.port, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${config.port}`);
            console.log(`📚 Documentación API disponible en http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();

export default app;