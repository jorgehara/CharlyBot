import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DetailedCalendar from './components/DetailedCalendar';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario-detallado" element={<DetailedCalendar />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;