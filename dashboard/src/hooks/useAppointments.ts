import { useState, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment, AppointmentCreationData } from '../types/calendar';
import { mockAppointments } from '../data/mockData';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      // Filtrar las citas del día seleccionado
      const appointmentsForDate = mockAppointments.filter(apt => 
        isSameDay(new Date(apt.start.dateTime), date)
      );
      setAppointments(appointmentsForDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (data: AppointmentCreationData) => {
    try {
      // Simulación de creación de cita
      const newAppointment = {
        id: `a${Date.now()}`,
        summary: `🏥 Consulta Médica - ${data.patient.name}`,
        description: data.description || 'Sin descripción',
        start: {
          dateTime: `${data.date}T${data.time}`,
          displayTime: data.time
        },
        end: {
          dateTime: `${data.date}T${data.time}`,
          displayTime: format(new Date(`${data.date}T${data.time}`), 'HH:mm'),
        },
        displayDate: format(new Date(data.date), 'EEEE d MMMM yyyy', { locale: es }),
        period: parseInt(data.time.split(':')[0]) < 13 ? 'mañana' : 'tarde',
        status: 'pendiente',
        patient: data.patient,
        colorId: '1'
      };
      
      mockAppointments.push(newAppointment);
      return newAppointment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear la cita');
    }
  }, []);

  const updateAppointment = useCallback(async (appointmentId: string, data: Partial<AppointmentCreationData>) => {
    try {
      const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
      if (appointmentIndex === -1) throw new Error('Cita no encontrada');

      const updatedAppointment = {
        ...mockAppointments[appointmentIndex],
        ...(data.patient && {
          summary: `🏥 Consulta Médica - ${data.patient.name}`,
          patient: data.patient
        }),
        ...(data.description && { description: data.description }),
        ...(data.date && data.time && {
          start: {
            dateTime: `${data.date}T${data.time}`,
            displayTime: data.time
          },
          end: {
            dateTime: `${data.date}T${data.time}`,
            displayTime: format(new Date(`${data.date}T${data.time}`), 'HH:mm')
          },
          displayDate: format(new Date(data.date), 'EEEE d MMMM yyyy', { locale: es }),
          period: parseInt(data.time.split(':')[0]) < 13 ? 'mañana' : 'tarde'
        })
      };

      mockAppointments[appointmentIndex] = updatedAppointment;
      return updatedAppointment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar la cita');
    }
  }, []);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
      if (appointmentIndex === -1) throw new Error('Cita no encontrada');
      
      mockAppointments.splice(appointmentIndex, 1);
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