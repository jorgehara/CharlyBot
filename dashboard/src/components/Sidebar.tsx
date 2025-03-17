import { FC } from 'react';
import { FaHome, FaChartBar, FaUsers, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  closeSidebar: () => void;
}

interface SidebarIconProps {
  icon: React.ReactNode;
  text?: string;
  onClick?: () => void;
}

const SidebarIcon: FC<SidebarIconProps> = ({ icon, text = 'tooltip', onClick }) => (
  <div className="sidebar-icon group" onClick={onClick}>
    {icon}
    <span className="sidebar-tooltip group-hover:scale-100">
      {text}
    </span>
  </div>
);

const Sidebar: FC<SidebarProps> = ({ closeSidebar }) => {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white shadow-lg w-64 lg:w-16">
      {/* Cabecera del sidebar en móvil */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <h2 className="text-xl font-bold">Menú</h2>
        <button 
          className="text-white hover:text-gray-300"
          onClick={closeSidebar}
        >
          <FaTimes size="20" />
        </button>
      </div>
      
      {/* Iconos en desktop / Lista en móvil */}
      <div className="hidden lg:flex flex-col items-center py-4 flex-1">
        <SidebarIcon icon={<FaHome size="28" />} text="Inicio" />
        <SidebarIcon icon={<FaChartBar size="28" />} text="Estadísticas" />
        <SidebarIcon icon={<FaUsers size="28" />} text="Pacientes" />
        <SidebarIcon icon={<FaCog size="28" />} text="Configuración" />
        <div className="mt-auto">
          <SidebarIcon icon={<FaSignOutAlt size="28" />} text="Cerrar sesión" />
        </div>
      </div>
      
      {/* Versión móvil con texto */}
      <div className="lg:hidden flex flex-col py-4 flex-1">
        <NavItem icon={<FaHome size="20" />} text="Inicio" onClick={closeSidebar} />
        <NavItem icon={<FaChartBar size="20" />} text="Estadísticas" onClick={closeSidebar} />
        <NavItem icon={<FaUsers size="20" />} text="Pacientes" onClick={closeSidebar} />
        <NavItem icon={<FaCog size="20" />} text="Configuración" onClick={closeSidebar} />
        <div className="mt-auto">
          <NavItem icon={<FaSignOutAlt size="20" />} text="Cerrar sesión" onClick={closeSidebar} />
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

const NavItem: FC<NavItemProps> = ({ icon, text, onClick }) => (
  <div 
    className="flex items-center px-6 py-3 text-gray-100 hover:bg-gray-800 cursor-pointer"
    onClick={onClick}
  >
    <div className="mr-3">{icon}</div>
    <span>{text}</span>
  </div>
);

export default Sidebar; 