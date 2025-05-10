export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  displayTime: string;
}

export interface Patient {
  name: string;
  phone: string;
  email: string | null;
  obrasocial: string | null;
}

export interface Appointment {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    displayTime: string;
  };
  end: {
    dateTime: string;
    displayTime: string;
  };
  displayDate: string;
  patient: Patient;
  status: string;
  colorId?: string;
}

export interface CalendarResponse {
  success: boolean;
  date: string;
  events: Array<GoogleCalendarEvent>;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status: string;
  colorId: string;
  created: string;
  updated: string;
  extendedProperties?: {
    private?: {
      patientName?: string;
      patientPhone?: string;
      patientEmail?: string;
      socialWork?: string;
    };
  };
}

export interface AppointmentCreationData {
  date: string;
  time: string;
  patient: Patient;
  description?: string;
}