import { FC, useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaClock, FaUser, FaPhone, FaIdCard, 
  FaNotesMedical, FaSearch, FaEye, FaEyeSlash,
  FaChevronLeft, FaPlus, FaHistory, FaCog,
  FaSignOutAlt, FaUserMd, FaCalendarDay, FaProcedures, FaClinicMedical
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getWeeklySlots } from '../utils-API/utils';


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
    notes: 'Control de rutina',
    duration: 30
  },
  { 
    id: 'a2', 
    date: '2023-05-20',
    time: '09:30', 
    patient: mockPatients[1], 
    status: 'pending',
    type: 'follow-up',
    notes: 'Seguimiento tratamiento',
    duration: 45
  },
  { 
    id: 'a3', 
    date: '2023-05-20',
    time: '11:00', 
    patient: mockPatients[2], 
    status: 'pending',
    type: 'study',
    duration: 60
  },
  { 
    id: 'a4', 
    date: '2023-05-20',
    time: '15:00', 
    patient: mockPatients[3], 
    status: 'pending',
    type: 'procedure',
    notes: 'Ecografía programada',
    duration: 30
  },
  { 
    id: 'a5', 
    date: '2023-05-20',
    time: '16:30', 
    patient: mockPatients[4], 
    status: 'pending',
    type: 'consultation',
    duration: 30
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

// Componente de tarjeta de estadísticas mejorado
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  darkMode: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, color, darkMode, trend, trendValue }) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-4 flex items-center h-full hover:shadow-md transition-all duration-200 border-l-4 ${color}`}>
      <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm font-medium`}>{title}</h3>
        <div className="flex items-end justify-between">
          <p className="text-lg sm:text-xl font-bold">{value}</p>
          {trend && trendValue && (
            <span className={`text-xs ${trendColors[trend]} flex items-center`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de cita mejorado
interface AppointmentCardProps {
  appointment: Appointment;
  onSelectPatient: (patient: Patient) => void;
  darkMode: boolean;
}

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment, onSelectPatient, darkMode }) => {
  const getStatusColor = () => {
    switch(appointment.status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch(appointment.status) {
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'rescheduled': return 'Reagendada';
      default: return 'Pendiente';
    }
  };

  const getTypeIcon = () => {
    switch(appointment.type) {
      case 'consultation': return <FaUserMd className="text-blue-500" />;
      case 'follow-up': return <FaHistory className="text-green-500" />;
      case 'study': return <FaClinicMedical className="text-purple-500" />;
      case 'procedure': return <FaProcedures className="text-orange-500" />;
      default: return <FaCalendarDay className="text-gray-500" />;
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-all duration-200 border-l-4 ${darkMode ? 'border-primary-600' : 'border-primary'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`${darkMode ? 'bg-sky-900' : 'bg-primary'} text-white rounded-lg w-10 h-10 flex items-center justify-center mr-3`}>
            <FaClock />
          </div>
          <div>
            <span className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{appointment.time}</span>
            <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duración: {appointment.duration} min</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-2">
            {getTypeIcon()}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
      </div>
      
      <div 
        className={`mt-3 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} p-2 rounded-md transition-colors`} 
        onClick={() => onSelectPatient(appointment.patient)}
      >
        <div className="flex items-center">
          <FaUser className={`${darkMode ? 'text-primary-400' : 'text-primary'} mr-2`} />
          <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{appointment.patient.name} {appointment.patient.lastName}</h3>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {appointment.patient.age} años
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <FaIdCard className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>{appointment.patient.obraSocial.shortName}: {appointment.patient.affiliateNumber}</span>
          </div>
          <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <FaPhone className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>{appointment.patient.phoneNumber}</span>
          </div>
        </div>
        
        {appointment.notes && (
          <div className={`flex items-start mt-2 text-sm ${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'} p-2 rounded-md`}>
            <FaNotesMedical className={`mr-2 mt-1 ${darkMode ? 'text-primary-400' : 'text-primary'}`} />
            <span>{appointment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal del Dashboard
const Dashboard: FC<{ darkMode: boolean; toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [weeklySlots, setWeeklySlots] = useState<any>({
    today: {
      totalCount: 0,
      morning: [],
      afternoon: [],
      occupied: [], // Agrega esta línea
    },
    days: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Manejar cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Obtener la fecha actual formateada
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchWeeklySlots = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/appointments/available-slots');
        const data = await response.json();

        if (data.success) {
          const mappedSlots = {
            today: {
              totalCount: data.available.total + data.occupied.total,
              morning: [...data.available.morning, ...data.occupied.morning],
              afternoon: [...data.available.afternoon, ...data.occupied.afternoon],
              occupied: [...data.occupied.morning, ...data.occupied.afternoon], // Agrega esta línea
            },
            days: data.days || [], // Asegúrate de que `days` exista
          };
          setWeeklySlots(mappedSlots);
        } else {
          setError('Error al obtener los datos de la API.');
        }
      } catch (error) {
        console.error('Error fetching weekly slots:', error);
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklySlots();
  }, []);
  
  // Filtrar pacientes por búsqueda
  const filteredPatients = mockPatients.filter(patient => 
    `${patient.name} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.affiliateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber.includes(searchTerm) ||
    patient.obraSocial.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para seleccionar un paciente
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
    
    if (isMobile) {
      setTimeout(() => {
        document.getElementById('patient-details')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  if (loading) return <p>Cargando turnos...</p>;
  if (error) return <p>{error}</p>;

  const availableAppointments = weeklySlots.today.morning?.length + weeklySlots.today.afternoon?.length - weeklySlots.today.occupied?.length || 0;

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar mejorado */}
      <div className={`w-64 flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-200 hidden md:flex flex-col`}>
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-4">
            <FaUserMd className="mr-2 text-primary" />
            <span className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>Cita-Médica-Web</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center mt-6 px-4">
          <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-primary bg-opacity-10'} flex items-center justify-center mb-3`}>
            <FaUserMd className="text-3xl text-primary" />
          </div>
          <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>Dr. Alejandro López</h2>
          <p className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>Cardiólogo</p>
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-1">
          <Link 
            to="/perfil" 
            className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <FaUser className="mr-3" />
            Mi Perfil
          </Link>
          <Link 
            to="/calendario" 
            className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <FaCalendarAlt className="mr-3" />
            Calendario
          </Link>
          <Link 
            to="/pacientes" 
            className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <FaUser className="mr-3" />
            Pacientes
          </Link>
          <Link 
            to="/historial" 
            className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <FaHistory className="mr-3" />
            Historial
          </Link>
          <Link 
            to="/configuracion" 
            className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <FaCog className="mr-3" />
            Configuración
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <Link 
            to="/logout" 
            className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
          >
            <FaSignOutAlt className="mr-3" />
            Cerrar Sesión
          </Link>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header superior */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm z-10`}>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center">
              <button className={`md:hidden mr-2 p-2 rounded-md ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className={`text-xl font-semibold  ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Panel del Doctor</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`hidden sm:block text-sm ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100'} px-3 py-1 rounded-md`}>
                <FaCalendarAlt className="inline-flex mr-2 " />
                {formattedDate}
              </div>
              
              <button 
                onClick={toggleDarkMode} 
                className={`p-2 rounded-full ${darkMode ? 'text-yellow-300 hover:bg-gray-700' : 'text-gray-300 hover:bg-gray-100'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <FaEyeSlash /> : <FaEye />}
              </button>
              
              <div className="relative">
                <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <span className="sr-only">Notificaciones</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenido desplazable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
  {/* Tarjetas de estadísticas mejoradas */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {weeklySlots.today ? (
    <>
      <StatCard
        title="Citas Hoy"
        value={weeklySlots.today.totalCount || "0"}
        icon={<FaCalendarAlt size="18" className={darkMode ? "text-primary-400" : "text-primary"} />}
        color={darkMode ? "text-gray-300" : "text-gray-700"}
        darkMode={darkMode}
        trend="up"
        trendValue="+2"
      />
      <StatCard
        title="Turno Mañana"
        value={weeklySlots.today.morning?.length || "0"}
        icon={<FaClock size="18" className={darkMode ? "text-yellow-400" : "text-yellow-600"} />}
        color={darkMode ? "text-gray-300" : "text-gray-700"}
        darkMode={darkMode}
      />
      <StatCard
        title="Turno Tarde"
        value={weeklySlots.today.afternoon?.length || "0"}
        icon={<FaClock size="18" className={darkMode ? "text-orange-400" : "text-orange-600"} />}
        color={darkMode ? "text-gray-300" : "text-gray-700"}
        darkMode={darkMode}
      />
      <StatCard
        title="Citas Disponibles"
        value={availableAppointments}
        icon={<FaUser size="18" className={darkMode ? "text-green-400" : "text-green-600"} />}
        color={darkMode ? "text-gray-300" : "text-gray-700"}
        darkMode={darkMode}
        trend="up"
        trendValue="+5%"
      />
    </>
  ) : (
    <p className={`text-lg font-bold ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
      No hay datos disponibles
    </p>
  )}
</div>
          
          {/* Contenido principal en grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Sección de citas (3/4 del ancho en desktop) */}
            <div className={`lg:col-span-3 ${showPatientDetails && isMobile ? 'hidden' : 'block'}`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-5 h-full transition-colors duration-200`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-bold flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    <FaCalendarDay className="mr-2 text-primary" />
                    Citas del Día
                  </h3>
                  
                  {/* Buscador móvil */}
                  <div className="relative md:hidden">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className={`pl-9 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary text-sm w-40`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
                
                {morningAppointments.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <FaClock className={`mr-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span>Turno Mañana</span>
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {morningAppointments.length} citas
                      </span>
                    </div>
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
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <FaClock className={`mr-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span>Turno Tarde</span>
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {afternoonAppointments.length} citas
                      </span>
                    </div>
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
                    <button className={`mt-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary hover:bg-primary-600'} text-white font-medium flex items-center mx-auto`}>
                      <FaPlus className="mr-2" />
                      Agendar Cita
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar derecho (1/4 del ancho en desktop) */}
            <div className={`flex flex-col gap-6 ${!showPatientDetails && isMobile ? 'hidden' : 'block'}`}>
              {/* Botón para volver a la lista en móvil */}
              {isMobile && showPatientDetails && (
                <button 
                  className={`${darkMode ? 'bg-gray-800 text-primary-400 hover:bg-gray-700' : 'bg-white text-primary hover:bg-gray-50'} px-4 py-3 rounded-lg flex items-center justify-center lg:hidden shadow-sm transition-colors`}
                  onClick={() => setShowPatientDetails(false)}
                >
                  <FaChevronLeft className="mr-2" />
                  Volver a la lista de citas
                </button>
              )}
              
              {/* Buscador de pacientes (solo visible cuando no hay paciente seleccionado o en desktop) */}
              {(!selectedPatient || !isMobile) && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-5 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaSearch className="mr-2 text-primary" />
                    Buscar Paciente
                  </h3>
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
                  
                  <div className={`mt-4 max-h-60 overflow-y-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {searchTerm && filteredPatients.length > 0 ? (
                      filteredPatients.map(patient => (
                        <div 
                          key={patient.id} 
                          className={`p-3 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-blue-50'} cursor-pointer transition-colors`}
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <div className="font-medium text-primary">{patient.name} {patient.lastName}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {patient.obraSocial.name}: {patient.affiliateNumber}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {patient.phoneNumber} • {patient.age} años
                          </div>
                          {patient.lastVisit && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              Última visita: {new Date(patient.lastVisit).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      ))
                    ) : searchTerm ? (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaSearch className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        No se encontraron pacientes
                      </div>
                    ) : (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaUser className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        Busca pacientes por nombre, número de afiliado o teléfono
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Detalles del paciente */}
              {selectedPatient && (
                <div 
                  id="patient-details" 
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-5 transition-colors duration-200 flex-1 overflow-hidden`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <h3 className={`text-lg font-bold flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaUser className={`mr-2 text-primary ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      Detalles del Paciente
                    </h3>
                    <button 
                      className={`${darkMode ? 'text-gray-400 hover:text-gray-300 bg-transparent font-bold' : 'text-gray-700 hover:text-gray-700 bg-transparent font-bold'} rounded-full w-8 h-8 flex items-center justify-center transition-colors`}
                      onClick={() => {
                      setSelectedPatient(null);
                      setShowPatientDetails(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex flex-col items-center">
                      <div className={`w-24 h-24 ${darkMode ? 'bg-gray-700' : 'bg-primary bg-opacity-10'} rounded-full flex items-center justify-center mb-3`}>
                        <FaUser size="40" className="text-primary" />
                      </div>
                      
                      <div className="text-center">
                        <h4 className="text-xl font-bold">{selectedPatient.name} {selectedPatient.lastName}</h4>
                        <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedPatient.age} años • {selectedPatient.gender === 'male' ? 'Hombre' : selectedPatient.gender === 'female' ? 'Mujer' : 'Otro'}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 space-y-4`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <FaIdCard className="text-primary mr-2" />
                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Obra Social</span>
                          </div>
                          <p className={`pl-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedPatient.obraSocial.name}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-2">
                            <FaIdCard className="text-primary mr-2" />
                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nº Afiliado</span>
                          </div>
                          <p className={`pl-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedPatient.affiliateNumber}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-2">
                            <FaPhone className="text-primary mr-2" />
                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Teléfono</span>
                          </div>
                          <p className={`pl-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedPatient.phoneNumber}
                          </p>
                        </div>
                        
                        {selectedPatient.email && (
                          <div>
                            <div className="flex items-center mb-2">
                              <svg className="text-primary mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</span>
                            </div>
                            <p className={`text-xs break-words pl-5 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedPatient.email}
                            </p>
                          </div>
                        )}

                        {selectedPatient.additionalInfo && (
                          <div>
                            <div className="flex items-center mb-2">
                              <FaNotesMedical className="text-primary mr-2" />
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Información Adicional</span>
                            </div>
                            <p className={`pl-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedPatient.additionalInfo}
                            </p>
                          </div>
                        )}

                        {selectedPatient.lastVisit && (
                          <div>
                            <div className="flex items-center mb-2">
                              <FaHistory className="text-primary mr-2" />
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Última Visita</span>
                            </div>
                            <p className={`pl-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {new Date(selectedPatient.lastVisit).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        )}
                      </div>

                      <button className={`mt-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary hover:bg-primary-600'} text-white font-medium flex items-center mx-auto`}>
                        <FaPlus className="mr-2" />
                        Agregar Nota
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h1
              className={`text-lg font-bold flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
            >Turnos Semanales</h1>
            {weeklySlots && (
              <div>
                {weeklySlots.days.map((day: any) => (
                  <div key={day.date}>
                    <h2
                     className={`text-lg font-bold flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                    >{day.displayDate}</h2>
                    <p
                     className={`text-lg font-bold flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                    >Disponibles: {day.availableCount}</p>
                    <p
                     className={`text-lg font-bold flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                      >Ocupados: {day.occupiedCount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;