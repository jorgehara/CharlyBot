import { google } from 'googleapis';
import { getGoogleClient } from './auth';

export class GoogleCalendarService {
    private calendar;

    constructor() {
        this.init();
    }

    private async init() {
        const auth = await getGoogleClient();
        this.calendar = google.calendar({ 
            version: 'v3', 
            auth: auth as any // Forzamos el tipo para resolver el conflicto
        });
    }

    async createEvent(calendarId: string, event: {
        summary: string;
        description?: string;
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
    }) {
        try {
            const response = await this.calendar.events.insert({
                calendarId,
                requestBody: event,
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear evento en Google Calendar:', error);
            throw error;
        }
    }

    async listEvents(calendarId: string, timeMin: Date) {
        try {
            // Asegurarse de que el calendario esté inicializado
            if (!this.calendar) {
                await this.init();
            }
            
            // Crear una copia de la fecha y establecerla al inicio del día
            const startOfDay = new Date(timeMin);
            startOfDay.setHours(0, 0, 0, 0);
            
            // Crear una fecha para el final del día
            const endOfDay = new Date(timeMin);
            endOfDay.setHours(23, 59, 59, 999);
            
            const response = await this.calendar.events.list({
                calendarId,
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            
            return response.data.items || [];
        } catch (error) {
            console.error('Error al listar eventos de Google Calendar:', error);
            // Devolver un array vacío en caso de error para no interrumpir el flujo
            return [];
        }
    }
}