import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as path from 'path';

// Configuración de credenciales
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class CalendarService {
    private auth: JWT;
    private calendar: any;

    constructor() {
        this.initializeClient();
    }

    private async initializeClient() {
        try {
            const credentials = require(CREDENTIALS_PATH);
            this.auth = new JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: SCOPES,
            });

            this.calendar = google.calendar({ version: 'v3', auth: this.auth });
        } catch (error) {
            console.error('Error al inicializar el cliente de Calendar:', error);
            throw error;
        }
    }

    async createEvent(
        summary: string,
        description: string,
        startTime: Date,
        endTime: Date,
        attendeeEmail?: string
    ) {
        try {
            const event = {
                summary,
                description,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
                attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined,
            };

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                sendUpdates: 'all',
            });

            return response.data;
        } catch (error) {
            console.error('Error al crear el evento:', error);
            throw error;
        }
    }

    async listEvents(maxResults = 10) {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return response.data.items;
        } catch (error) {
            console.error('Error al listar eventos:', error);
            throw error;
        }
    }

    async deleteEvent(eventId: string) {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all',
            });
            return true;
        } catch (error) {
            console.error('Error al eliminar el evento:', error);
            throw error;
        }
    }

    async updateEvent(
        eventId: string,
        summary?: string,
        description?: string,
        startTime?: Date,
        endTime?: Date
    ) {
        try {
            const event: any = {};
            
            if (summary) event.summary = summary;
            if (description) event.description = description;
            if (startTime) {
                event.start = {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                };
            }
            if (endTime) {
                event.end = {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                };
            }

            const response = await this.calendar.events.patch({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: event,
                sendUpdates: 'all',
            });

            return response.data;
        } catch (error) {
            console.error('Error al actualizar el evento:', error);
            throw error;
        }
    }
}
