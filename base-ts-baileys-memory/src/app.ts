import 'dotenv/config';
import { createBot, createProvider, createFlow, addKeyword, EVENTS, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';

import { AppointmentsService } from './services/appointments';
import { GoogleSheetsService } from './services/google/sheets';
import { GoogleCalendarService } from './services/google/calendar';

// Inicializar servicios de Google
const sheetsService = new GoogleSheetsService();
const calendarService = new GoogleCalendarService();
const appointmentService = new AppointmentsService();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_RANGE = process.env.SHEET_RANGE;
const CALENDAR_ID = process.env.CALENDAR_ID;

/**
 * Flujo de bienvenida
 */
const welcomeFlow = addKeyword<BaileysProvider, MemoryDB>(['hola', 'ole', 'alo'])
    .addAnswer(
`🏥 Bienvenido al Consultorio del Dr. Kulinka 🏥
¿En qué puedo ayudarte hoy? 😊`)
    .addAnswer([
`1️⃣ Agendar                → Para solicitar un turno.
2️⃣ Registrar/consulta → Para obtener información sobre nuestros servicios.
3️⃣ Cancelar                → Para cancelar una cita ya agendada.`].join('\n')
    );

/**
 * Flujo para registrar en Google Sheets
 */
const registrarConsultasFlow = addKeyword('2')
    .addAnswer('📝 ¿Cuál es tu nombre?', { capture: true }, async (ctx, { state }) => {
        await state.update({ name: ctx.body });
    })
    .addAnswer('📧 ¿Cuál es tu email?', { capture: true }, async (ctx, { state, flowDynamic }) => {
        const userData = {
            name: state.get('name'),
            email: ctx.body,
            timestamp: new Date().toISOString()
        };

        try {
            await sheetsService.appendRow(
                SPREADSHEET_ID!,
                SHEET_RANGE!,
                [userData.name, userData.email, userData.timestamp]
            );
            await flowDynamic('✅ ¡Registro exitoso! Tus datos han sido guardados.');
        } catch (error) {
            console.error('Error en registro:', error);
            await flowDynamic('❌ Hubo un error al guardar tus datos. Por favor, intenta más tarde.');
        }
    });

/**
 * Flujo para agendar en Google Calendar
 */
const agendarFlow = addKeyword('1')
    .addAnswer('📅 ¿Cuál es tu nombre completo?', { capture: true }, async (ctx, { state }) => {
        await state.update({ clientName: ctx.body });
    })
    .addAnswer(
        [
            '📅 ¿Para qué fecha quieres agendar?',
            'Escribe la fecha en formato YYYY-MM-DD',
            'O presiona ENTER para ver los horarios disponibles de hoy'
        ].join('\n'),
        { capture: true }, 
        async (ctx, { state, flowDynamic }) => {
            try {
                const inputDate = ctx.body.trim() === '' ? undefined : ctx.body;
                const selectedDate = inputDate ? new Date(inputDate) : new Date();
                
                // Obtener eventos existentes
                const existingEvents = await calendarService.listEvents(CALENDAR_ID!, selectedDate);
                
                // Obtener slots disponibles considerando los eventos existentes
                const availableSlots = await appointmentService.getAvailableTimeSlots(
                    inputDate,
                    existingEvents
                );

                if (availableSlots.length === 0) {
                    await flowDynamic('❌ Lo siento, no hay horarios disponibles para esa fecha.');
                    return;
                }

                // Agrupar slots por período (mañana/tarde)
                const morningSlots = availableSlots.filter(slot => slot.period === 'mañana');
                const afternoonSlots = availableSlots.filter(slot => slot.period === 'tarde');

                // Crear mensaje con los horarios agrupados
                let message = `🕒 Horarios disponibles para el ${availableSlots[0].displayDate}:\n\n`;
                
                if (morningSlots.length > 0) {
                    message += `*TURNO MAÑANA (8:30 a 12:00)*\n`;
                    message += morningSlots
                        .map(slot => `${slot.id}. ${slot.displayTime}`)
                        .join('\n');
                    message += '\n\n';
                }
                
                if (afternoonSlots.length > 0) {
                    message += `*TURNO TARDE (16:00 a 20:00)*\n`;
                    message += afternoonSlots
                        .map(slot => `${slot.id}. ${slot.displayTime}`)
                        .join('\n');
                }
                
                message += '\n\n¿Qué horario prefieres? (escribe el número)';

                await state.update({ availableSlots });
                await flowDynamic(message);
            } catch (error) {
                console.error('Error al obtener horarios:', error);
                await flowDynamic('❌ Fecha inválida. Por favor, usa el formato YYYY-MM-DD o presiona ENTER para hoy');
            }
        }
    )
    .addAnswer(
        '🔢 Selecciona el número del horario',
        { capture: true },
        async (ctx, { state, flowDynamic }) => {
            try {
                const slotId = parseInt(ctx.body);
                const availableSlots = state.get('availableSlots');
                const selectedSlot = availableSlots.find(slot => slot.id === slotId);

                if (!selectedSlot) {
                    await flowDynamic('❌ Horario inválido. Por favor, selecciona un número válido.');
                    return;
                }

                // Usamos directamente la fecha ISO guardada
                const startTime = new Date(selectedSlot.time);
                const endTime = new Date(startTime.getTime() + 30 * 60000);

                const event = await calendarService.createEvent(CALENDAR_ID!, {
                    summary: `Cita - ${state.get('clientName')}`,
                    description: `Cita agendada por: ${state.get('clientName')}\nTeléfono: ${ctx.from}`,
                    start: { 
                        dateTime: startTime.toISOString(),
                        timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                    },
                    end: { 
                        dateTime: endTime.toISOString(),
                        timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                    }
                });

                // Al mostrar el mensaje usamos displayTime
                await flowDynamic([
                    '✅ ¡Cita agendada exitosamente!',
                    `👤 Cliente: ${state.get('clientName')}`,
                    `📅 Fecha y hora: ${selectedSlot.displayTime}`,
                    '¡Te esperamos!'
                ].join('\n'));

            } catch (error) {
                console.error('Error al agendar:', error);
                await flowDynamic('❌ Hubo un error al agendar la cita. Por favor, intenta nuevamente.');
            }
        }
    );

/**
 * Flujo de cancelación
 */
const cancelacionFlow = addKeyword('3')
    .addAnswer([
        `aqui debo traer los turnos para avisar la cancelacion o el cambio de fecha`,
        `tambien debo avisar cuando se confirma el turno`,
        `tambien debo avisar cuando se cancela el turno`
    ].join('\n'));

/**
 * Configuración del servidor HTTP con endpoints
 */
const setupServer = (adapterProvider: any, handleCtx: any) => {
    const server = adapterProvider.server;

    // Endpoint de prueba simple
    server.get('/api/ping', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
    });

    // Endpoint para probar JSON
    server.get('/api/json-test', (req, res) => {
        const data = {
            message: 'Esto es una respuesta JSON',
            timestamp: new Date().toISOString(),
            success: true
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });

    // Endpoint para probar parámetros
    server.get('/api/echo', (req, res) => {
        const data = {
            params: req.query,
            success: true
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });

    // Endpoint para probar POST
    server.post('/api/echo-post', (req, res) => {
        const data = {
            body: req.body,
            success: true
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });

    // Endpoint para obtener slots simplificado
    server.get('/api/slots', (req, res) => {
        try {
            // Generar slots de ejemplo para hoy
            const today = new Date();
            const slots = [];
            
            for (let hour = 9; hour <= 17; hour++) {
                for (const minutes of [0, 30]) {
                    const time = new Date(today);
                    time.setHours(hour, minutes, 0, 0);
                    
                    // Solo incluir horas futuras
                    if (time > new Date()) {
                        slots.push({
                            id: slots.length + 1,
                            time: time.toISOString(),
                            displayTime: `${hour}:${minutes === 0 ? '00' : '30'}`,
                            available: true
                        });
                    }
                }
            }
            
            const responseData = {
                success: true,
                message: 'Slots generados correctamente',
                date: today.toISOString().split('T')[0],
                slots: slots
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseData));
        } catch (error) {
            console.error('Error:', error);
            const errorResponse = {
                success: false,
                message: 'Error interno del servidor'
            };
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    });

    // Endpoint para crear eventos en el calendario
    server.post('/api/calendar/events', async (req, res) => {
        try {
            const { clientName, date, time, phone } = req.body;

            if (!clientName || !date || !time) {
                const errorResponse = {
                    success: false,
                    message: 'Faltan datos requeridos'
                };
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(errorResponse));
            }

            // Crear fecha del evento
            const startTime = new Date(`${date}T${time}`);
            const endTime = new Date(startTime.getTime() + 30 * 60000);

            const event = await calendarService.createEvent(CALENDAR_ID!, {
                summary: `Cita - ${clientName}`,
                description: `Cita agendada por: ${clientName}\nTeléfono: ${phone}`,
                start: { 
                    dateTime: startTime.toISOString(),
                    timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                },
                end: { 
                    dateTime: endTime.toISOString(),
                    timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                }
            });

            const successResponse = {
                success: true,
                message: 'Evento creado exitosamente',
                event: event
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(successResponse));
        } catch (error: any) {
            console.error('Error al crear evento:', error);
            
            const errorResponse = {
                success: false,
                message: 'Error al crear el evento',
                error: error.message
            };
            
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(errorResponse));
        }
    });

    // Endpoint para obtener horarios disponibles
    server.get('/api/calendar/available-slots', async (req, res) => {
        try {
            const { date } = req.query;
            console.log(`Solicitud de horarios para fecha: ${date || 'hoy'}`);
            
            // Validar formato de fecha si se proporciona
            if (date && typeof date === 'string' && date.trim() !== '') {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(date)) {
                    const errorResponse = {
                        success: false,
                        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    };
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify(errorResponse));
                }
            }
            
            // Obtener eventos existentes del calendario para verificar disponibilidad
            let selectedDate;
            if (date) {
                // Crear la fecha a partir del string YYYY-MM-DD
                const [year, month, day] = (date as string).split('-').map(Number);
                selectedDate = new Date(year, month - 1, day); // Mes es 0-indexado en JavaScript
                
                // Asegurarse de que la fecha sea correcta (sin ajustes de zona horaria)
                selectedDate.setHours(0, 0, 0, 0);
                console.log(`Fecha seleccionada parseada: ${selectedDate.toISOString()}`);
            } else {
                selectedDate = new Date();
            }
            
            const existingEvents = await calendarService.listEvents(CALENDAR_ID!, selectedDate);
            console.log(`Eventos existentes: ${existingEvents.length}`);
            
            // Obtener slots disponibles considerando los eventos existentes
            const availableSlots = await appointmentService.getAvailableTimeSlots(
                date as string,
                existingEvents
            );

            // Agrupar slots por período
            const morningSlots = availableSlots.filter(slot => slot.period === 'mañana');
            const afternoonSlots = availableSlots.filter(slot => slot.period === 'tarde');
            
            console.log(`Slots mañana: ${morningSlots.length}, Slots tarde: ${afternoonSlots.length}`);

            const responseData = {
                success: true,
                date: date || 'hoy',
                displayDate: availableSlots.length > 0 ? availableSlots[0].displayDate : new Date().toLocaleDateString('es-ES'),
                slots: {
                    morning: morningSlots,
                    afternoon: afternoonSlots
                },
                allSlots: availableSlots
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(responseData));
        } catch (error: any) {
            console.error('Error al obtener horarios:', error);
            
            const errorResponse = {
                success: false,
                message: error.message || 'Error al obtener horarios disponibles'
            };
            
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(errorResponse));
        }
    });

    // Endpoint para mensajes de WhatsApp
    server.post('/v1/messages', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body
        await bot.sendMessage(number, message, {})
        return res.end('send')
    }));

    return server;
};

/**
 * Función principal
 */
const main = async () => {
    try {
        const adapterFlow = createFlow([
            welcomeFlow,
            registrarConsultasFlow,
            agendarFlow,
            cancelacionFlow,
        ]);

        const adapterDB = new MemoryDB()
        const adapterProvider = createProvider(BaileysProvider, {
            qrMobileColumns: 2,
            showQrInTerminal: true,
            showBrowserLogs: false
        })
    
        const { handleCtx, httpServer } = await createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        })
    
        // Configurar servidor con endpoints
        const server = setupServer(adapterProvider, handleCtx);
        server.listen(3000, () => {
            console.log('Servidor escuchando en puerto 3000');
        });

        // Manejador de eventos de conexión
        adapterProvider.on('connection.update', (update) => {
            const { connection } = update
            if(connection === 'open') {
                console.log('¡Conexión establecida!')
            }
        });

    } catch (error) {
        console.error('Error al iniciar el bot:', error);
        throw error;
    }
};

main();

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Promesa rechazada no manejada:', error);
});