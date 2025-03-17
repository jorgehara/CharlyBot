import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="bg-white shadow-md py-2 px-4 text-center text-gray-600 text-sm">
      <p>© {new Date().getFullYear()} Dashboard Médico. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer; 