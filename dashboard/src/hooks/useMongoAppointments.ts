import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { MongoAppointment } from '../types/mongo';
import type { TimeSlot } from '../types/google';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AvailableSlotsResponse {
  success: boolean;
  date: string;
  displayDate: string;
  available: {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
  };
  occupied: {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
  };
}

export const useMongoAppointments = () => {
  const [appointments, setAppointments] = useState<MongoAppointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (date?: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateParam = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const response = await axios.get<ApiResponse<MongoAppointment[]>>(
        'http://localhost:3001/api/appointments',
        { params: { date: dateParam } }
      );

      if (response.data.success) {
        setAppointments(response.data.data);
      } else {
        setError(response.data.message || 'Error al cargar las citas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateParam = date.toISOString().split('T')[0];
      const response = await axios.get<AvailableSlotsResponse>(
        'http://localhost:3001/api/appointments/available-slots',
        { params: { date: dateParam } }
      );

      if (response.data.success) {
        setAvailableSlots(response.data);
      } else {
        setError('No se pudieron cargar los horarios disponibles');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Error fetching available slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData: {
    clientName: string;
    socialWork?: string;
    phone: string;
    email?: string;
    date: string;
    time: string;
    description?: string;
  }) => {
    try {
      const response = await axios.post<ApiResponse<MongoAppointment>>(
        'http://localhost:3001/api/appointments',
        appointmentData
      );

      if (response.data.success) {
        await fetchAppointments();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'No se pudo crear la cita');
      }
    } catch (err) {
      throw new Error('Error al conectar con el servidor');
    }
  }, [fetchAppointments]);

  const updateAppointment = useCallback(async (
    id: string,
    data: Partial<Omit<MongoAppointment, '_id' | 'createdAt' | 'eventId'>>
  ) => {
    try {
      const response = await axios.put<ApiResponse<MongoAppointment>>(
        `http://localhost:3001/api/appointments/${id}`,
        data
      );

      if (response.data.success) {
        await fetchAppointments();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'No se pudo actualizar la cita');
      }
    } catch (err) {
      throw new Error('Error al conectar con el servidor');
    }
  }, [fetchAppointments]);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      const response = await axios.delete<ApiResponse<void>>(
        `http://localhost:3001/api/appointments/${id}`
      );

      if (response.data.success) {
        await fetchAppointments();
      } else {
        throw new Error(response.data.message || 'No se pudo eliminar la cita');
      }
    } catch (err) {
      throw new Error('Error al conectar con el servidor');
    }
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    availableSlots,
    loading,
    error,
    fetchAppointments,
    fetchAvailableSlots,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};
