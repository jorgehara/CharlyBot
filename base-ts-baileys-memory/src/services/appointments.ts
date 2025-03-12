import 'dotenv/config';

const BOT_NAME = process.env.BOT_NAME;
const BOT_NUMBER = process.env.BOT_NUMBER;
const BOT_PASSWORD = process.env.BOT_PASSWORD;  

interface TimeSlot {
    id: number;
    time: string;
    available: boolean;
    displayTime: string;
    displayDate: string;
}

export class AppointmentsService {
    private START_HOUR = 8;  // 8 AM
    private END_HOUR = 12;   // 12 PM
    private SLOT_DURATION = 30; // Duración de cada turno en minutos

    // Método para verificar si un slot está ocupado por algún evento existente
    private isSlotOccupied(slotTime: Date, events: any[]): boolean {
        if (!events || events.length === 0) return false;
        
        const slotStart = slotTime.getTime();
        const slotEnd = new Date(slotStart + this.SLOT_DURATION * 60000).getTime();
        
        return events.some(event => {
            if (!event.start || !event.start.dateTime) return false;
            
            const eventStart = new Date(event.start.dateTime).getTime();
            const eventEnd = new Date(event.end.dateTime).getTime();
            
            // Verificar si hay solapamiento
            return (
                (slotStart >= eventStart && slotStart < eventEnd) || // El inicio del slot está dentro del evento
                (slotEnd > eventStart && slotEnd <= eventEnd) || // El fin del slot está dentro del evento
                (slotStart <= eventStart && slotEnd >= eventEnd) // El slot contiene completamente al evento
            );
        });
    }

    // Método simplificado para obtener slots de hoy
    async getAvailableSlotsForToday(events: any[] = []) {
        const now = new Date();
        const slots = [];
        let id = 1;

        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        for (let hour = this.START_HOUR; hour <= this.END_HOUR; hour++) {
            for (const minutes of [0, 30]) {
                // Solo incluir horas futuras
                if (hour > currentHour || (hour === currentHour && minutes > currentMinutes)) {
                    const time = new Date();
                    time.setHours(hour, minutes, 0, 0);
                    
                    const isOccupied = this.isSlotOccupied(time, events);
                    
                    slots.push({
                        id,
                        time: time.toISOString(),
                        displayTime: `${hour}:${minutes === 0 ? '00' : '30'}`,
                        displayDate: time.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        }),
                        available: !isOccupied
                    });
                    id++;
                }
            }
        }

        // Filtrar solo slots disponibles
        return slots.filter(slot => slot.available);
    }

    // Método principal para obtener slots disponibles
    async getAvailableTimeSlots(inputDate?: string, events: any[] = []) {
        try {
            // Si no se proporciona fecha, usar la fecha actual
            if (!inputDate || inputDate.trim() === '') {
                return this.getAvailableSlotsForToday(events);
            }
            
            const date = new Date(inputDate);
            
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                console.error('Fecha inválida:', inputDate);
                throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
            }
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Establecer la fecha a las 00:00:00 para comparación correcta
            const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            // Permitir fechas futuras, pero no anteriores a hoy
            if (dateToCheck < today) {
                console.error('Fecha anterior a hoy:', dateToCheck, 'hoy:', today);
                throw new Error('La fecha no puede ser anterior a hoy');
            }

            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            const isToday = dateToCheck.getTime() === today.getTime();

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
                    
                    const isOccupied = this.isSlotOccupied(time, events);
                    
                    slots.push({
                        id,
                        time: time.toISOString(),
                        displayTime: `${hour}:${minutes === 0 ? '00' : '30'}`,
                        displayDate: time.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        available: !isOccupied
                    });
                    id++;
                }
            }

            // Filtrar solo slots disponibles
            return slots.filter(slot => slot.available);
        } catch (error) {
            console.error('Error en getAvailableTimeSlots:', error);
            throw error;
        }
    }
}