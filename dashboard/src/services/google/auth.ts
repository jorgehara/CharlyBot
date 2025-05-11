import { JWT } from 'google-auth-library';
import { calendar_v3, sheets_v4, google } from 'googleapis';

/**
 * Autentica con Google usando credenciales de cuenta de servicio
 * @returns Cliente autenticado de Google
 */
export function authenticate(): JWT {    import config from '../../config';
    const credentials = {
      client_email: config.google.auth.clientEmail,
      private_key: config.google.auth.privateKey,
    };

    // Crear cliente JWT con los scopes necesarios
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    console.log('Cliente de autenticación creado correctamente');
    return client;
  } catch (error) {
    console.error('Error al autenticar con Google:', error);
    throw new Error('No se pudo autenticar con Google. Verifica tus credenciales.');
  }

export type { calendar_v3, sheets_v4 };