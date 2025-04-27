import { FC } from 'react';
import { FaBell, FaEnvelope, FaSearch, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Header: FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md py-2 px-4 flex justify-between items-center sticky top-0 z-10 transition-colors duration-200`}>
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Dashboard Médico</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar..."
            className={`pl-8 pr-4 py-1 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors duration-200`}
          />
          <FaSearch className={`absolute left-3 top-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'} transition-colors duration-200`}
            onClick={toggleDarkMode}
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? <FaEyeSlash size="18" /> : <FaEye size="18" />}
          </button>
          
          <button className={`relative p-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <FaBell size="18" />
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"></span>
          </button>
          
          <button className={`relative p-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <FaEnvelope size="18" />
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"></span>
          </button>
          
          <div className={`border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'} h-6 mx-1`}></div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center`}>
              <FaUser className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </div>
            <span className={`font-medium text-sm hidden md:inline ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dr. Usuario</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 