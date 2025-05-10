import { calendar_v3 } from 'googleapis';
import config from '../config';
import { TimeSlot, SlotsResponse, BusySlot } from '../types/appointment';

export class AppointmentService {
  /**
   * Obtiene los horarios disponibles y ocupados para una fecha específica
   * @param date Fecha para la cual obtener horarios (opcional, por defecto hoy)
   * @param existingEvents Eventos existentes en el calendario
   * @returns Lista de horarios disponibles y ocupados
   */
  async getAvailableTimeSlots(date?: string, existingEvents: calendar_v3.Schema$Event[] = []): Promise<SlotsResponse> {
    try {
      let targetDate: Date;
      
      if (date) {
        targetDate = new Date(date + 'T00:00:00');
      } else {
        targetDate = new Date();
        targetDate.setHours(0, 0, 0, 0);
      }
      
      if (isNaN(targetDate.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      console.log('Generando horarios para:', targetDate.toISOString(), 'en zona horaria local');
      
      const morningStart = 8.5; // 8:30 AM
      const morningEnd = 11.5;  // 11:30 AM
      const afternoonStart = 16.5; // 16:30 PM
      const afternoonEnd = 19.5;   // 19:30 PM
      const slotDuration = 0.5;    // 30 minutos por turno
      
      const allSlots: TimeSlot[] = [];
      
      // Generar slots de la mañana
      for (let hour = morningStart; hour < morningEnd; hour += slotDuration) {
        const slotTime = new Date(targetDate);
        const hourInt = Math.floor(hour);
        const minuteInt = Math.round((hour - hourInt) * 60);
        
        slotTime.setHours(hourInt, minuteInt, 0, 0);
        
        // No agregar horarios pasados si es hoy
        if (this.isSameDay(slotTime, new Date()) && slotTime <= new Date()) {
          continue;
        }
        
        allSlots.push({
          time: slotTime.toISOString(),
          displayTime: this.formatTime(slotTime),
          displayDate: this.formatDate(slotTime),
          period: 'mañana',
          status: 'disponible'
        });
      }
      
      // Generar slots de la tarde
      for (let hour = afternoonStart; hour < afternoonEnd; hour += slotDuration) {
        const slotTime = new Date(targetDate);
        const hourInt = Math.floor(hour);
        const minuteInt = Math.round((hour - hourInt) * 60);
        
        slotTime.setHours(hourInt, minuteInt, 0, 0);
        
        // No agregar horarios pasados si es hoy
        if (this.isSameDay(slotTime, new Date()) && slotTime <= new Date()) {
          continue;
        }
        
        allSlots.push({
          time: slotTime.toISOString(),
          displayTime: this.formatTime(slotTime),
          displayDate: this.formatDate(slotTime),
          period: 'tarde',
          status: 'disponible'
        });
      }
      
      // Obtener y procesar los horarios ocupados
      const busySlots = existingEvents
        .filter(event => event.start?.dateTime && event.end?.dateTime)
        .map(event => ({
          start: new Date(event.start!.dateTime!),
          end: new Date(event.end!.dateTime!),
          summary: event.summary || 'Ocupado'
        }));
      
      // Marcar los slots ocupados
      for (const slot of allSlots) {
        const slotTime = new Date(slot.time);
        const slotEnd = new Date(slotTime.getTime() + slotDuration * 60 * 60 * 1000);
        
        for (const busySlot of busySlots) {
          if (
            (slotTime >= busySlot.start && slotTime < busySlot.end) ||
            (slotEnd > busySlot.start && slotEnd <= busySlot.end) ||
            (slotTime <= busySlot.start && slotEnd >= busySlot.end)
          ) {
            slot.status = 'ocupado';
            slot.eventSummary = busySlot.summary;
            break;
          }
        }
      }
      
      // Separar slots por período y estado
      const morningAvailable = allSlots.filter(slot => slot.period === 'mañana' && slot.status === 'disponible');
      const morningOccupied = allSlots.filter(slot => slot.period === 'mañana' && slot.status === 'ocupado');
      const afternoonAvailable = allSlots.filter(slot => slot.period === 'tarde' && slot.status === 'disponible');
      const afternoonOccupied = allSlots.filter(slot => slot.period === 'tarde' && slot.status === 'ocupado');
      
      return {
        success: true,
        date: targetDate.toISOString().split('T')[0],
        displayDate: this.formatDate(targetDate),
        available: {
          morning: morningAvailable,
          afternoon: afternoonAvailable,
          total: morningAvailable.length + afternoonAvailable.length
        },
        occupied: {
          morning: morningOccupied,
          afternoon: afternoonOccupied,
          total: morningOccupied.length + afternoonOccupied.length
        },
        slots: allSlots
      };
    } catch (error) {
      console.error('Error al generar horarios disponibles:', error);
      throw error;
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}