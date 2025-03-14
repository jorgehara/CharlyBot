import { calendar_v3 } from 'googleapis';

export interface TimeSlot {
  time: string;
  displayTime: string;
  displayDate: string;
  period: string;
  status: 'disponible' | 'ocupado';
}

export interface SlotsResponse {
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
  allSlots: TimeSlot[];
}

export interface BusySlot {
  start: string;
  end: string;
  summary?: string;
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