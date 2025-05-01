import { FC, useState, useEffect } from 'react';
import { 
  FaHome, FaCog, FaUser, FaEye, FaEyeSlash,
  FaChevronLeft, FaHistory, FaUserMd, FaCalendarDay,
  FaCalendarAlt, FaIdCard, FaPhone, FaEnvelope
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// Interfaces mejoradas con tipos más específicos
interface ObraSocial {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface Patient {
  id: string;
  name: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  obraSocial: ObraSocial;
  affiliateNumber: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  additionalInfo?: string;
  lastVisit?: string;
  nextAppointment?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient: Patient;
  status: 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'consultation' | 'follow-up' | 'study' | 'procedure';
  notes?: string;
  duration: number; // en minutos
}

// Mock data más completa
const mockObrasSociales: ObraSocial[] = [
  { id: '1', name: 'INSSSEP', shortName: 'INSSSEP' },
  { id: '2', name: 'Galeano', shortName: 'GAL' },
  { id: '3', name: 'Medicus', shortName: 'MED' },
  { id: '4', name: 'Medisalud', shortName: 'MS' },
  { id: '5', name: 'Consulta Particular', shortName: 'PART' },
];

const mockPatients: Patient[] = [
  { 
    id: '1', 
    name: 'Juan', 
    lastName: 'Pérez',
    age: 42,
    gender: 'male',
    obraSocial: mockObrasSociales[0],
    affiliateNumber: 'AF-12345', 
    phoneNumber: '555-123-4567',
    email: 'juan.perez@example.com',
    additionalInfo: 'Alergia a penicilina',
    lastVisit: '2023-05-15',
    nextAppointment: '2023-06-20'
  },
  { 
    id: '2', 
    name: 'María', 
    lastName: 'González',
    age: 35,
    gender: 'female',
    obraSocial: mockObrasSociales[1], 
    affiliateNumber: 'AF-23456', 
    phoneNumber: '555-234-5678',
    additionalInfo: 'Hipertensión',
    lastVisit: '2023-05-10',
    nextAppointment: '2023-06-15'
  },
  { 
    id: '3', 
    name: 'Carlos', 
    lastName: 'Rodríguez',
    age: 28,
    gender: 'male',
    obraSocial: mockObrasSociales[2], 
    affiliateNumber: 'AF-34567', 
    phoneNumber: '555-345-6789',
    lastVisit: '2023-04-20'
  },
  { 
    id: '4', 
    name: 'Ana', 
    lastName: 'Martínez',
    age: 31,
    gender: 'female',
    obraSocial: mockObrasSociales[3],
    affiliateNumber: 'AF-45678', 
    phoneNumber: '555-456-7890',
    additionalInfo: 'Embarazada - 2do trimestre',
    lastVisit: '2023-05-05',
    nextAppointment: '2023-05-25'
  },
  { 
    id: '5', 
    name: 'Roberto', 
    lastName: 'López',
    age: 50,
    gender: 'male',
    obraSocial: mockObrasSociales[4],
    affiliateNumber: 'AF-56789', 
    phoneNumber: '555-567-8901',
    lastVisit: '2023-04-15'
  },
];

const mockAppointments: Appointment[] = [
  { 
    id: 'a1', 
    date: '2023-05-20',
    time: '08:00', 
    patient: mockPatients[0], 
    status: 'pending',
    type: 'consultation',
    duration: 30
  },
  { 
    id: 'a2', 
    date: '2023-05-20',
    time: '09:00', 
    patient: mockPatients[1], 
    status: 'completed',
    type: 'follow-up',
    duration: 45
  },
];

const Dashboard: FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-darker">
      {/* Sidebar */}
      <div className={`hidden md:flex flex-shrink-0 transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-dark text-white' : 'bg-white text-gray-800'}`}>
        <div className="flex flex-col h-full w-64">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Panel Médico
            </h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <div className="px-4 space-y-2">
              {/* Elementos de navegación */}
              <NavItem icon={<FaHome />} text="Inicio" active />
              <NavItem icon={<FaUserMd />} text="Pacientes" />
              <NavItem icon={<FaCalendarDay />} text="Citas" />
              <NavItem icon={<FaHistory />} text="Historial" />
              <NavItem icon={<FaCog />} text="Configuración" />
            </div>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-16 flex items-center justify-between px-6 border-b transition-colors duration-200
          ${darkMode ? 'bg-dark border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <FaChevronLeft size={20} />
            </button>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Panel del Doctor
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200
                ${darkMode 
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {darkMode ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-200
          ${darkMode ? 'bg-dark-darker' : 'bg-gray-50'}`}>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Citas Hoy"
              value={mockAppointments.length}
              icon={<FaCalendarAlt />}
              trend="up"
              trendValue="+2"
            />
            {/* ...más StatCards... */}
          </div>

          {/* Appointments Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${isMobileView && selectedPatient ? 'hidden' : ''}`}>
              <div className={`rounded-lg shadow-sm transition-colors duration-200
                ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                <div className={`p-4 border-b transition-colors duration-200
                  ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Citas del Día
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {mockAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onSelectPatient={() => setSelectedPatient(appointment.patient)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Details Section */}
            <div className={`${isMobileView && !selectedPatient ? 'hidden' : ''}`}>
              <div className={`rounded-lg shadow-sm transition-colors duration-200
                ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                <div className={`p-4 border-b transition-colors duration-200
                  ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Detalles del Paciente
                  </h3>
                </div>
                {selectedPatient ? (
                  <div className="p-4">
                    <PatientDetails patient={selectedPatient} />
                  </div>
                ) : (
                  <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Seleccione un paciente para ver sus detalles
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const NavItem: FC<NavItemProps> = ({ icon, text, active }) => {
  const { darkMode } = useTheme();
  return (
    <button className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200
      ${active 
        ? (darkMode ? 'bg-primary-dark text-white' : 'bg-primary text-white')
        : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}`}>
      <span className="text-xl mr-3">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, trend, trendValue }) => {
  const { darkMode } = useTheme();
  return (
    <div className={`rounded-lg shadow-sm p-6 transition-colors duration-200
      ${darkMode ? 'bg-dark' : 'bg-white'}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg mr-4
          ${darkMode ? 'bg-gray-700 text-primary-light' : 'bg-primary-light bg-opacity-10 text-primary'}`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </h3>
          <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-1 flex items-center
              ${trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface PatientDetailsProps {
  patient: Patient;
}

const PatientDetails: FC<PatientDetailsProps> = ({ patient }) => {
  const { darkMode } = useTheme();
  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <FaUser className={darkMode ? 'text-gray-300' : 'text-gray-600'} size={24} />
          </div>
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {patient.name} {patient.lastName}
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {patient.age} años - {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <InfoItem icon={<FaIdCard />} label="Obra Social" value={patient.obraSocial.name} />
        <InfoItem icon={<FaPhone />} label="Teléfono" value={patient.phoneNumber} />
        {patient.email && (
          <InfoItem icon={<FaEnvelope />} label="Email" value={patient.email} />
        )}
      </div>

      {patient.additionalInfo && (
        <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Información Adicional
          </h4>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
            {patient.additionalInfo}
          </p>
        </div>
      )}
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: FC<InfoItemProps> = ({ icon, label, value }) => {
  const { darkMode } = useTheme();
  return (
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{icon}</span>
      </div>
      <div>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onSelectPatient: (patient: Patient) => void;
}

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment, onSelectPatient }) => {
  const { darkMode } = useTheme();
  
  const getStatusColor = () => {
    switch(appointment.status) {
      case 'completed':
        return darkMode 
          ? 'bg-green-900 text-green-100' 
          : 'bg-green-100 text-green-800';
      case 'cancelled':
        return darkMode 
          ? 'bg-red-900 text-red-100' 
          : 'bg-red-100 text-red-800';
      case 'rescheduled':
        return darkMode 
          ? 'bg-yellow-900 text-yellow-100' 
          : 'bg-yellow-100 text-yellow-800';
      default:
        return darkMode 
          ? 'bg-blue-900 text-blue-100' 
          : 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch(appointment.status) {
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'rescheduled': return 'Reprogramada';
      default: return 'Pendiente';
    }
  };

  return (
    <div 
      onClick={() => onSelectPatient(appointment.patient)}
      className={`p-4 rounded-lg cursor-pointer transition-colors duration-200
        ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <FaUser className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </div>
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.patient.name} {appointment.patient.lastName}
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {appointment.time} - {appointment.duration} min
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;