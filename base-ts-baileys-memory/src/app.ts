import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

import fetch from 'node-fetch'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './database/connection'
import { MongoAdapter } from '@builderbot/database-mongo'


dotenv.config()

// Configuración de MongoDB
export const adapterDB = new MongoAdapter({
    dbUri: process.env.MONGO_DB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB_NAME || 'charlybotv3'
})

const PORT = process.env.PORT ?? 3008

// Flujo para mostrar los horarios disponibles
export const availableSlotsFlow = addKeyword(['1', 'horarios', 'disponibles', 'turnos'])
.addAction(async (ctx, { flowDynamic, state }) => {
    try {
        const chatTimestamp = ctx.timestamp ? ctx.timestamp * 1000 : Date.now();
        const timeZone = 'America/Argentina/Buenos_Aires';
        const localChatDate = toZonedTime(new Date(chatTimestamp), timeZone);

        const today = new Date(localChatDate);
        const currentHour = parseInt(format(today, 'HH'), 10);
        const currentMinute = parseInt(format(today, 'mm'), 10);

        // Removed unused variable currentMinutebilbil hábil
        const getNextWorkingDay = (date: Date): Date => {
            const nextDate = new Date(date);
            do {
                nextDate.setDate(nextDate.getDate() + 1);
            } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
            return nextDate;
        };

        // Función para pedir los horarios disponibles de una fecha
        const fetchAvailableSlots = async (date: Date) => {
            const formattedDate = format(date, 'yyyy-MM-dd');
            try {
                const response = await fetch(`http://localhost:3001/api/appointments?date=${formattedDate}`);
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching slots:', error);
                return { data: { available: { morning: [], afternoon: [] }, success: false } };
            }
        };

        // Intentar con hoy si es día hábil y antes de las 18:00
        let appointmentDate = today;
        let slotResponse = { data: { available: { morning: [], afternoon: [] }, success: false } };

        const isWorkingDay = today.getDay() >= 1 && today.getDay() <= 5;
        const isBeforeClosing = currentHour < 18;

        if (isWorkingDay && isBeforeClosing) {
            slotResponse = await fetchAvailableSlots(today);
        }

// Si hoy no tiene horarios disponibles o no es día hábil, buscar siguiente día hábil
if (!slotResponse.data.success ||
    (slotResponse.data.available.morning.length === 0 &&
     slotResponse.data.available.afternoon.length === 0)
) {
    appointmentDate = getNextWorkingDay(today);
    slotResponse = await fetchAvailableSlots(appointmentDate);
}
        const { data } = slotResponse;

        if (data.success) {
            slotResponse = await fetchAvailableSlots(appointmentDate) as { data: { available: { morning: any[]; afternoon: any[]; }; success: boolean; displayDate?: string; }; };            let message = `Horarios disponibles para el 👉 *${data.displayDate}*:\n\n`;
            const slots = [];
            // Combinar los horarios de la mañana y la tarde en un solo array
            slots.push(...data.available.morning, ...data.available.afternoon);

            if (slots.length === 0) {
            const message = `Horarios disponibles para el 👉 *${data.displayDate || 'fecha no especificada'}*:\n\n`;                await flowDynamic('No hay horarios disponibles para el día solicitado.');
                return;
            }

            // Enumerar todos los horarios disponibles
            for (let i = 0; i < slots.length; i++) {
                message += `${i + 1}. 🕒 ${slots[i].displayTime} - ${slots[i].status}\n`;
            }

            // Actualizar el estado con los horarios disponibles
            await state.update({
                availableSlots: slots,
                appointmentDate: format(appointmentDate, 'yyyy-MM-dd'),
                fullConversationTimestamp: format(localChatDate, "yyyy-MM-dd'T'HH:mm:ssXXX"),
                conversationStartTime: format(localChatDate, 'HH:mm'),
            });

            await flowDynamic(message);
        } else {
            await flowDynamic('No se encontraron horarios disponibles para los próximos días hábiles.');
        }

    } catch (error) {
        console.error('Error:', error);
        await flowDynamic('Hubo un error al consultar los horarios disponibles.');
    }
})

    .addAnswer('✍️ Por favor, indica el número del horario que deseas reservar. Si no deseas reservar, escribe *cancelar*.', { capture: true }, async (ctx, { gotoFlow, flowDynamic, state }) => {
        if (ctx.body.toLowerCase() === 'cancelar') {
            await flowDynamic(`❌ *Reserva cancelada.* Si necesitas más ayuda, no dudes en contactarnos nuevamente.\n🤗 ¡Que tengas un excelente día!`);
            return;
        }

        const selectedSlotNumber = parseInt(ctx.body);
        const availableSlots = state.get('availableSlots');

        // Validar el número de horario seleccionado
        if (isNaN(selectedSlotNumber) || selectedSlotNumber < 1 || selectedSlotNumber > availableSlots.length) {
            await flowDynamic('Número de horario inválido. Por favor, intenta nuevamente.');
            return;
        }

        // Guardar el horario seleccionado en el estado y pasar al flujo de reserva
        const selectedSlot = availableSlots[selectedSlotNumber - 1];
        await state.update({ selectedSlot: selectedSlot });
        return gotoFlow(bookAppointmentFlow);
    });

// Flujo para construir una cita
export const bookAppointmentFlow = addKeyword(['2', 'reservar', 'cita', 'agendar'])
    .addAnswer(
        'Por favor, indícame tu *NOMBRE* y *APELLIDO* (ej: Juan Pérez):',
        { capture: true }
    )
    .addAction(async (ctx, { state }) => {
        const name = ctx.body.trim();
        await state.update({ clientName: name });
    })
    .addAnswer(
        '*Por favor*, selecciona tu *OBRA SOCIAL* de la siguiente lista:\n\n' +
        '1️⃣ INSSSEP\n' +
        '2️⃣ Swiss Medical\n' +
        '3️⃣ OSDE\n' +
        '4️⃣ Galeno\n' +
        '5️⃣ CONSULTA PARTICULAR',
        { capture: true }
    )
    .addAction(async (ctx, { state }) => {
        const socialWorkOption = ctx.body.trim();
        const socialWorks = {
            '1': 'INSSSEP',
            '2': 'Swiss Medical',
            '3': 'OSDE',
            '4': 'Galeno',
            '5': 'CONSULTA PARTICULAR',
            '6': 'CONSULTA PARTICULAR',
            '7': 'CONSULTA PARTICULAR',
            '8': 'CONSULTA PARTICULAR',
            '9': 'CONSULTA PARTICULAR',
        };

        const socialWork = socialWorks[socialWorkOption] || 'CONSULTA PARTICULAR';
        await state.update({ socialWork }); // Guardar la obra social en el estado
    })
    .addAnswer(
        '*Vamos a proceder con la reserva de tu cita.*',
        { delay: 1000 } // Agregar un delay de 1000ms
    )
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const clientName = state.get('clientName');
            const socialWork = state.get('socialWork');
            const selectedSlot = state.get('selectedSlot');
            const appointmentDate = state.get('appointmentDate');
            const phone = ctx.from;

            // Datos de la cita a enviar a la API
            const appointmentData = {
                clientName,
                socialWork,
                phone: phone,
                date: appointmentDate,
                time: selectedSlot.displayTime,
                email: phone + '@phone.com',
                description: 'Reserva de cita'
            };

            // Hacer una solicitud a la API para reservar la cita
            const response = await fetch('http://localhost:3001/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            });

            const data = await response.json();
            console.log('Response from API:', data);

            if (data.success) {
                // Mensaje de confirmación de la cita
                const message = `✅ Cita agendada exitosamente\n\n` +
                    `📅 Fecha: ${data.data.displayDate}\n` +
                    `🕒 Hora: ${data.data.start.displayTime} - ${data.data.end.displayTime}\n` +
                    `👤 Paciente: ${data.data.patient.name}\n` +
                    `📞 Teléfono: ${data.data.patient.phone}\n` +
                    `🏥 Obra Social: ${data.data.patient.obrasocial}\n` +
                    `💬 Descripción: ${data.data.summary}\n\nSi necesitas cambiar o cancelar tu cita, por favor contáctanos. *¡Gracias!*`;
                await flowDynamic(message);
            } else {
                await flowDynamic('❌ Hubo un problema al agendar la cita. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            await flowDynamic('❌ Hubo un error al agendar la cita. Por favor, intenta nuevamente.');
        }
    })
    .addAction(async (ctx, ctxFn) => {
        // Reiniciar el flujo después de la reserva
        await ctxFn.gotoFlow(goodbyeFlow);
    });
//Flujo de despedida
export const goodbyeFlow = addKeyword(['bye', 'adiós', 'chao', 'chau'])
    .addAnswer(
        `👋 *¡Hasta luego! Si necesitas más ayuda, no dudes en contactarnos nuevamente.*`,
        { delay: 1000 }
    )
    .addAction(async (ctx, ctxFn 
    ) => {
        await ctxFn.gotoFlow(welcomeFlow);
    });

// Flujo de bienvenida
const welcomeFlow = addKeyword<Provider, IDBDatabase>(['hi', 'hello', 'hola'])
    .addAnswer(`🤖🩺 *¡Bienvenido al Asistente Virtual del Consultorio Médico!* 🩺`)
    .addAnswer(
        [
            'Puedo ayudarte con las siguientes opciones:',
            '',
            '1️⃣ *horarios* - Ver horarios disponibles para citas',
            '',
            '¿En qué puedo ayudarte hoy?'
        ].join('\n')
    );

// Función principal para iniciar el bot
const main = async () => {
    await connectDB(); // Conectar a MongoDB

    const adapterFlow = createFlow([
        welcomeFlow,
        availableSlotsFlow,
        bookAppointmentFlow,
        goodbyeFlow
    ])

    const adapterProvider = createProvider(Provider)

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB
    })

    // Endpoint para enviar mensajes
    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    // Endpoint para registrar usuarios
    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    // Endpoint para enviar muestras
    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    // Endpoint para manejar la lista negra
    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    // Iniciar el servidor HTTP
    httpServer(+PORT)
}

main()

// const registerFlow = addKeyword<Provider, Database>(utils.setEvent('REGISTER_FLOW'))
    //     .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
    //         await state.update({ name: ctx.body })
    //     })
    //     .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
    //         await state.update({ age: ctx.body })
    //     })
    //     .addAction(async (_, { flowDynamic, state }) => {
    //         await flowDynamic(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
    //     })

    // const fullSamplesFlow = addKeyword<Provider, Database>(['samples', utils.setEvent('SAMPLES')])
    //     .addAnswer(`💪 I'll send you a lot files...`)
    //     .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
    //     .addAnswer(`Send video from URL`, {
    //         media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
    //     })
    //     .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
    //     .addAnswer(`Send file from URL`, {
    //         media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    //     })