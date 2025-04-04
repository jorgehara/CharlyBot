import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definimos el contexto del tema
const ThemeContext = createContext<{ darkMode: boolean; toggleDarkMode: () => void } | undefined>(undefined);

// Proveedor del contexto
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 