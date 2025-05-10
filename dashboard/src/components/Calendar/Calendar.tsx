import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointmentContext } from '../../context/AppointmentContext';
import { AppointmentForm } from './AppointmentForm';
import type { Appointment } from '../../types/calendar';

export const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { appointments, loading, error, fetchAppointments, deleteAppointment } = useAppointmentContext();

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta cita?')) {
      try {
        await deleteAppointment(id);
        await fetchAppointments(selectedDate);
      } catch (err) {
        console.error('Error al eliminar la cita:', err);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    fetchAppointments(selectedDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-100 mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Agenda del {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </h2>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            className="mt-2 p-2 border rounded-md"
          />
        </div>
        <button
          onClick={handleNewAppointment}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Nueva Cita
        </button>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay citas programadas para este día.</p>
        ) : (
          appointments.map((appointment: Appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {appointment.summary}
                  </h3>
                  <p className="text-gray-600">
                    {appointment.start.displayTime} - {appointment.end.displayTime}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Paciente:</span> {appointment.patient.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Teléfono:</span> {appointment.patient.phone}
                </p>
                {appointment.patient.email && (
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span> {appointment.patient.email}
                  </p>
                )}
                {appointment.patient.obrasocial && (
                  <p className="text-gray-700">
                    <span className="font-medium">Obra Social:</span> {appointment.patient.obrasocial}
                  </p>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleEditAppointment(appointment)}
                >
                  Editar
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <AppointmentForm
          onClose={handleCloseForm}
          initialData={
            selectedAppointment
              ? {
                  date: format(new Date(selectedAppointment.start.dateTime), 'yyyy-MM-dd'),
                  time: format(new Date(selectedAppointment.start.dateTime), 'HH:mm'),
                  patient: selectedAppointment.patient,
                  description: selectedAppointment.description
                }
              : undefined
          }
          eventId={selectedAppointment?.id}
        />
      )}
    </div>
  );
};