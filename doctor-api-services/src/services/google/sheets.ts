import { google, sheets_v4 } from 'googleapis';
import { authenticate } from './auth';

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    // Inicializar el cliente de Google Sheets
    const auth = authenticate();
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  /**
   * Agrega una fila a una hoja de cálculo de Google Sheets
   * @param spreadsheetId ID de la hoja de cálculo
   * @param range Rango donde se agregará la fila (ej: 'Hoja1!A:C')
   * @param values Valores a agregar como fila
   * @returns Respuesta de la API de Google Sheets
   */
  async appendRow(spreadsheetId: string, range: string, values: any[]): Promise<any> {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values]
        }
      });

      console.log(`${response.data.updates?.updatedCells} celdas actualizadas.`);
      return response.data;
    } catch (error) {
      console.error('Error al agregar fila a Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Lee datos de una hoja de cálculo de Google Sheets
   * @param spreadsheetId ID de la hoja de cálculo
   * @param range Rango a leer (ej: 'Hoja1!A1:C10')
   * @returns Datos leídos de la hoja de cálculo
   */
  async readRange(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error al leer datos de Google Sheets:', error);
      throw error;
    }
  }
} 