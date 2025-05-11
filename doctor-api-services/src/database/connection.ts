import mongoose from 'mongoose';
import config from '../config';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};
