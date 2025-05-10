import React, { useState } from 'react';
import { useAppointmentContext } from '../../context/AppointmentContext';
import type { Patient } from '../../types/calendar';

interface AppointmentFormProps {
  onClose: () => void;
  initialData?: {
    date: string;
    time: string;
    patient: Patient;
    description?: string;
  };
  eventId?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onClose,
  initialData,
  eventId
}) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    time: initialData?.time || '',
    patientName: initialData?.patient.name || '',
    patientPhone: initialData?.patient.phone || '',
    patientEmail: initialData?.patient.email || '',
    patientObraSocial: initialData?.patient.obrasocial || '',
    description: initialData?.description || ''
  });

  const { createAppointment, updateAppointment } = useAppointmentContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        date: formData.date,
        time: formData.time,
        patient: {
          name: formData.patientName,
          phone: formData.patientPhone,
          email: formData.patientEmail,
          obrasocial: formData.patientObraSocial
        },
        description: formData.description
      };

      if (eventId) {
        await updateAppointment(eventId, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {eventId ? 'Editar Cita' : 'Nueva Cita'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hora</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Paciente</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="patientPhone"
              value={formData.patientPhone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="patientEmail"
              value={formData.patientEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Obra Social</label>
            <input
              type="text"
              name="patientObraSocial"
              value={formData.patientObraSocial}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : eventId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};