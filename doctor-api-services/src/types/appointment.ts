import { calendar_v3 } from 'googleapis';

export interface TimeSlot {
  time: string;
  displayTime: string;
  displayDate: string;
  period: 'mañana' | 'tarde';
  status: 'disponible' | 'ocupado';
  eventSummary?: string;
}

export interface SlotsResponse {
  success: boolean;
  date: string;
  displayDate: string;
  available: {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
    total: number;
  };
  occupied: {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
    total: number;
  };
  slots?: TimeSlot[];
}

export interface BusySlot {
  start: string;
  end: string;
  summary?: string;
  period?: 'mañana' | 'tarde';
  displayTime?: string;
  displayDate?: string;
}

export interface AppointmentInfo {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    displayTime: string;
  };
  end: {
    dateTime: string;
    displayTime: string;
  };
  displayDate: string;
  patient: {
    name: string;
    obrasocial: string | null;
    phone: string;
    email: string | null;
  };
}

export interface WeeklySlotDay {
  date: string;
  displayDate: string;
  dayOfWeek: string;
  availableCount: number;
  occupiedCount: number;
  availableSlots: TimeSlot[];
}

export interface WeeklySlotResponse {
  success: boolean;
  startDate: string;
  endDate: string;
  days: WeeklySlotDay[];
}