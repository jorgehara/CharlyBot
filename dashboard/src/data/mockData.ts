import { format, addDays } from 'date-fns';

export const mockPatients = [
  {
    id: 'p1',
    name: 'Juan Pérez',
    phone: '555-0001',
    email: 'juan@email.com',
    obrasocial: 'OSDE'
  },
  {
    id: 'p2',
    name: 'María García',
    phone: '555-0002',
    email: 'maria@email.com',
    obrasocial: 'Swiss Medical'
  },
  {
    id: 'p3',
    name: 'Carlos López',
    phone: '555-0003',
    email: 'carlos@email.com',
    obrasocial: 'INSSSEP'
  }
];

const today = new Date();

export const mockAppointments = [
  {
    id: 'a1',
    summary: '🏥 Consulta Médica - Juan Pérez',
    description: 'Consulta de rutina',
    start: {
      dateTime: format(today, "yyyy-MM-dd'T'09:00:00"),
      displayTime: '09:00'
    },
    end: {
      dateTime: format(today, "yyyy-MM-dd'T'09:30:00"),
      displayTime: '09:30'
    },
    displayDate: format(today, 'EEEE d MMMM yyyy'),
    period: 'mañana',
    status: 'confirmada',
    patient: mockPatients[0],
    colorId: '1'
  },
  {
    id: 'a2',
    summary: '🏥 Consulta Médica - María García',
    description: 'Control mensual',
    start: {
      dateTime: format(today, "yyyy-MM-dd'T'10:00:00"),
      displayTime: '10:00'
    },
    end: {
      dateTime: format(today, "yyyy-MM-dd'T'10:30:00"),
      displayTime: '10:30'
    },
    displayDate: format(today, 'EEEE d MMMM yyyy'),
    period: 'mañana',
    status: 'pendiente',
    patient: mockPatients[1],
    colorId: '2'
  },
  {
    id: 'a3',
    summary: '🏥 Consulta Médica - Carlos López',
    description: 'Primera consulta',
    start: {
      dateTime: format(addDays(today, 1), "yyyy-MM-dd'T'15:00:00"),
      displayTime: '15:00'
    },
    end: {
      dateTime: format(addDays(today, 1), "yyyy-MM-dd'T'15:30:00"),
      displayTime: '15:30'
    },
    displayDate: format(addDays(today, 1), 'EEEE d MMMM yyyy'),
    period: 'tarde',
    status: 'confirmada',
    patient: mockPatients[2],
    colorId: '3'
  }
];

export const mockObrasSociales = [
  {
    id: 'os1',
    name: 'OSDE',
    shortName: 'OSDE',
    logo: '/images/osde-logo.png'
  },
  {
    id: 'os2',
    name: 'Swiss Medical',
    shortName: 'Swiss',
    logo: '/images/swiss-logo.png'
  },
  {
    id: 'os3',
    name: 'Instituto de Seguridad Social, Seguros y Préstamos',
    shortName: 'INSSSEP',
    logo: '/images/insssep-logo.png'
  }
];
