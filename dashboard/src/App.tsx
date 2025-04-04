import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DetailedCalendar from './components/DetailedCalendar';
import { useTheme } from './context/ThemeContext';
import React, { useState } from 'react';
// Eliminar esta línea
// import './styles/dashboard.css';

const App: React.FC = () => {
  const { darkMode, setDarkMode } = useTheme();
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  // Función para alternar el modo oscuro
  const toggleDarkMode = () => {
    setLocalDarkMode(prevMode => !prevMode);
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <div className={localDarkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<Dashboard darkMode={localDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/calendario-detallado" element={<DetailedCalendar />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 