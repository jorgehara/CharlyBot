import { google, calendar_v3 } from 'googleapis';
import { authenticate } from './auth';

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;

  constructor() {
    // Inicializar el cliente de Google Calendar
    const auth = authenticate();
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Crea un evento en Google Calendar
   * @param calendarId ID del calendario
   * @param eventData Datos del evento a crear
   * @returns Evento creado
   */
  async createEvent(calendarId: string, eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: eventData
      });

      console.log(`Evento creado: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Error al crear evento en Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Obtiene un evento por su ID
   * @param calendarId ID del calendario
   * @param eventId ID del evento
   * @returns Evento encontrado
   */
  async getEvent(calendarId: string, eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener evento de Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Actualiza un evento existente
   * @param calendarId ID del calendario
   * @param eventId ID del evento a actualizar
   * @param eventData Nuevos datos del evento
   * @returns Evento actualizado
   */
  async updateEvent(calendarId: string, eventId: string, eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventData
      });

      console.log(`Evento actualizado: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar evento en Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Elimina un evento
   * @param calendarId ID del calendario
   * @param eventId ID del evento a eliminar
   * @returns Resultado de la operación
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId
      });

      console.log(`Evento eliminado: ${eventId}`);
    } catch (error) {
      console.error('Error al eliminar evento de Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Lista eventos de un día específico
   * @param calendarId ID del calendario
   * @param date Fecha para la cual listar eventos
   * @returns Lista de eventos
   */
  async listEvents(calendarId: string, date: Date): Promise<calendar_v3.Schema$Event[]> {
    try {
      // Crear fecha de inicio (00:00:00)
      const timeMin = new Date(date);
      timeMin.setHours(0, 0, 0, 0);
      
      // Crear fecha de fin (23:59:59)
      const timeMax = new Date(date);
      timeMax.setHours(23, 59, 59, 999);
      
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error al listar eventos de Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Busca eventos en un rango de tiempo específico
   * @param calendarId ID del calendario
   * @param timeMin Tiempo mínimo (inicio del rango)
   * @param timeMax Tiempo máximo (fin del rango)
   * @returns Lista de eventos en el rango especificado
   */
  async findEventsByTimeRange(calendarId: string, timeMin: string, timeMax: string): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error al buscar eventos por rango de tiempo en Google Calendar:', error);
      throw error;
    }
  }
}