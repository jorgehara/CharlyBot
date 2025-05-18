import { FC } from 'react';

const AvailableSlots: FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Horarios Disponibles</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ].map(time => (
          <div
            key={time}
            className="p-3 text-center rounded-lg bg-white shadow hover:shadow-md 
                     cursor-pointer transition-shadow duration-200"
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableSlots;