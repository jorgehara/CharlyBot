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

/**
 * Flujo de bienvenida
 */
const welcomeFlow = addKeyword<BaileysProvider, MemoryDB>(['hola', 'ole', 'alo'])
    .addAnswer(
`🏥 Bienvenido al Consultorio del Dr. Kulinka 🏥
¿En qué puedo ayudarte hoy? 😊`)
    .addAnswer(
        [
        `1️⃣ Agendar   → Para solicitar un turno.`,
        `2️⃣ Consultar → Para obtener información sobre nuestros servicios.`,
        `3️⃣ Cancelar  → Para cancelar una cita ya agendada.`
        ].join('\n')
    );

/**
 * Flujo para registrar en Google Sheets
 */
const sheetFlow = addKeyword('registrar')
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
                SPREADSHEET_ID,
                SHEET_RANGE,
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
// Constantes para Google Calendar
const CALENDAR_ID = process.env.CALENDAR_ID;

const calendarFlow = addKeyword('agendar')
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
                const availableSlots = await appointmentService.getAvailableTimeSlots(
                    ctx.body.trim() === '' ? undefined : ctx.body
                );

                if (availableSlots.length === 0) {
                    await flowDynamic('❌ Lo siento, no hay horarios disponibles para esa fecha.');
                    return;
                }

                const message = [
                    `🕒 Horarios disponibles para el ${availableSlots[0].displayDate}:`,
                    '',
                    availableSlots
                        .map(slot => `${slot.id}. ${slot.displayTime}`)
                        .join('\n'),
                    '',
                    '¿Qué horario prefieres? (escribe el número)'
                ].join('\n');

                await state.update({ availableSlots });
                await flowDynamic(message);
            } catch (error) {
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

                const event = await calendarService.createEvent(process.env.CALENDAR_ID!, {
                    summary: `Cita - ${state.get('clientName')}`,
                    description: `Cita agendada por: ${state.get('clientName')}\nTeléfono: ${ctx.from}`,
                    start: { 
                        dateTime: startTime.toISOString(),
                        timeZone: process.env.TIMEZONE
                    },
                    end: { 
                        dateTime: endTime.toISOString(),
                        timeZone: process.env.TIMEZONE
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
 * Flujo de ayuda
 */
const helpFlow = addKeyword('ayuda')
    .addAnswer([
        '🤖 *Comandos disponibles:*',
        '',
        '📝 *registrar* - Guarda tu información en nuestra base de datos',
        '📅 *agendar* - Programa un nuevo evento',
        '❓ *ayuda* - Muestra este mensaje de ayuda',
        '',
        '¿En qué puedo ayudarte?'
    ].join('\n'));

/**
 * Manejador de eventos para mensajes no reconocidos
 */
const handleUnknownMessage = async (ctx: any, { flowDynamic }: any) => {
    console.log(ctx);
    await flowDynamic([
        '❓ No entiendo ese comando.',
        'Escribe *ayuda* para ver los comandos disponibles.'
    ].join('\n'));
};

/**
 * Función principal
 */
const main = async () => {
    try {
        // Crear flujo principal
        const adapterFlow = createFlow([
            welcomeFlow,
            sheetFlow,
            calendarFlow,
            helpFlow,
        ]);

        // Crear proveedor y base de datos
        const adapterDB = new MemoryDB()
        const adapterProvider = createProvider(BaileysProvider)
    
        const { handleCtx, httpServer } = await createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        })
    
        httpServer(3000)

        adapterProvider.server.post('/v1/messages', handleCtx(async (bot, req, res) => {
            const { number, message } = req.body
            await bot.sendMessage(number, message, {})
            return res.end('send')
        }))
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