export interface MongoPatient {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  obrasocial?: string;
}

export interface MongoAppointment {
  _id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  patient: MongoPatient;
  status: string;
  colorId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
