import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import fetch from 'node-fetch';

const PORT = process.env.PORT ?? 3008

// Flujo para mostrar los horarios disponibles
export const availableSlotsFlow = addKeyword(['1', 'horarios', 'disponibles', 'turnos'])
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            // Obtener la fecha actual
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const date = `${year}-${month}-${day}`;

            // Hacer una solicitud a la API para obtener los horarios disponibles
            const response = await fetch(`http://localhost:3001/api/appointments/available-slots?date=${date}`);
            const data = await response.json();

            if (data.success) {
                let message = `Horarios disponibles para el ${data.displayDate}:\n\n`;
                const slots = [];

                // Agregar horarios de la mañana al mensaje
                if (data.available.morning.length > 0) {
                    message += `*Mañana:*\n`;
                    data.available.morning.forEach(slot => {
                        slots.push(slot);
                    });
                }

                // Agregar horarios de la tarde al mensaje
                if (data.available.afternoon.length > 0) {
                    message += `\n*Tarde:*\n`;
                    data.available.afternoon.forEach(slot => {
                        slots.push(slot);
                    });
                }

                // Si no hay horarios disponibles, enviar un mensaje al usuario
                if (slots.length === 0) {
                    await flowDynamic('No hay horarios disponibles para hoy.');
                    return;
                }

                // Enumerar los horarios disponibles
                for (let i = 0; i < slots.length; i++) {
                    message += `${i + 1}. 🕒 ${slots[i].displayTime} - ${slots[i].status}\n`;
                }

                // Guardar los horarios disponibles y la fecha en el estado
                await state.update({ availableSlots: slots, appointmentDate: date });
                await flowDynamic(message);
            } else {
                await flowDynamic('No se encontraron horarios disponibles para hoy.');
            }
        } catch (error) {
            console.error('Error:', error);
            await flowDynamic('Hubo un error al consultar los horarios disponibles.');
        }
    })
    .addAnswer('✍️ Por favor, indica el número del horario que deseas reservar. Si no deseas reservar, escribe *cancelar*.', { capture: true }, async (ctx, { gotoFlow, state }) => {
        if (ctx.body.toLowerCase() === 'cancelar') {
            await flowDynamic('Reserva cancelada.');
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
    .addAction(async (ctx, { state, gotoFlow }) => {
        const name = ctx.body.trim();
        await state.update({ clientName: name }); // Guardar el nombre en el estado
    })
    .addAnswer(
        '*Por favor*, selecciona tu *OBRA SOCIAL* de la siguiente lista (en caso de no tener, se te agendará como *CONSULTA PARTICULAR*):\n\n' +
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
        { delay: 500 }
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
                    `💬 Descripción: ${data.data.summary}\n\n`;
            
                await flowDynamic(message);
            } else {
                await flowDynamic('❌ Hubo un problema al agendar la cita. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            await flowDynamic('❌ Hubo un error al agendar la cita. Por favor, intenta nuevamente.');
        }
    });

// Flujo de bienvenida
const welcomeFlow = addKeyword<Provider, Database>(['hi', 'hello', 'hola'])
    .addAnswer(`🩺 *¡Bienvenido al Asistente Virtual del Consultorio Médico!* 🩺`)
    .addAnswer(
        [
            'Puedo ayudarte con las siguientes opciones:',
            '',
            '1️⃣ *horarios* - Ver horarios disponibles para citas',
            '',
            '¿En qué puedo ayudarte hoy?'
        ].join('\n')
    )

// Función principal para iniciar el bot
const main = async () => {
    const adapterFlow = createFlow([
        welcomeFlow, 
        availableSlotsFlow,
        bookAppointmentFlow
    ])

    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
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