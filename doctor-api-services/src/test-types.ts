import { SlotsResponse } from './types/appointment';

// Ejemplo de estructura de datos correcta
const exampleResponse: SlotsResponse = {
  date: '2023-03-15',
  displayDate: 'miércoles, 15 de marzo de 2023',
  available: {
    morning: [],
    afternoon: [],
    total: 0
  },
  occupied: {
    morning: [],
    afternoon: [],
    total: 0
  },
  allSlots: []
};

console.log('Estructura de datos correcta:', exampleResponse); 