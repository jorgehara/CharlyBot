import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  googleCalendarEventId: String,
  summary: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  start: {
    dateTime: Date,
    timeZone: String
  },
  end: {
    dateTime: Date,
    timeZone: String
  },
  patient: {
    name: String,
    phone: String,
    email: String,
    obrasocial: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);