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
    period: 'mañana' | 'tarde'; // Añadimos el período para mostrar
}

export class AppointmentsService {
    // Definimos los horarios de mañana y tarde
    private MORNING_START = 8.5; // 8:30 AM
    private MORNING_END = 12;    // 12:00 PM
    private AFTERNOON_START = 16; // 16:00 PM
    private AFTERNOON_END = 20;   // 20:00 PM
    private SLOT_DURATION = 30;   // Duración de cada turno en minutos

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

    // Método para formatear la hora en formato legible
    private formatTime(hour: number): string {
        const fullHour = Math.floor(hour);
        const minutes = (hour - fullHour) * 60;
        return `${fullHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Método para generar slots para un rango de horas
    private generateSlotsForRange(
        date: Date, 
        startHour: number, 
        endHour: number, 
        events: any[], 
        isToday: boolean,
        currentHour: number,
        currentMinutes: number,
        period: 'mañana' | 'tarde',
        startId: number
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        let id = startId;

        // Crear una copia de la fecha para no modificar la original
        const slotDate = new Date(date);
        
        // Asegurarse de que estamos trabajando con la fecha correcta
        console.log(`Generando slots para ${period} - Fecha: ${slotDate.toISOString()}`);

        for (let hour = startHour; hour < endHour; hour += 0.5) {
            // Convertir hora decimal a horas y minutos
            const fullHour = Math.floor(hour);
            const minutes = (hour - fullHour) * 60;
            
            // Solo filtrar por hora actual si es hoy
            if (isToday && (fullHour < currentHour || (fullHour === currentHour && minutes <= currentMinutes))) {
                console.log(`Saltando slot ${fullHour}:${minutes} por ser anterior a la hora actual`);
                continue;
            }

            // Crear una nueva fecha para cada slot para evitar problemas de referencia
            const time = new Date(slotDate);
            time.setHours(fullHour, minutes, 0, 0);
            
            const isOccupied = this.isSlotOccupied(time, events);
            
            // Mostrar información de depuración
            console.log(`Slot ${period} - ${fullHour}:${minutes} - ISO: ${time.toISOString()} - Ocupado: ${isOccupied}`);
            
            slots.push({
                id,
                time: time.toISOString(),
                displayTime: this.formatTime(hour),
                displayDate: time.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                available: !isOccupied,
                period
            });
            id++;
        }

        console.log(`Total de slots generados para ${period}: ${slots.length}`);
        return slots;
    }

    // Método para obtener slots de hoy
    async getAvailableSlotsForToday(events: any[] = []) {
        const now = new Date();
        console.log(`Fecha actual: ${now.toISOString()}`);
        
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        console.log(`Hora actual: ${currentHour}:${currentMinutes}`);
        
        // Generar slots para la mañana
        const morningSlots = this.generateSlotsForRange(
            now, 
            this.MORNING_START, 
            this.MORNING_END, 
            events, 
            true,
            currentHour,
            currentMinutes,
            'mañana',
            1
        );
        
        // Generar slots para la tarde
        const afternoonSlots = this.generateSlotsForRange(
            now, 
            this.AFTERNOON_START, 
            this.AFTERNOON_END, 
            events, 
            true,
            currentHour,
            currentMinutes,
            'tarde',
            morningSlots.length + 1
        );
        
        // Combinar todos los slots
        const allSlots = [...morningSlots, ...afternoonSlots];
        console.log(`Total de slots generados: ${allSlots.length}`);
        
        // Filtrar solo disponibles
        const availableSlots = allSlots.filter(slot => slot.available);
        console.log(`Total de slots disponibles: ${availableSlots.length}`);
        
        return availableSlots;
    }

    // Método principal para obtener slots disponibles
    async getAvailableTimeSlots(inputDate?: string, events: any[] = []) {
        try {
            // Si no se proporciona fecha, usar la fecha actual
            if (!inputDate || inputDate.trim() === '') {
                return this.getAvailableSlotsForToday(events);
            }
            
            // Parsear la fecha de entrada correctamente
            let date: Date;
            
            if (inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Si es formato YYYY-MM-DD, parsearlo correctamente
                const [year, month, day] = inputDate.split('-').map(Number);
                date = new Date(year, month - 1, day); // Mes es 0-indexado en JavaScript
            } else {
                date = new Date(inputDate);
            }
            
            console.log(`Fecha solicitada: ${inputDate} -> Parseada como: ${date.toISOString()}`);
            
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                console.error('Fecha inválida:', inputDate);
                throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
            }
            
            const now = new Date();
            // Establecer today a las 00:00:00 para comparación correcta
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Establecer la fecha a las 00:00:00 para comparación correcta
            const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            console.log(`Comparando fechas - Hoy: ${today.toISOString()} - Solicitada: ${dateToCheck.toISOString()}`);
            
            // Permitir fechas futuras, pero no anteriores a hoy
            if (dateToCheck < today) {
                console.error('Fecha anterior a hoy:', dateToCheck, 'hoy:', today);
                throw new Error('La fecha no puede ser anterior a hoy');
            }

            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            
            // Verificar si la fecha solicitada es hoy o una fecha futura
            const isToday = dateToCheck.getTime() === today.getTime();
            
            console.log(`Es hoy: ${isToday} - Hora actual: ${currentHour}:${currentMinutes}`);

            // Para fechas futuras, no filtrar por hora actual
            const effectiveHour = isToday ? currentHour : 0;
            const effectiveMinutes = isToday ? currentMinutes : 0;

            // Generar slots para la mañana
            const morningSlots = this.generateSlotsForRange(
                date, 
                this.MORNING_START, 
                this.MORNING_END, 
                events, 
                isToday,  // Solo aplicar filtro de hora si es hoy
                effectiveHour,
                effectiveMinutes,
                'mañana',
                1
            );
            
            // Generar slots para la tarde
            const afternoonSlots = this.generateSlotsForRange(
                date, 
                this.AFTERNOON_START, 
                this.AFTERNOON_END, 
                events, 
                isToday,  // Solo aplicar filtro de hora si es hoy
                effectiveHour,
                effectiveMinutes,
                'tarde',
                morningSlots.length + 1
            );
            
            // Combinar todos los slots
            const allSlots = [...morningSlots, ...afternoonSlots];
            
            // Filtrar solo disponibles
            const availableSlots = allSlots.filter(slot => slot.available);
            
            console.log(`Slots de mañana: ${morningSlots.length}, Slots de tarde: ${afternoonSlots.length}`);
            console.log(`Total disponibles: ${availableSlots.length}`);
            
            return availableSlots;
        } catch (error) {
            console.error('Error en getAvailableTimeSlots:', error);
            throw error;
        }
    }
}