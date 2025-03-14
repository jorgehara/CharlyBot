import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { appointmentFlow, cancelAppointmentFlow } from './flows/appointment.flow'
import { patientFlow } from './flows/patient.flow'
import { Logger } from './utils/logger'

// Configuración de la API
const API_URL = 'http://localhost:3001/api' // Asegúrate de que esta URL sea correcta
const PORT = process.env.PORT ?? 3008

const welcomeFlow = addKeyword(['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hi', 'hello'])
  .addAnswer('👋 ¡Hola! Soy el asistente virtual del consultorio médico.')
  .addAnswer([
    '¿En qué puedo ayudarte hoy?',
    '',
    '*Horarios de atención:*',
    '• Mañana: 08:30 a 11:30',
    '• Tarde: 16:30 a 19:30',
    '',
    '1️⃣ *Consultar horarios disponibles*',
    '2️⃣ *Agendar una cita*',
    '3️⃣ *Cancelar una cita*',
    '4️⃣ *Registrarme como paciente*',
    '',
    'Responde con el número de la opción que deseas.'
  ])

const menuFlow = addKeyword(['menu', 'menú', 'opciones', 'ayuda', 'help'])
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

const bookAppointmentFlow = addKeyword(['2', 'agendar', 'cita', 'turno'])
  .addAnswer('📅 Vamos a agendar una cita.')
  .addAnswer('Primero, consultemos los horarios disponibles.')
  .addAnswer('¿Para qué fecha quieres consultar? (Formato: YYYY-MM-DD, ejemplo: 2025-03-15)')
  .addAction(async (ctx, { gotoFlow }) => {
    // Redirigir al flujo de consulta de horarios
    return gotoFlow(appointmentFlow)
  })

const main = async () => {
  const adapterDB = new MemoryDB()
  const adapterFlow = createFlow([
    welcomeFlow,
    menuFlow,
    bookAppointmentFlow,
    appointmentFlow,
    cancelAppointmentFlow,
    patientFlow
  ])
  const adapterProvider = createProvider(BaileysProvider, {
    writeMyself: 'host' as 'none' | 'host' | 'both'
  })

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  httpServer(+PORT)
}

main()

// Agregar manejadores de errores no capturados
process.on('uncaughtException', (error) => {
  Logger.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('UNHANDLED REJECTION:', reason);
});
