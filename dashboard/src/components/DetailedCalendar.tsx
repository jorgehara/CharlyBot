import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,  
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { es } from 'date-fns/locale';
import './DetailedCalendar.css';

interface GoogleCalendarEvent {
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

interface Patient {
  name: string;
  phone: string;
  email: string | null;
  obrasocial: string | null;
}

interface AppointmentTime {
  dateTime: string;
  displayTime: string;
}

interface Appointment {
  id: string;
  summary: string;
  description: string;
  start: AppointmentTime;
  end: AppointmentTime;
  displayDate: string;
  period: 'mañana' | 'tarde';
  status: string;
  patient: Patient;
  colorId?: string;
  date?: string;
  patientName?: string;
}

interface CalendarResponse {
  success: boolean;
  date: string;
  events: GoogleCalendarEvent[];
}

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

const DetailedCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError,] = useState<string | null>(null);

  const getAppointmentsByPeriod = (appointments: Appointment[]) => {
    return {
      morning: appointments.filter(apt => apt.period === 'mañana'),
      afternoon: appointments.filter(apt => apt.period === 'tarde')
    };
  };

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CalendarResponse>('/appointments', {
        params: {
          date: format(currentDate, 'yyyy-MM-dd')
        }
      });

      if (response.data.success) {
        const formattedAppointments = response.data.events.map((event: GoogleCalendarEvent) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.start.dateTime,
            displayTime: format(new Date(event.start.dateTime), 'HH:mm')
          },
          end: {
            dateTime: event.end.dateTime,
            displayTime: format(new Date(event.end.dateTime), 'HH:mm')
          },
          displayDate: format(new Date(event.start.dateTime), 'EEEE d \'de\' MMMM \'de\' yyyy', { locale: es }),
          period: new Date(event.start.dateTime).getHours() < 12 ? 'mañana' : 'tarde',
          status: event.status || 'pendiente',
          patient: {
            name: event.extendedProperties?.private?.patientName || 'Sin nombre',
            phone: event.extendedProperties?.private?.patientPhone || 'Sin teléfono',
            email: event.extendedProperties?.private?.patientEmail || null,
            obrasocial: event.extendedProperties?.private?.socialWork || null
          },
          colorId: event.colorId
        }));

        setAppointments(formattedAppointments);
      } else {
        setError('No se pudieron cargar las citas');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error al cargar citas:', {
        error: axiosError,
        mensaje: axiosError?.response?.data?.message || 'Error desconocido',
        código: axiosError?.response?.status
      });
      
      setError('Error al cargar las citas. Por favor, intenta de nuevo más tarde.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    void fetchAppointments();
  }, [currentDate, fetchAppointments]);

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const selectDay = (day: Date) => {
    setSelectedDay(day);
    
    const filteredAppointments = appointments.filter(appointment => 
      isSameDay(new Date(appointment.start.dateTime), day)
    );
    
    setDayAppointments(filteredAppointments);
  };

  const cancelAppointment = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      try {
        console.log('Intentando cancelar cita:', { id });
        
        const response = await axios.delete(`/appointments/${id}`);
        
        console.log('Respuesta de cancelación:', {
          éxito: response.data.success,
          mensaje: response.data.message
        });
        
        fetchAppointments();
        
        if (selectedDay) {
          selectDay(selectedDay);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error al cancelar cita:', {
          error,
          mensaje: axiosError.response?.data?.message || 'Error desconocido',
          código: axiosError.response?.status
        });
        
        setError('Error al cancelar la cita. Por favor, intenta de nuevo.');
      }
    }
  };

  const renderAppointmentsByPeriod = (appointments: Appointment[]) => {
    const { morning, afternoon } = getAppointmentsByPeriod(appointments);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Mañana ({morning.length})</h4>
          <div className="space-y-4">
            {morning.map(appointment => renderAppointmentCard(appointment))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Tarde ({afternoon.length})</h4>
          <div className="space-y-4">
            {afternoon.map(appointment => renderAppointmentCard(appointment))}
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="appointment-card">
      <div className="flex justify-between items-start mb-3">
        <div className="appointment-info flex-1">
          <h5 className="font-semibold text-lg">{appointment.patientName}</h5>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm text-gray-600">Horario</p>
              <p className="font-medium">{appointment.start.displayTime} - {appointment.end.displayTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {appointment.patient.obrasocial && (
          <div>
            <p className="text-sm text-gray-600">Obra Social</p>
            <p className="font-medium">{appointment.patient.obrasocial}</p>
          </div>
        )}
        {appointment.patient.phone && (
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-medium">{appointment.patient.phone}</p>
          </div>
        )}
      </div>
      
      {appointment.patient.email && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium">{appointment.patient.email}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => cancelAppointment(appointment.id)}
          className="cancel-button"
        >
          Cancelar Cita
        </button>
      </div>
    </div>
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="detailed-calendar-container">
      <div className="calendar-header">
        <h2 className="text-2xl font-bold mb-4">Calendario de Citas</h2>
        <div className="month-navigation">
          <button onClick={prevMonth} className="nav-button">
            &lt; Mes Anterior
          </button>
          <h3 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy', { locale: es })}</h3>
          <button onClick={nextMonth} className="nav-button">
            Mes Siguiente &gt;
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando citas...</span>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}

      <div className="calendar">
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days">
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="day empty"></div>
          ))}
          
          {daysInMonth.map(day => {
            const dayAppointments = appointments.filter(apt => 
              isSameDay(new Date(apt.start.dateTime), day)
            );
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            
            return (
              <div 
                key={day.toString()} 
                className={`day ${isSelected ? 'selected' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}
                onClick={() => selectDay(day)}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {dayAppointments.length > 0 && (
                  <div className="appointment-indicators">
                    <span className="appointment-indicator">
                      {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
                    </span>
                    <div className="appointment-period-indicators">
                      {dayAppointments.some(apt => apt.period === 'mañana') && (
                        <span className="period-indicator morning">M</span>
                      )}
                      {dayAppointments.some(apt => apt.period === 'tarde') && (
                        <span className="period-indicator afternoon">T</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="day-details">
          <h3 className="text-xl font-bold mb-6">
            Citas para el {format(selectedDay, 'EEEE d \'de\' MMMM \'de\' yyyy', { locale: es })}
          </h3>
          
          {dayAppointments.length === 0 ? (
            <p className="text-center text-gray-500">No hay citas programadas para este día.</p>
          ) : (
            renderAppointmentsByPeriod(dayAppointments)
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedCalendar;