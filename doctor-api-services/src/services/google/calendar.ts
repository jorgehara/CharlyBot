import { google, calendar_v3 } from 'googleapis';
import { GoogleAuth, JWT } from 'google-auth-library';
import * as path from 'path';

class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private auth: JWT;

  constructor() {
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    
    // Inicializamos la autenticación usando JWT
    this.auth = new JWT({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    // Inicializamos el cliente del calendario
    this.calendar = google.calendar({
      version: 'v3',
      auth: this.auth
    });
  }

  async getAvailableSlots(calendarId: string) {
    try {
      // Asegurarnos de que estamos autenticados
      await this.auth.authorize();
      
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      console.log('Eventos obtenidos:', response.data.items?.length || 0);
      return response.data.items || [];
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }
}

export default GoogleCalendarService;