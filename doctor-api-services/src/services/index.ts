import { GoogleCalendarService } from './google/calendar';
import { GoogleSheetsService } from './google/sheets';
import { AppointmentService } from './appointmentService';
import config from '../config';

// Crear instancias de los servicios
export const calendarService = new GoogleCalendarService();
export const sheetsService = new GoogleSheetsService();
export const appointmentService = new AppointmentService();

// Exportar los servicios para uso en la aplicación
export {
  GoogleCalendarService,
  GoogleSheetsService,
  AppointmentService
};