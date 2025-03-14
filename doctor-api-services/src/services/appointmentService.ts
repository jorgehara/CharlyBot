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
      // Determinar la fecha para la cual generar horarios
      let targetDate: Date;
      
      if (date) {
        // Crear fecha en zona horaria local
        targetDate = new Date(date + 'T00:00:00');
      } else {
        // Si no se proporciona fecha, usar la fecha actual en zona horaria local
        targetDate = new Date();
        // Resetear la hora a 00:00:00
        targetDate.setHours(0, 0, 0, 0);
      }
      
      // Verificar que la fecha sea válida
      if (isNaN(targetDate.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      console.log('Generando horarios para:', targetDate.toISOString(), 'en zona horaria local');
      
      // Configurar horarios de consulta (horarios ajustados)
      const morningStart = 8.5; // 8:30 AM
      const morningEnd = 11.5;  // 11:30 AM
      const afternoonStart = 16.5; // 16:30 PM
      const afternoonEnd = 19.5;   // 19:30 PM
      const slotDuration = 0.5;    // 30 minutos por turno
      
      // Generar todos los slots posibles para el día
      const allSlots: TimeSlot[] = [];
      
      // Generar slots de la mañana
      for (let hour = morningStart; hour < morningEnd; hour += slotDuration) {
        const slotTime = new Date(targetDate);
        const hourInt = Math.floor(hour);
        const minuteInt = (hour - hourInt) * 60;
        
        slotTime.setHours(hourInt, minuteInt, 0, 0);
        
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
        const minuteInt = (hour - hourInt) * 60;
        
        slotTime.setHours(hourInt, minuteInt, 0, 0);
        
        allSlots.push({
          time: slotTime.toISOString(),
          displayTime: this.formatTime(slotTime),
          displayDate: this.formatDate(slotTime),
          period: 'tarde',
          status: 'disponible'
        });
      }
      
      // Obtener los horarios ocupados
      const busySlots = this.getBusyTimeSlots(existingEvents);
      
      // Marcar los slots ocupados
      for (const slot of allSlots) {
        const slotStart = new Date(slot.time);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 minutos después
        
        for (const busySlot of busySlots) {
          const busyStart = new Date(busySlot.start);
          const busyEnd = new Date(busySlot.end);
          
          // Verificar si hay solapamiento
          if (
            (slotStart >= busyStart && slotStart < busyEnd) ||
            (slotEnd > busyStart && slotEnd <= busyEnd) ||
            (slotStart <= busyStart && slotEnd >= busyEnd)
          ) {
            slot.status = 'ocupado';
            // No asignar summary directamente a slot
            break;
          }
        }
      }
      
      // Separar slots por período y estado
      const morningAvailable = allSlots.filter(slot => slot.period === 'mañana' && slot.status === 'disponible');
      const morningOccupied = allSlots.filter(slot => slot.period === 'mañana' && slot.status === 'ocupado');
      const afternoonAvailable = allSlots.filter(slot => slot.period === 'tarde' && slot.status === 'disponible');
      const afternoonOccupied = allSlots.filter(slot => slot.period === 'tarde' && slot.status === 'ocupado');
      
      // Formatear la fecha para mostrar
      const displayDate = this.formatDate(targetDate);
      
      return {
        success: true,
        date: targetDate.toISOString().split('T')[0],
        displayDate,
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
  
  /**
   * Obtiene los horarios ocupados a partir de eventos existentes
   * @param events Eventos existentes en el calendario
   * @returns Lista de horarios ocupados
   */
  private getBusyTimeSlots(events: calendar_v3.Schema$Event[]): BusySlot[] {
    return events
      .filter(event => event.start?.dateTime && event.end?.dateTime)
      .map(event => {
        const startDate = new Date(event.start!.dateTime!);
        const endDate = new Date(event.end!.dateTime!);
        
        // Determinar si es mañana o tarde
        const hour = startDate.getHours();
        const period = hour < 12 ? 'mañana' as const : 'tarde' as const;
        
        return {
          start: event.start!.dateTime!,
          end: event.end!.dateTime!,
          summary: event.summary,
          period,
          displayTime: this.formatTime(startDate),
          displayDate: this.formatDate(startDate)
        };
      });
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