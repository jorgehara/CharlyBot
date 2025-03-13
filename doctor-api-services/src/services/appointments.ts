import { calendar_v3 } from 'googleapis';

// Interfaz para los slots de tiempo disponibles
export interface TimeSlot {
  id: number;
  time: string;
  displayTime: string;
  displayDate: string;
  period: 'mañana' | 'tarde';
}

export class AppointmentsService {
  // Horarios de atención
  private morningStart = 8; // 8:00 AM
  private morningEnd = 12;  // 12:00 PM
  private afternoonStart = 16; // 4:00 PM
  private afternoonEnd = 20;   // 8:00 PM
  private appointmentDuration = 30; // Duración de cada cita en minutos

  /**
   * Obtiene los horarios disponibles para un día específico
   * @param dateStr Fecha en formato YYYY-MM-DD o undefined para hoy
   * @param existingEvents Eventos existentes que podrían ocupar horarios
   * @returns Lista de horarios disponibles
   */
  async getAvailableTimeSlots(dateStr: string | undefined, existingEvents: calendar_v3.Schema$Event[]): Promise<TimeSlot[]> {
    try {
      // Determinar la fecha para la cual buscar horarios
      let targetDate: Date;
      if (dateStr) {
        targetDate = new Date(dateStr);
      } else {
        targetDate = new Date();
      }
      
      // Asegurarse de que la fecha sea válida
      if (isNaN(targetDate.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      // Formatear la fecha para mostrar
      const displayDate = targetDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Generar todos los posibles horarios para el día
      const allSlots: TimeSlot[] = [];
      let slotId = 1;
      
      // Horarios de la mañana
      for (let hour = this.morningStart; hour < this.morningEnd; hour++) {
        for (let minute = 0; minute < 60; minute += this.appointmentDuration) {
          const slotDate = new Date(targetDate);
          slotDate.setHours(hour, minute, 0, 0);
          
          // No agregar horarios pasados si es hoy
          const now = new Date();
          if (this.isSameDay(slotDate, now) && slotDate <= now) {
            continue;
          }
          
          allSlots.push({
            id: slotId++,
            time: slotDate.toISOString(),
            displayTime: slotDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            displayDate,
            period: 'mañana'
          });
        }
      }
      
      // Horarios de la tarde
      for (let hour = this.afternoonStart; hour < this.afternoonEnd; hour++) {
        for (let minute = 0; minute < 60; minute += this.appointmentDuration) {
          const slotDate = new Date(targetDate);
          slotDate.setHours(hour, minute, 0, 0);
          
          // No agregar horarios pasados si es hoy
          const now = new Date();
          if (this.isSameDay(slotDate, now) && slotDate <= now) {
            continue;
          }
          
          allSlots.push({
            id: slotId++,
            time: slotDate.toISOString(),
            displayTime: slotDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            displayDate,
            period: 'tarde'
          });
        }
      }
      
      // Filtrar los horarios que ya están ocupados
      const availableSlots = allSlots.filter(slot => {
        const slotStart = new Date(slot.time);
        const slotEnd = new Date(slotStart.getTime() + this.appointmentDuration * 60000);
        
        // Verificar si el horario se solapa con algún evento existente
        return !existingEvents.some(event => {
          if (!event.start?.dateTime || !event.end?.dateTime) {
            return false;
          }
          
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          
          // Hay solapamiento si:
          // (inicio del slot < fin del evento) Y (fin del slot > inicio del evento)
          return slotStart < eventEnd && slotEnd > eventStart;
        });
      });
      
      return availableSlots;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si dos fechas son el mismo día
   * @param date1 Primera fecha
   * @param date2 Segunda fecha
   * @returns true si son el mismo día, false en caso contrario
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}