import { FC, useState, useEffect } from 'react';
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
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment } from '../types/calendar';

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DetailedCalendar: FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
  const { appointments, loading, error, fetchAppointments } = useAppointments();

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const selectDay = (day: Date) => {
    setSelectedDay(day);
    const appointmentsForDay = appointments.filter(apt => 
      isSameDay(new Date(apt.start.dateTime), day)
    );
    setSelectedDayAppointments(appointmentsForDay);
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
      <div className="flex justify-between items-start p-4 bg-white rounded-lg shadow">
        <div>
          <h5 className="font-medium">{appointment.patient.name}</h5>
          <p className="text-sm text-gray-600">{appointment.start.displayTime}</p>
          {appointment.description && (
            <p className="text-sm text-gray-500 mt-2">{appointment.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="calendar-container p-4">
      <div className="calendar-header flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded hover:bg-gray-100">&lt;</button>
          <button onClick={nextMonth} className="p-2 rounded hover:bg-gray-100">&gt;</button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekdays grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() - 1 }).map((_, index) => (
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
                className={`day p-2 text-center cursor-pointer rounded
                  ${isSelected ? 'bg-blue-100' : ''} 
                  ${dayAppointments.length > 0 ? 'font-bold' : ''}`}
                onClick={() => selectDay(day)}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {dayAppointments.length > 0 && (
                  <div className="appointment-indicators">
                    <span className="appointment-count text-xs text-blue-600">
                      {dayAppointments.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="selected-day-appointments mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Citas para el {format(selectedDay, 'EEEE d \'de\' MMMM \'de\' yyyy', { locale: es })}
          </h3>
          {loading ? (
            <div className="loading">Cargando citas...</div>
          ) : error ? (
            <div className="error text-red-500">{error}</div>
          ) : selectedDayAppointments.length === 0 ? (
            <div className="no-appointments text-gray-500">
              No hay citas programadas para este día
            </div>
          ) : (
            renderAppointmentsByPeriod(selectedDayAppointments)
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedCalendar;