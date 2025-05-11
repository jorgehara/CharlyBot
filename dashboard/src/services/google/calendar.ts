import { google } from 'googleapis';
import { authenticate } from './auth';
import { calendar_v3 } from 'googleapis';

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private calendarId: string;

  constructor() {
    const auth = authenticate();
    this.calendar = google.calendar({ version: 'v3', auth });
    this.calendarId = 'dd85c50990779ead504036ff6c94e6c9f1d895528f0900bbf0a9300dc3db37c9@group.calendar.google.com';
  }

  /**
   * Crea un evento en Google Calendar
   */
  async createEvent(eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: eventData,
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  /**
   * Obtiene un evento por su ID
   */
  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId,
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener evento:', error);
      throw error;
    }
  }

  /**
   * Lista eventos en un rango de fechas
   */
  async listEvents(timeMin: Date, timeMax?: Date): Promise<calendar_v3.Schema$Event[]> {
    try {
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
      console.error('Error al listar eventos:', error);
      throw error;
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(eventId: string, eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        requestBody: eventData,
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }
}