import dotenv from 'dotenv';
dotenv.config();

export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
  endpoints: {
    availableSlots: '/appointments/available-slots',
    weeklySlots: '/appointments/weekly-slots',
    appointments: '/appointments',
    patients: '/patients'
  }
}; 