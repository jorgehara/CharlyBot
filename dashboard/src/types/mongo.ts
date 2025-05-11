export interface MongoPatient {
  name: string;
  phone: string;
  email?: string;
  obrasocial?: string;
}

export interface MongoAppointment {
  _id: string;
  clientName: string;
  socialWork?: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  eventId?: string;
  createdAt: string;
}
