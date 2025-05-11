import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

export const authenticate = () => {
  try {
    const auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    return auth;
  } catch (error) {
    console.error('Error en la autenticación:', error);
    throw error;
  }
};