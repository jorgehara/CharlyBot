import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import config from '../../index';

/**
 * Autentica con Google usando credenciales de cuenta de servicio
 * @returns Cliente autenticado de Google
 */
export function authenticate(): JWT {
  try {
    // Verificar que el archivo de credenciales existe
    if (!fs.existsSync(config.google.credentialsPath)) {
      throw new Error(`Archivo de credenciales no encontrado en: ${config.google.credentialsPath}`);
    }

    return new google.auth.JWT({
      keyFile: config.google.credentialsPath,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar'
      ]
    });
  } catch (error) {
    console.error('Error al autenticar con Google:', error);
    throw new Error('No se pudo autenticar con Google. Verifica tus credenciales.');
  }
}