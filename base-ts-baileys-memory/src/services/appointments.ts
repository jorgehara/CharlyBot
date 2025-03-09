import 'dotenv/config';

const BOT_NAME = process.env.BOT_NAME;
const BOT_NUMBER = process.env.BOT_NUMBER;
const BOT_PASSWORD = process.env.BOT_PASSWORD;  

interface TimeSlot {
    id: number;
    time: string;
    available: boolean;
}

export class AppointmentsService {
    private START_HOUR = 9; // Hora de inicio de atención
    private END_HOUR = 20;  // Definimos hasta las 20:00
    private SLOT_DURATION = 30; // Duración de cada turno en minutos

    async getAvailableTimeSlots(inputDate?: string) {
        // Si no se proporciona fecha, usar la fecha actual
        const date = inputDate ? new Date(inputDate) : new Date();
        const now = new Date();
        
        // Validar que la fecha no sea anterior a hoy
        if (date < new Date(now.setHours(0,0,0,0))) {
            throw new Error('La fecha no puede ser anterior a hoy');
        }

        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const isToday = date.toDateString() === now.toDateString();

        const slots = [];
        let id = 1;

        for (let hour = this.START_HOUR; hour <= this.END_HOUR; hour++) {
            for (const minutes of [0, 30]) {
                // Solo filtrar por hora actual si es hoy
                if (isToday && (hour < currentHour || (hour === currentHour && minutes <= currentMinutes))) {
                    continue;
                }

                const time = new Date(date);
                time.setHours(hour, minutes, 0, 0);
                
                slots.push({
                    id,
                    time: time.toISOString(),
                    displayTime: time.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    displayDate: time.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                });
                id++;
            }
        }

        return slots;
    }
}