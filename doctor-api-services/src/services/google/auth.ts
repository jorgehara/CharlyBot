import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Autentica con Google usando credenciales de cuenta de servicio
 * @returns Cliente autenticado de Google
 */
export function authenticate(): JWT {
  try {
    // Ruta al archivo de credenciales (ajustada para encontrarlo en la carpeta doctor-api-services)
    const keyFilePath = path.resolve(__dirname, '../../../credentials.json');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(keyFilePath)) {
      throw new Error(`Archivo de credenciales no encontrado en: ${keyFilePath}`);
    }
    
    console.log('Usando archivo de credenciales:', keyFilePath);
    
    // Leer y parsear el archivo de credenciales
    const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    
    // Crear cliente JWT con los scopes necesarios
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });
    
    console.log('Cliente de autenticación creado correctamente');
    return client;
  } catch (error) {
    console.error('Error al autenticar con Google:', error);
    throw new Error('No se pudo autenticar con Google. Verifica tus credenciales.');
  }
}