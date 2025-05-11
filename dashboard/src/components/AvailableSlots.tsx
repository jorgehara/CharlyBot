import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeSlot } from '../types/google';
import { useMongoAppointments } from '../hooks/useMongoAppointments';

const AvailableSlots: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { availableSlots, loading, error, fetchAvailableSlots } = useMongoAppointments();

  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

  const renderSlotList = (slots: TimeSlot[], title: string) => (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-3">{title}</h4>
      {slots.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {slots.map((slot, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg text-sm ${
                slot.status === 'disponible'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {slot.displayTime}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay horarios {slot.status === 'disponible' ? 'disponibles' : 'ocupados'}</p>
      )}
    </div>
  );

  return (
    <div className="available-slots-container p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Horarios del Día</h2>
      
      <div className="mb-6">
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="p-2 border rounded"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando horarios...</span>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : slots ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Horarios para el {format(new Date(slots.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </h3>
          
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800">Disponibles Mañana</h5>
              <p className="text-2xl font-bold text-green-600">{slots.available.morning.length}</p>
            </div>
            <div className="stat-card bg-red-50 p-4 rounded-lg">
              <h5 className="font-medium text-red-800">Ocupados Mañana</h5>
              <p className="text-2xl font-bold text-red-600">{slots.occupied.morning.length}</p>
            </div>
            <div className="stat-card bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800">Disponibles Tarde</h5>
              <p className="text-2xl font-bold text-green-600">{slots.available.afternoon.length}</p>
            </div>
            <div className="stat-card bg-red-50 p-4 rounded-lg">
              <h5 className="font-medium text-red-800">Ocupados Tarde</h5>
              <p className="text-2xl font-bold text-red-600">{slots.occupied.afternoon.length}</p>
            </div>
          </div>

          <div className="slots-lists">
            <h4 className="text-xl font-semibold mb-4">Horarios de la Mañana</h4>
            {renderSlotList(slots.available.morning, 'Disponibles')}
            {renderSlotList(slots.occupied.morning, 'Ocupados')}

            <h4 className="text-xl font-semibold mb-4 mt-6">Horarios de la Tarde</h4>
            {renderSlotList(slots.available.afternoon, 'Disponibles')}
            {renderSlotList(slots.occupied.afternoon, 'Ocupados')}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AvailableSlots;