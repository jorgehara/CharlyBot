import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/routes';
import errorHandler from './middleware/errorHandler';
import config from './config';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(config.mongodb.uri)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

app.listen(config.port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${config.port}`);
});

export default app;