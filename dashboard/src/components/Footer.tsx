import { FC } from 'react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} shadow-md py-2 px-4 text-center text-sm transition-colors duration-200`}>
      <p>© {new Date().getFullYear()} Dashboard Médico. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer; 