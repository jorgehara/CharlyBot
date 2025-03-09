import { google } from 'googleapis';
import { getGoogleClient } from './auth';

export class GoogleSheetsService {
    private sheets;

    constructor() {
        this.init();
    }

    private async init() {
        const auth = await getGoogleClient();
        this.sheets = google.sheets({ 
            version: 'v4', 
            auth: auth as any 
        });
    }

    async appendRow(spreadsheetId: string, range: string, values: any[]) {
        try {
            if (!spreadsheetId) throw new Error('ID de hoja no proporcionado');
            if (!values.length) throw new Error('No hay datos para agregar');
    
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [values],
                },
            });
            
            console.log('Datos agregados exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error detallado al escribir en Google Sheets:', error);
            throw error;
        }
    }

    async readSheet(spreadsheetId: string, range: string) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            return response.data.values;
        } catch (error) {
            console.error('Error al leer Google Sheets:', error);
            throw error;
        }
    }
}