import { FC, useState } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaIdCard, FaNotesMedical, FaSearch } from 'react-icons/fa';

// Interfaces para nuestros datos
interface Patient {
  id: string;
  name: string;
  lastName: string;
  affiliateNumber: string;
  phoneNumber: string;
  additionalInfo?: string;
}

interface Appointment {
  id: string;
  time: string;
  patient: Patient;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

// Datos de ejemplo para mostrar en el dashboard
const mockPatients: Patient[] = [
  { 
    id: '1', 
    name: 'Juan', 
    lastName: 'Pérez', 
    affiliateNumber: 'AF-12345', 
    phoneNumber: '555-123-4567',
    additionalInfo: 'Alergia a penicilina'
  },
  { 
    id: '2', 
    name: 'María', 
    lastName: 'González', 
    affiliateNumber: 'AF-23456', 
    phoneNumber: '555-234-5678',
    additionalInfo: 'Hipertensión'
  },
  { 
    id: '3', 
    name: 'Carlos', 
    lastName: 'Rodríguez', 
    affiliateNumber: 'AF-34567', 
    phoneNumber: '555-345-6789' 
  },
  { 
    id: '4', 
    name: 'Ana', 
    lastName: 'Martínez', 
    affiliateNumber: 'AF-45678', 
    phoneNumber: '555-456-7890',
    additionalInfo: 'Embarazada - 2do trimestre'
  },
  { 
    id: '5', 
    name: 'Roberto', 
    lastName: 'López', 
    affiliateNumber: 'AF-56789', 
    phoneNumber: '555-567-8901' 
  },
];

const mockAppointments: Appointment[] = [
  { 
    id: 'a1', 
    time: '08:00', 
    patient: mockPatients[0], 
    status: 'pending',
    notes: 'Control de rutina'
  },
  { 
    id: 'a2', 
    time: '09:30', 
    patient: mockPatients[1], 
    status: 'pending',
    notes: 'Seguimiento tratamiento'
  },
  { 
    id: 'a3', 
    time: '11:00', 
    patient: mockPatients[2], 
    status: 'pending' 
  },
  { 
    id: 'a4', 
    time: '15:00', 
    patient: mockPatients[3], 
    status: 'pending',
    notes: 'Ecografía programada'
  },
  { 
    id: 'a5', 
    time: '16:30', 
    patient: mockPatients[4], 
    status: 'pending' 
  },
];

// Agrupar citas por turno (mañana/tarde)
const morningAppointments = mockAppointments.filter(app => {
  const hour = parseInt(app.time.split(':')[0]);
  return hour < 12;
});

const afternoonAppointments = mockAppointments.filter(app => {
  const hour = parseInt(app.time.split(':')[0]);
  return hour >= 12;
});

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 flex items-center h-full">
      <div className={`rounded-full p-2 ${color} text-white mr-3`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-xs sm:text-sm">{title}</h3>
        <p className="text-lg sm:text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onSelectPatient: (patient: Patient) => void;
}

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment, onSelectPatient }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-2 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <FaClock />
          </div>
          <span className="font-bold">{appointment.time}</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {appointment.status === 'completed' ? 'Completada' : 
           appointment.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
        </div>
      </div>
      
      <div className="mt-2 cursor-pointer" onClick={() => onSelectPatient(appointment.patient)}>
        <div className="flex items-center">
          <FaUser className="text-gray-500 mr-2" />
          <h3 className="font-medium">{appointment.patient.name} {appointment.patient.lastName}</h3>
        </div>
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <FaIdCard className="mr-2" />
          <span>Afiliado: {appointment.patient.affiliateNumber}</span>
        </div>
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <FaPhone className="mr-2" />
          <span>{appointment.patient.phoneNumber}</span>
        </div>
        {appointment.notes && (
          <div className="flex items-start mt-1 text-sm text-gray-600">
            <FaNotesMedical className="mr-2 mt-1" />
            <span>{appointment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  
  // Obtener la fecha actual
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Filtrar pacientes por búsqueda
  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.affiliateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber.includes(searchTerm)
  );

  // Función para seleccionar un paciente
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
    
    // En móvil, hacer scroll hacia los detalles del paciente
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('patient-details')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="p-3 sm:p-4 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Panel del Doctor</h2>
        <p className="text-sm text-gray-600 capitalize mt-1 sm:mt-0">{formattedDate}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard 
          title="Citas Hoy" 
          value={mockAppointments.length} 
          icon={<FaCalendarAlt size="18" />} 
          color="bg-primary"
        />
        <StatCard 
          title="Turno Mañana" 
          value={morningAppointments.length} 
          icon={<FaClock size="18" />} 
          color="bg-warning"
        />
        <StatCard 
          title="Turno Tarde" 
          value={afternoonAppointments.length} 
          icon={<FaClock size="18" />} 
          color="bg-secondary"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        <div className={`lg:col-span-3 flex flex-col ${showPatientDetails && window.innerWidth < 1024 ? 'hidden' : 'block'}`}>
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex-grow overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Citas del Día</h3>
              
              {/* Buscador móvil */}
              <div className="relative block lg:hidden">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-8 pr-3 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-32"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-2 top-2 text-gray-400 text-xs" />
              </div>
            </div>
            
            {morningAppointments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-primary">Turno Mañana</h4>
                <div className="space-y-2">
                  {morningAppointments.map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      onSelectPatient={handleSelectPatient}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {afternoonAppointments.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2 text-secondary">Turno Tarde</h4>
                <div className="space-y-2">
                  {afternoonAppointments.map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      onSelectPatient={handleSelectPatient}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {mockAppointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay citas programadas para hoy
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex flex-col gap-4 ${!showPatientDetails && window.innerWidth < 1024 ? 'hidden' : 'block'}`}>
          {/* Botón para volver a la lista en móvil */}
          {window.innerWidth < 1024 && (
            <button 
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md mb-2 flex items-center justify-center lg:hidden"
              onClick={() => setShowPatientDetails(false)}
            >
              ← Volver a la lista de citas
            </button>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex-grow-0 hidden lg:block">
            <h3 className="text-lg font-semibold mb-3">Buscar Paciente</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, Nº Afiliado o Teléfono..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="mt-3 max-h-40 overflow-y-auto">
              {searchTerm && filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <div 
                    key={patient.id} 
                    className="p-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="font-medium">{patient.name} {patient.lastName}</div>
                    <div className="text-sm text-gray-600">Afiliado: {patient.affiliateNumber}</div>
                    <div className="text-sm text-gray-600">{patient.phoneNumber}</div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="text-center py-3 text-gray-500">
                  No se encontraron pacientes
                </div>
              ) : null}
            </div>
          </div>
          
          {selectedPatient && (
            <div id="patient-details" className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex-grow overflow-y-auto">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">Detalles del Paciente</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSelectedPatient(null);
                    setShowPatientDetails(false);
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser size="24" className="text-gray-500" />
                  </div>
                </div>
                
                <div className="text-center mb-3">
                  <h4 className="text-lg font-bold">{selectedPatient.name} {selectedPatient.lastName}</h4>
                </div>
                
                <div className="border-t border-b border-gray-100 py-2">
                  <div className="flex items-center mb-1">
                    <FaIdCard className="text-primary mr-2" />
                    <span className="font-medium">Número de Afiliado</span>
                  </div>
                  <p className="pl-6">{selectedPatient.affiliateNumber}</p>
                </div>
                
                <div className="border-b border-gray-100 py-2">
                  <div className="flex items-center mb-1">
                    <FaPhone className="text-primary mr-2" />
                    <span className="font-medium">Teléfono</span>
                  </div>
                  <p className="pl-6">{selectedPatient.phoneNumber}</p>
                </div>
                
                {selectedPatient.additionalInfo && (
                  <div className="border-b border-gray-100 py-2">
                    <div className="flex items-center mb-1">
                      <FaNotesMedical className="text-primary mr-2" />
                      <span className="font-medium">Información Adicional</span>
                    </div>
                    <p className="pl-6">{selectedPatient.additionalInfo}</p>
                  </div>
                )}
                
                <div className="pt-3">
                  <button className="w-full bg-primary text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors">
                    Ver Historial Completo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 