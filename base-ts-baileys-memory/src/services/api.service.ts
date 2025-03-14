import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Crear instancia de axios con la URL base
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

export class ApiService {
  /**
   * Obtiene los horarios disponibles para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD (opcional)
   * @param showOccupied Indica si se deben incluir los horarios ocupados
   * @returns Lista de horarios disponibles
   */
  static async getAvailableSlots(date?: string, showOccupied: boolean = false) {
    try {
      const params: any = {};
      if (date) params.date = date;
      if (showOccupied) params.showOccupied = true;
      
      const response = await apiClient.get(API_CONFIG.endpoints.availableSlots, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los horarios disponibles para una semana
   * @param startDate Fecha de inicio en formato YYYY-MM-DD (opcional)
   * @returns Lista de horarios disponibles para la semana
   */
  static async getWeeklySlots(startDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      
      const response = await apiClient.get(API_CONFIG.endpoints.weeklySlots, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios semanales:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva cita
   * @param appointmentData Datos de la cita
   * @returns Información de la cita creada
   */
  static async createAppointment(appointmentData: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
    email?: string;
    description?: string;
  }) {
    try {
      const response = await apiClient.post(API_CONFIG.endpoints.appointments, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  }
  
  /**
   * Cancela una cita existente
   * @param appointmentId ID de la cita a cancelar
   * @returns Resultado de la operación
   */
  static async cancelAppointment(appointmentId: string) {
    try {
      const response = await apiClient.delete(`${API_CONFIG.endpoints.appointments}/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  }
  
  /**
   * Busca citas por teléfono del paciente
   * @param phone Teléfono del paciente
   * @returns Lista de citas del paciente
   */
  static async findAppointmentsByPhone(phone: string) {
    try {
      const response = await apiClient.get(API_CONFIG.endpoints.appointments, {
        params: { phone }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar citas por teléfono:', error);
      throw error;
    }
  }
  
  /**
   * Registra un nuevo paciente
   * @param patientData Datos del paciente
   * @returns Información del paciente registrado
   */
  static async registerPatient(patientData: {
    name: string;
    phone: string;
    email?: string;
    birthdate?: string;
    address?: string;
    notes?: string;
  }) {
    try {
      const response = await apiClient.post(API_CONFIG.endpoints.patients, patientData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      throw error;
    }
  }
} 