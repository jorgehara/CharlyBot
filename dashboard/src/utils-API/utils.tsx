import axios from 'axios';

export const getWeeklySlots = async (startDate: string) => {
  try {
    const response = await axios.get('http://localhost:3001/api/appointments/weekly-slots', {
      params: { startDate },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los turnos semanales:', error);
    throw error;
  }
};