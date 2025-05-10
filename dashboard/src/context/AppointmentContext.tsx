import React, { createContext, useContext, ReactNode } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment, AppointmentCreationData } from '../types/calendar';

interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: (date: Date) => Promise<void>;
  createAppointment: (data: AppointmentCreationData) => Promise<any>;
  updateAppointment: (eventId: string, data: Partial<AppointmentCreationData>) => Promise<any>;
  deleteAppointment: (eventId: string) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const appointmentService = useAppointments();

  return (
    <AppointmentContext.Provider value={appointmentService}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointmentContext() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointmentContext debe ser usado dentro de un AppointmentProvider');
  }
  return context;
}