import { google, calendar_v3 } from 'googleapis';
import { GoogleAuth, JWT } from 'google-auth-library';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private auth: JWT;
  private calendarId: string;

  constructor() {    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || '';

    if (!this.calendarId) {
      throw new Error('GOOGLE_CALENDAR_ID is not set in environment variables');
    }
    
    // Inicializamos la autenticación usando JWT
    this.auth = new JWT({
      keyFile: credentialsPath,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    });

    // Inicializamos el cliente del calendario
    this.calendar = google.calendar({
      version: 'v3',
      auth: this.auth
    });
  }

  async createEvent(eventData: calendar_v3.Schema$Event) {
    try {
      await this.auth.authorize();
      
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: eventData,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getEvent(eventId: string) {
    try {
      await this.auth.authorize();
      
      const response = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId: eventId,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: calendar_v3.Schema$Event) {
    try {
      await this.auth.authorize();
      
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: eventId,
        requestBody: eventData,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string) {
    try {
      await this.auth.authorize();
      
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async listEvents(timeMin: Date, timeMax?: Date) {
    try {
      await this.auth.authorize();
      
      const params: calendar_v3.Params$Resource$Events$List = {
        calendarId: this.calendarId,
        timeMin: timeMin.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      };

      if (timeMax) {
        params.timeMax = timeMax.toISOString();
      }

      const response = await this.calendar.events.list(params);
      return response.data.items || [];
    } catch (error) {
      console.error('Error listing events:', error);
      throw error;
    }
  }
}

export default GoogleCalendarService;