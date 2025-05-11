import GoogleCalendarService from '../services/google/calendar';

async function testCalendar() {
  try {
    console.log('Iniciando prueba del calendario...');
    const calendarService = new GoogleCalendarService();
    
    // Usa el ID de tu calendario
    const calendarId = 'primary'; // o tu ID específico del calendario
    
    console.log('Buscando eventos...');
    const eventos = await calendarService.getAvailableSlots(calendarId);
    
    console.log('Eventos encontrados:', eventos.length);
    console.log(JSON.stringify(eventos, null, 2));
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

testCalendar();