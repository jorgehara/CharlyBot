import { FC, useState } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaIdCard, FaNotesMedical, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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
  darkMode: boolean;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, color, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-4 flex items-center h-full hover:shadow-lg transition-shadow`}>
      <div className={`rounded-full p-3 ${color} text-white mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm font-medium`}>{title}</h3>
        <p className="text-lg sm:text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onSelectPatient: (patient: Patient) => void;
  darkMode: boolean;
}

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment, onSelectPatient, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm p-4 mb-2 hover:shadow-md transition-all transform hover:-translate-y-1 border-l-4 border-primary`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
            <FaClock />
          </div>
          <span className="font-bold text-lg">{appointment.time}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {appointment.status === 'completed' ? 'Completada' : 
           appointment.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
        </div>
      </div>
      
      <div className={`mt-3 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} p-2 rounded-md transition-colors`} onClick={() => onSelectPatient(appointment.patient)}>
        <div className="flex items-center">
          <FaUser className="text-primary mr-2" />
          <h3 className="font-medium">{appointment.patient.name} {appointment.patient.lastName}</h3>
        </div>
        <div className={`flex items-center mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaIdCard className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span>Afiliado: {appointment.patient.affiliateNumber}</span>
        </div>
        <div className={`flex items-center mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaPhone className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span>{appointment.patient.phoneNumber}</span>
        </div>
        {appointment.notes && (
          <div className={`flex items-start mt-2 text-sm ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-50'} p-2 rounded-md`}>
            <FaNotesMedical className="mr-2 mt-1 text-primary" />
            <span>{appointment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: FC<{ darkMode: boolean; toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
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
    // Contenedor principal del dashboard
    // Cambia el color de fondo y texto según el modo oscuro
    
    <div className={`p-4 sm:p-6 h-full w-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-200`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">

        <h2 className="text-xl sm:text-2xl font-bold">Panel del Doctor</h2>
        
        <p className={`text-sm ${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-white'} capitalize mt-1 sm:mt-0 px-3 py-1 rounded-md shadow-sm`}>{formattedDate}</p>
        
        {/* Ícono para alternar el modo oscuro */}
        <button onClick={toggleDarkMode} className="ml-4 text-sm flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded-md shadow-sm">
          {darkMode ? "Tema Claro" : "Tema Oscuro"}
          {darkMode ? <FaEyeSlash className="text-gray-200" /> : <FaEye className="text-gray-200" />}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Citas Hoy" 
          value={mockAppointments.length} 
          icon={<FaCalendarAlt size="20" />} 
          color="bg-primary"
          darkMode={darkMode}
        />
        <StatCard 
          title="Turno Mañana" 
          value={morningAppointments.length} 
          icon={<FaClock size="20" />} 
          color="bg-warning"
          darkMode={darkMode}
        />
        <StatCard 
          title="Turno Tarde" 
          value={afternoonAppointments.length} 
          icon={<FaClock size="20" />} 
          color="bg-secondary"
          darkMode={darkMode}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
        <div className={`lg:col-span-3 flex flex-col ${showPatientDetails && window.innerWidth < 1024 ? 'hidden' : 'block'}`}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-5 flex-grow overflow-y-auto transition-colors duration-200`}>
            <div className={`flex justify-between items-center mb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-3`}>
              <h3 className="text-lg font-bold">Citas del Día</h3>
              
              {/* Buscador móvil */}
              <div className="relative block lg:hidden">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className={`pl-9 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary text-sm w-40`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`} />
              </div>
            </div>
            
            {morningAppointments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-bold mb-3 text-primary flex items-center">
                  <FaClock className="mr-2" /> Turno Mañana
                </h4>
                <div className="space-y-3">
                  {morningAppointments.map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      onSelectPatient={handleSelectPatient}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {afternoonAppointments.length > 0 && (
              <div>
                <h4 className="text-md font-bold mb-3 text-secondary flex items-center">
                  <FaClock className="mr-2" /> Turno Tarde
                </h4>
                <div className="space-y-3">
                  {afternoonAppointments.map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      onSelectPatient={handleSelectPatient}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {mockAppointments.length === 0 && (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'} rounded-lg`}>
                <FaCalendarAlt className={`mx-auto text-4xl mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className="text-lg">No hay citas programadas para hoy</p>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex flex-col gap-4 ${!showPatientDetails && window.innerWidth < 1024 ? 'hidden' : 'block'}`}>
          {/* Botón para volver a la lista en móvil */}
          {window.innerWidth < 1024 && (
            <button 
              className={`${darkMode ? 'bg-gray-800 text-primary' : 'bg-white text-primary'} px-4 py-3 rounded-md mb-2 flex items-center justify-center lg:hidden shadow-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              onClick={() => setShowPatientDetails(false)}
            >
              ← Volver a la lista de citas
            </button>
          )}
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-5 flex-grow-0 hidden lg:block transition-colors duration-200`}>
            <h3 className="text-lg font-bold mb-4">Buscar Paciente</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, Nº Afiliado o Teléfono..."
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary text-sm`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className={`absolute left-3 top-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            
            <div className={`mt-4 max-h-60 overflow-y-auto rounded-md border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {searchTerm && filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <div 
                    key={patient.id} 
                    className={`p-3 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-blue-50'} cursor-pointer transition-colors`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="font-medium text-primary">{patient.name} {patient.lastName}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Afiliado: {patient.affiliateNumber}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{patient.phoneNumber}</div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FaSearch className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  No se encontraron pacientes
                </div>
              ) : null}
            </div>
          </div>
          
          {selectedPatient && (
            <div id="patient-details" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-5 flex-grow overflow-y-auto transition-colors duration-200`}>
              <div className={`flex justify-between items-start mb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-3`}>
                <h3 className="text-lg font-bold">Detalles del Paciente</h3>
                <button 
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200'} rounded-full w-8 h-8 flex items-center justify-center transition-colors`}
                  onClick={() => {
                    setSelectedPatient(null);
                    setShowPatientDetails(false);
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-20 h-20 ${darkMode ? 'bg-gray-700' : 'bg-primary bg-opacity-10'} rounded-full flex items-center justify-center`}>
                    <FaUser size="32" className="text-primary" />
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold">{selectedPatient.name} {selectedPatient.lastName}</h4>
                </div>
                
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                  <div className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} pb-3`}>
                    <div className="flex items-center mb-2">
                      <FaIdCard className="text-primary mr-3 text-lg" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Número de Afiliado</span>
                    </div>
                    <p className={`pl-8 ${darkMode ? 'text-white' : 'text-gray-800'} font-medium`}>{selectedPatient.affiliateNumber}</p>
                  </div>
                  
                  <div className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} pb-3`}>
                    <div className="flex items-center mb-2">
                      <FaPhone className="text-primary mr-3 text-lg" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Teléfono</span>
                    </div>
                    <p className={`pl-8 ${darkMode ? 'text-white' : 'text-gray-800'} font-medium`}>{selectedPatient.phoneNumber}</p>
                  </div>
                  
                  {selectedPatient.additionalInfo && (
                    <div>
                      <div className="flex items-center mb-2">
                        <FaNotesMedical className="text-primary mr-3 text-lg" />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Información Adicional</span>
                      </div>
                      <p className={`pl-8 ${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} p-3 rounded-md border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>{selectedPatient.additionalInfo}</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <button className="w-full bg-primary text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center justify-center">
                    <FaNotesMedical className="mr-2" /> Ver Historial Completo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="dashboard-actions mt-6">
        <Link to="/calendario-detallado" className={`${darkMode ? 'bg-gray-800 text-primary hover:bg-primary hover:text-white' : 'bg-white text-primary hover:bg-primary hover:text-white'} shadow-md rounded-lg px-5 py-3 font-medium flex items-center justify-center transition-colors`}>
          <FaCalendarAlt className="mr-2" />
          <span>Ver Calendario Detallado</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;