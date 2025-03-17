import { FC, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import { FaBars } from 'react-icons/fa';

const App: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar para móvil (overlay) */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-20 transition-opacity duration-200 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>
      
      {/* Sidebar */}
      <div className={`fixed lg:static lg:flex-shrink-0 h-full z-30 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'left-0' : '-left-64 lg:left-0'
      }`}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col w-full overflow-hidden lg:ml-16">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Dashboard />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;
