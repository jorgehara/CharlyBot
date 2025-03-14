import { createBot, createFlow, createProvider, addKeyword, ProviderClass } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { appointmentFlow } from './appointment.flow';
import { patientFlow } from './patient.flow';

const main = async () => {
  const provider = createProvider(BaileysProvider);

  const welcomeFlow = createFlow([
    addKeyword(['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hi', 'hello'])
      .addAnswer('👋 ¡Hola! Soy el asistente virtual del consultorio médico.')
      .addAnswer([
        '¿En qué puedo ayudarte hoy?',
        '',
        '1️⃣ *Consultar horarios disponibles*',
        '2️⃣ *Agendar una cita*',
        '3️⃣ *Cancelar una cita*',
        '4️⃣ *Registrarme como paciente*',
        '',
        'Responde con el número de la opción que deseas.'
      ])
  ]);

  const menuFlow = createFlow([
    addKeyword(['menu', 'menú', 'opciones', 'ayuda', 'help'])
      .addAnswer([
        '📋 *MENÚ PRINCIPAL*',
        '',
        '1️⃣ *Consultar horarios disponibles*',
        '2️⃣ *Agendar una cita*',
        '3️⃣ *Cancelar una cita*',
        '4️⃣ *Registrarme como paciente*',
        '',
        'Responde con el número de la opción que deseas.'
      ])
  ]);

  const bot = createBot({
    flow: createFlow([
      welcomeFlow,
      menuFlow,
      appointmentFlow,
      patientFlow
    ]),
    provider
  });

  return bot;
};

export default main; 