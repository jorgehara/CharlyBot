import mongoose from 'mongoose';

export interface IAppointment {
  clientName: string;
  socialWork?: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  eventId?: string;
}

const appointmentSchema = new mongoose.Schema<IAppointment>({
  clientName: { type: String, required: true },
  socialWork: String,
  phone: { type: String, required: true },
  email: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  eventId: String
}, {
  timestamps: true
});

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);