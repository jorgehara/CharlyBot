import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleCalendarService } from '../services/google/calendar';
import type { Appointment, GoogleCalendarEvent, AppointmentCreationData } from '../types/calendar';

const calendarService = new GoogleCalendarService();

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const events = await calendarService.listEvents(startOfDay, endOfDay);
      
      const formattedAppointments = events.map((event: GoogleCalendarEvent) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.dateTime,
          displayTime: format(new Date(event.start.dateTime), 'HH:mm')
        },
        end: {
          dateTime: event.end.dateTime,
          displayTime: format(new Date(event.end.dateTime), 'HH:mm')
        },
        displayDate: format(new Date(event.start.dateTime), 'EEEE d \'de\' MMMM \'de\' yyyy', { locale: es }),
        patient: {
          name: event.extendedProperties?.private?.patientName || '',
          phone: event.extendedProperties?.private?.patientPhone || '',
          email: event.extendedProperties?.private?.patientEmail || null,
          obrasocial: event.extendedProperties?.private?.socialWork || null
        },
        status: event.status,
        colorId: event.colorId
      }));

      setAppointments(formattedAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (data: AppointmentCreationData) => {
    try {
      const { date, time, patient, description } = data;
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 minutos por defecto

      const eventData = {
        summary: `🏥 Consulta Médica - ${patient.name}`,
        description: `
📋 Detalles de la Cita:
------------------
👤 Paciente: ${patient.name}
🏥 Obra Social: ${patient.obrasocial || 'No especificada'}
📞 Teléfono: ${patient.phone}
${patient.email ? `📧 Email: ${patient.email}` : ''}
${description ? `\n📝 Notas adicionales:\n${description}` : ''}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        extendedProperties: {
          private: {
            patientName: patient.name,
            patientPhone: patient.phone,
            patientEmail: patient.email || '',
            socialWork: patient.obrasocial || ''
          }
        }
      };

      const createdEvent = await calendarService.createEvent(eventData);
      return createdEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear la cita');
    }
  }, []);

  const updateAppointment = useCallback(async (eventId: string, data: Partial<AppointmentCreationData>) => {
    try {
      const currentEvent = await calendarService.getEvent(eventId);
      
      // Mantener los datos existentes si no se proporcionan nuevos
      const updatedData = {
        summary: currentEvent.summary,
        description: currentEvent.description,
        start: currentEvent.start,
        end: currentEvent.end,
        extendedProperties: currentEvent.extendedProperties
      };

      // Actualizar solo los campos proporcionados
      if (data.patient) {
        updatedData.summary = `🏥 Consulta Médica - ${data.patient.name}`;
        updatedData.extendedProperties = {
          private: {
            patientName: data.patient.name,
            patientPhone: data.patient.phone,
            patientEmail: data.patient.email || '',
            socialWork: data.patient.obrasocial || ''
          }
        };
      }

      if (data.date && data.time) {
        const startDateTime = new Date(`${data.date}T${data.time}`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
        
        updatedData.start = {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        };
        updatedData.end = {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        };
      }

      const updatedEvent = await calendarService.updateEvent(eventId, updatedData);
      return updatedEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar la cita');
    }
  }, []);

  const deleteAppointment = useCallback(async (eventId: string) => {
    try {
      await calendarService.deleteEvent(eventId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar la cita');
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};