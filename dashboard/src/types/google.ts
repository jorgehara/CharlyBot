export interface GoogleEvent {
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

export interface TimeSlot {
  time: string;
  displayTime: string;
  displayDate: string;
  period: 'mañana' | 'tarde';
  status: 'disponible' | 'ocupado';
}
