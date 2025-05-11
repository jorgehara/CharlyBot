import { FC, useState, useEffect } from 'react';
import { 
  FaHome, FaCog, FaUser, FaEye, FaEyeSlash,
  FaChevronLeft, FaHistory, FaUserMd, FaCalendarDay,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import { FaUserDoctor } from "react-icons/fa6";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

import AvailableSlots from './AvailableSlots';
import type { MongoAppointment } from '../types/mongo';
import type { TimeSlot } from '../types/google';



const Dashboard: FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  const { appointments, loading, error } = useMongoAppointments();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [currentView, setCurrentView] = useState<'calendar' | 'slots'>('calendar');

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
          {/* Logo y título */}
          <div className="flex flex-col items-center justify-center h-32 px-4 space-y-3">
            <div className={`text-4xl transform transition-all duration-300 hover:scale-110 ${darkMode ? 'text-primary-light' : 'text-primary'}`}>
              <FaUserDoctor />
            </div>
            <h1 className={`text-xl font-semibold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Cita Médica
            </h1>
          </div>
          
          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-4 space-y-2">
              <NavItem 
                icon={<FaHome />} 
                text="Inicio" 
                active={currentView === 'calendar'} 
                onClick={() => setCurrentView('calendar')}
              />
              <NavItem 
                icon={<FaClock />} 
                text="Horarios" 
                active={currentView === 'slots'} 
                onClick={() => setCurrentView('slots')}
              />
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
              Dr. Daniel Kulinka
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
          
          {currentView === 'calendar' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard 
                  title="Citas Hoy"
                  value={loading ? '...' : appointments.length}
                  icon={<FaCalendarAlt />}
                  trend="up"
                  trendValue="+2"
                />
              </div>

              {/* Appointments Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2`}>
                  <div className={`rounded-lg shadow-sm transition-colors duration-200
                    ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                    <div className={`p-4 border-b transition-colors duration-200
                      ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Citas del Día
                      </h3>
                    </div>
                    <div className="p-4">
                      {loading ? (
                        <div className="flex justify-center items-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3">Cargando citas...</span>
                        </div>
                      ) : error ? (
                        <div className="text-red-500 text-center p-8">
                          {error}
                        </div>
                      ) : appointments.length === 0 ? (
                        <div className="text-gray-500 text-center p-8">
                          No hay citas programadas para hoy
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {appointments.map((appointment) => (
                            <div 
                              key={appointment._id}
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
                                      {appointment.patient.name}
                                    </h4>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {appointment.time} - {appointment.duration} min
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                  ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <AvailableSlots />
          )}
        </main>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: FC<NavItemProps> = ({ icon, text, active, onClick }) => {
  const { darkMode } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200
        ${active 
          ? (darkMode ? 'bg-primary-dark text-white' : 'bg-primary text-white')
          : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}`}
    >
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

export default Dashboard;
