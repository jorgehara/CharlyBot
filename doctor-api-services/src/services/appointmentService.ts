
import { format, parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import GoogleCalendarService from './google/calendar';

export class AppointmentService {
  private calendarService: GoogleCalendarService;

  constructor() {
    this.calendarService = new GoogleCalendarService();
  }

  async getAvailableSlots(date: string) {
    // Implementa la lógica de obtención de slots disponibles
  }

  async createAppointment(appointmentData: any) {
    // Implementa la lógica de creación de citas
  }
}