import { FC } from 'react';
import { FaBell, FaEnvelope, FaSearch, FaUser, FaBars } from 'react-icons/fa';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-md py-2 px-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          className="lg:hidden mr-3 text-gray-600 hover:text-gray-900"
          onClick={toggleSidebar}
        >
          <FaBars size="20" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Dashboard Médico</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-8 pr-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <FaSearch className="absolute left-3 top-2 text-gray-400" />
        </div>
        
        <div className="flex space-x-2">
          <button className="relative p-1 text-gray-600 hover:text-primary">
            <FaBell size="18" />
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            </span>
          </button>
          
          <button className="relative p-1 text-gray-600 hover:text-primary">
            <FaEnvelope size="18" />
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            </span>
          </button>
          
          <div className="border-l border-gray-300 h-6 mx-1"></div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <FaUser className="text-gray-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm hidden md:inline">Dr. Usuario</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 