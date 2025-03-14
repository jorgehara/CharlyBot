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
      
      // Asegurarse de que la fecha es válida
      if (isNaN(targetDate.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      console.log('Generando horarios para:', targetDate.toISOString(), 'en zona horaria local');
      
      // Configurar horarios de consulta (8:00 AM a 8:00 PM)
      const startHour = 8;
      const endHour = 20;
      const slotDuration = 30; // minutos
      
      // Obtener eventos existentes para la fecha
      const busySlots = this.getBusyTimeSlots(existingEvents);
      console.log('Horarios ocupados:', busySlots);
      
      // Generar todos los slots posibles para el día
      const availableSlots: TimeSlot[] = [];
      const occupiedSlots: TimeSlot[] = [];
      
      // Formatear la fecha para mostrar
      const displayDate = targetDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Obtener la fecha actual para comparar
      const now = new Date();
      
      // Determinar si la fecha objetivo es hoy
      const isToday = targetDate.toDateString() === now.toDateString();
      
      // Generar slots para cada hora dentro del rango de horario de consulta
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          // Crear fecha y hora para el slot
          const slotTime = new Date(targetDate);
          slotTime.setHours(hour, minute, 0, 0);
          
          // Verificar si el slot está en el pasado (solo si es para hoy)
          if (isToday && slotTime <= now) {
            continue; // Saltar slots en el pasado solo para el día actual
          }
          
          // Determinar si es mañana o tarde
          const period = hour < 12 ? 'mañana' as const : 'tarde' as const;
          
          // Formatear hora para mostrar
          const displayTime = slotTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          // Verificar si el slot está ocupado
          const isSlotBusy = busySlots.some(busySlot => {
            const busyStart = new Date(busySlot.start);
            const busyEnd = new Date(busySlot.end);
            return slotTime >= busyStart && slotTime < busyEnd;
          });
          
          // Crear objeto base del slot
          const slotBase = {
            time: slotTime.toISOString(),
            displayTime,
            displayDate,
            period
          };
          
          // Agregar a la lista correspondiente
          if (isSlotBusy) {
            occupiedSlots.push({
              ...slotBase,
              status: 'ocupado' as const
            });
          } else {
            availableSlots.push({
              ...slotBase,
              status: 'disponible' as const
            });
          }
        }
      }
      
      // Organizar slots por período
      const morningAvailable = availableSlots.filter(slot => slot.period === 'mañana');
      const afternoonAvailable = availableSlots.filter(slot => slot.period === 'tarde');
      const morningOccupied = occupiedSlots.filter(slot => slot.period === 'mañana');
      const afternoonOccupied = occupiedSlots.filter(slot => slot.period === 'tarde');
      
      console.log(`Generados ${availableSlots.length} horarios disponibles y ${occupiedSlots.length} ocupados`);
      
      return {
        date: targetDate.toISOString().split('T')[0],
        displayDate,
        available: {
          morning: morningAvailable,
          afternoon: afternoonAvailable,
          total: availableSlots.length
        },
        occupied: {
          morning: morningOccupied,
          afternoon: afternoonOccupied,
          total: occupiedSlots.length
        },
        allSlots: [...availableSlots, ...occupiedSlots].sort((a, b) => 
          new Date(a.time).getTime() - new Date(b.time).getTime()
        )
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
      .map(event => ({
        start: event.start!.dateTime!,
        end: event.end!.dateTime!,
        summary: event.summary
      }));
  }
} 