import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DetailedCalendar from './components/DetailedCalendar';
// Eliminar esta línea
// import './styles/dashboard.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario-detallado" element={<DetailedCalendar />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 