import 'dotenv/config';
import path from 'path';

export default {
  port: process.env.PORT || 3001,
  google: {
    spreadsheetId: process.env.SPREADSHEET_ID,
    sheetRange: process.env.SHEET_RANGE,
    calendarId: process.env.CALENDAR_ID,
    timezone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'credentials.json'),
    patientsSheetId: process.env.GOOGLE_PATIENTS_SHEET_ID
  },
  cors: {
    origin: '*', // En producción, limitar a dominios específicos
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};