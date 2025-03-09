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
            const response = await this.calendar.events.list({
                calendarId,
                timeMin: timeMin.toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return response.data.items;
        } catch (error) {
            console.error('Error al listar eventos de Google Calendar:', error);
            throw error;
        }
    }
}