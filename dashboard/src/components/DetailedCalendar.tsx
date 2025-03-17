import React, { useState, useEffect } from 'react';
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

// Definimos la interfaz para nuestras citas
interface Appointment {
  id: string;
  date: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: string;
}

const DetailedCalendar: React.FC = () => {
  // Estados para manejar el calendario y las citas
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las citas del mes actual
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Formateamos la fecha para la API
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const formattedStart = format(monthStart, 'yyyy-MM-dd');
      const formattedEnd = format(monthEnd, 'yyyy-MM-dd');
      
      // Llamada a la API para obtener las citas
      const response = await axios.get('/appointments', {
        params: {
          startDate: formattedStart,
          endDate: formattedEnd
        }
      });
      
      // Verificar la estructura de la respuesta
      console.log('API Response:', response.data);
      
      // Si la respuesta tiene una estructura diferente, ajustar aquí
      // Por ejemplo, si la respuesta es { data: [...appointments] }
      const appointmentsData = response.data.data || response.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (err) {
      setError('Error al cargar las citas. Por favor, intenta de nuevo más tarde.');
      console.error('Error fetching appointments:', err);
      // En caso de error, establecer appointments como array vacío
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas cuando cambia el mes
  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  // Función para navegar al mes anterior
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Función para navegar al mes siguiente
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Función para seleccionar un día y mostrar sus citas
  const selectDay = (day: Date) => {
    setSelectedDay(day);
    
    // Filtrar las citas para el día seleccionado
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, day);
    });
    
    setDayAppointments(filteredAppointments);
  };

  // Función para cancelar una cita
  const cancelAppointment = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      try {
        await axios.delete(`/appointments/${id}`);
        // Actualizar la lista de citas después de cancelar
        fetchAppointments();
        
        // Actualizar las citas del día seleccionado
        if (selectedDay) {
          selectDay(selectedDay);
        }
      } catch (err) {
        setError('Error al cancelar la cita. Por favor, intenta de nuevo.');
        console.error('Error canceling appointment:', err);
      }
    }
  };

  // Función para contar las citas por día
  const getAppointmentCountForDay = (day: Date): number => {
    // Verificar que appointments sea un array antes de usar filter
    if (!Array.isArray(appointments)) {
      return 0;
    }
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, day);
    }).length;
  };

  // Generar los días del mes actual
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Nombres de los días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="detailed-calendar-container">
      <div className="calendar-header">
        <h2>Calendario de Citas</h2>
        <div className="month-navigation">
          <button onClick={prevMonth} className="nav-button">
            &lt; Mes Anterior
          </button>
          <h3>{format(currentDate, 'MMMM yyyy', { locale: es })}</h3>
          <button onClick={nextMonth} className="nav-button">
            Mes Siguiente &gt;
          </button>
        </div>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="calendar">
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days">
          {/* Añadir espacios en blanco para los días anteriores al inicio del mes */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="day empty"></div>
          ))}
          
          {/* Mostrar los días del mes */}
          {daysInMonth.map(day => {
            const appointmentCount = getAppointmentCountForDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            
            return (
              <div 
                key={day.toString()} 
                className={`day ${isSelected ? 'selected' : ''}`}
                onClick={() => selectDay(day)}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {appointmentCount > 0 && (
                  <span className="appointment-indicator">
                    {appointmentCount} {appointmentCount === 1 ? 'cita' : 'citas'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mostrar detalles de las citas del día seleccionado */}
      {selectedDay && (
        <div className="day-details">
          <h3>Citas para el {format(selectedDay, 'dd/MM/yyyy')}</h3>
          
          {dayAppointments.length === 0 ? (
            <p>No hay citas programadas para este día.</p>
          ) : (
            <div className="appointments-list">
              {dayAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-info">
                    <p><strong>Paciente:</strong> {appointment.patientName}</p>
                    <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                    <p><strong>Hora:</strong> {appointment.time}</p>
                    <p><strong>Estado:</strong> {appointment.status}</p>
                  </div>
                  <button 
                    onClick={() => cancelAppointment(appointment.id)}
                    className="cancel-button"
                  >
                    Cancelar Cita
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedCalendar; 