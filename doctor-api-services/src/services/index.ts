import { AppointmentsService } from './appointments';
import { GoogleSheetsService } from './google/sheets';
import { GoogleCalendarService } from './google/calendar';

// Inicializar servicios
const sheetsService = new GoogleSheetsService();
const calendarService = new GoogleCalendarService();
const appointmentService = new AppointmentsService();

export {
  sheetsService,
  calendarService,
  appointmentService
};