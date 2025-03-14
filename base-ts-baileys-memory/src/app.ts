import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import axios from 'axios'

// Configuración de la API
const API_URL = 'http://localhost:3001/api' // Asegúrate de que esta URL sea correcta
const PORT = process.env.PORT ?? 3008

// Función auxiliar para formatear fechas
const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('es-ES', options as any)
}

// Flujo de bienvenida y menú principal
const welcomeFlow = addKeyword<Provider, Database>(['hola', 'menu', 'ayuda', 'hi', 'hello'])
  .addAnswer('🩺 *¡Bienvenido al Asistente Virtual del Consultorio Médico!* 🩺')
  .addAnswer(
    [
      'Puedo ayudarte con las siguientes opciones:',
      '',
      '1️⃣ *horarios* - Ver horarios disponibles para citas',
      '2️⃣ *mis citas* - Consultar tus citas programadas',
      '3️⃣ *registrarme* - Registrar tus datos como paciente',
      '4️⃣ *agendar* - Agendar una nueva cita',
      '5️⃣ *cancelar* - Cancelar una cita existente',
      '',
      '¿En qué puedo ayudarte hoy?'
    ].join('\n'),
    { delay: 800 }
  )

// Flujo de horarios
const horariosFlow = addKeyword<Provider, Database>(['1', 'horarios'])
  .addAnswer('📅 *Horarios Disponibles* 📅')
  .addAnswer('Por favor, espera mientras consulto los horarios disponibles...',
    null,
    async (ctx, { flowDynamic }) => {
      try {
        // Intentar obtener horarios para hoy primero
        let response = await axios.get(`${API_URL}/appointments/available-slots`)
        let { slots, date } = response.data
        
        // Si no hay horarios disponibles para hoy, consultar mañana
        if (!slots || slots.length === 0) {
          // Calcular la fecha de mañana
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const tomorrowStr = tomorrow.toISOString().split('T')[0] // Formato YYYY-MM-DD
          
          console.log('No hay horarios disponibles hoy, consultando para mañana:', tomorrowStr)
          
          // Consultar horarios para mañana
          response = await axios.get(`${API_URL}/appointments/available-slots?date=${tomorrowStr}`)
          slots = response.data.slots
          date = response.data.date
          
          // Si tampoco hay horarios mañana, mostrar mensaje
          if (!slots || slots.length === 0) {
            await flowDynamic('No hay horarios disponibles para hoy ni mañana. Intenta consultar otro día escribiendo *horarios [fecha]* (ejemplo: *horarios 2023-12-25*)')
            return
          }
          
          // Informar que se están mostrando los horarios de mañana
          await flowDynamic('No hay horarios disponibles para hoy. Te muestro los horarios disponibles para mañana:')
        }
        
        // Agrupar slots por período (mañana/tarde)
        const morning = slots.filter(slot => slot.period === 'mañana')
        const afternoon = slots.filter(slot => slot.period === 'tarde')
        
        // Construir mensaje con los horarios disponibles
        let message = `*Horarios disponibles para ${slots[0].displayDate}*\n\n`
        
        if (morning.length > 0) {
          message += '*Mañana:*\n'
          morning.forEach(slot => {
            message += `- ${slot.displayTime}\n`
          })
          message += '\n'
        }
        
        if (afternoon.length > 0) {
          message += '*Tarde:*\n'
          afternoon.forEach(slot => {
            message += `- ${slot.displayTime}\n`
          })
        }
        
        message += '\nPara agendar una cita, escribe *agendar*'
        
        await flowDynamic(message)
      } catch (error) {
        console.error('Error al obtener horarios:', error)
        await flowDynamic('❌ Lo siento, hubo un problema al consultar los horarios disponibles. Por favor, intenta más tarde.')
      }
    }
  )

const miscitasFlow = addKeyword<Provider, Database>(['2', 'mis citas'])
  .addAnswer('📅 *Mis Citas Programadas* 📅')
  .addAnswer('Por favor, proporciona tu número de teléfono para buscar tus citas:',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      try {
        const phone = ctx.body
        
        // Llamar a la API para obtener las citas del paciente
        const response = await axios.get(`${API_URL}/appointments`, {
          params: { phone }
        })
        
        const { events } = response.data
        
        if (events && events.length > 0) {
          let message = '*Tus citas programadas:*\n\n'
          
          events.forEach((event, index) => {
            const startDate = new Date(event.start.dateTime)
            message += `*${index + 1}.* ${event.summary}\n`
            message += `   📆 Fecha: ${formatDate(startDate)}\n`
            message += `   🕒 Hora: ${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n`
            message += `   🆔 ID: ${event.id}\n\n`
          })
          
          message += 'Para cancelar una cita, escribe *cancelar* seguido del ID de la cita.'
          
          await flowDynamic(message)
        } else {
          await flowDynamic('No tienes citas programadas. Para agendar una cita, escribe *agendar*.')
        }
      } catch (error) {
        console.error('Error al obtener citas:', error)
        await flowDynamic('❌ Lo siento, hubo un problema al consultar tus citas. Por favor, intenta más tarde.')
      }
    }
  )

const registrarmeFlow = addKeyword<Provider, Database>(['3', 'registrarme'])
  .addAnswer('📝 *Registro de Paciente* 📝')
  .addAnswer('Por favor, ingresa tu nombre completo:',
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow }) => {
      // Guardar el nombre en el contexto
      ctx.name = ctx.body
      await flowDynamic(`Gracias, ${ctx.name}. Ahora necesito tu correo electrónico:`)
    }
  )
  .addAnswer('',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      // Guardar el email en el contexto
      ctx.email = ctx.body
      await flowDynamic('Por último, necesito tu número de teléfono:')
    }
  )
  .addAnswer('',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      try {
        const phone = ctx.body
        
        // Llamar a la API para registrar al paciente
        const response = await axios.post(`${API_URL}/registration`, {
          name: ctx.name,
          email: ctx.email,
          phone
        })
        
        if (response.data.success) {
          await flowDynamic([
            '✅ *¡Registro completado con éxito!*',
            '',
            'Tus datos han sido guardados correctamente.',
            '',
            'Ahora puedes agendar citas escribiendo *agendar*.'
          ].join('\n'))
        } else {
          throw new Error('Error en el registro')
        }
      } catch (error) {
        console.error('Error al registrar paciente:', error)
        await flowDynamic('❌ Lo siento, hubo un problema al registrar tus datos. Por favor, intenta más tarde.')
      }
    }
  )

const agendarFlow = addKeyword<Provider, Database>(['4', 'agendar'])
  .addAnswer('🗓️ *Agendar Nueva Cita* 🗓️')
  .addAnswer('Por favor, ingresa tu nombre completo:',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      // Guardar el nombre en el contexto
      ctx.name = ctx.body
      await flowDynamic('Gracias. Ahora, ingresa tu número de teléfono:')
    }
  )
  .addAnswer('',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      try {
        // Guardar el teléfono en el contexto
        ctx.phone = ctx.body
        
        // Obtener horarios disponibles
        const response = await axios.get(`${API_URL}/appointments/available-slots`)
        console.log('Respuesta de API (horarios):', response.data)
        
        const { slots } = response.data
        
        if (slots && slots.length > 0) {
          // Guardar los slots en el contexto para usarlos después
          // Convertimos a string para evitar problemas de serialización
          ctx.slotsData = JSON.stringify(slots)
          
          // Agrupar slots por período (mañana/tarde)
          const morning = slots.filter(slot => slot.period === 'mañana')
          const afternoon = slots.filter(slot => slot.period === 'tarde')
          
          // Construir mensaje con los horarios disponibles
          let message = `*Horarios disponibles para ${slots[0].displayDate}*\n\n`
          
          if (morning.length > 0) {
            message += '*Mañana:*\n'
            morning.forEach((slot, index) => {
              message += `${index + 1}. ${slot.displayTime}\n`
            })
            message += '\n'
          }
          
          if (afternoon.length > 0) {
            message += '*Tarde:*\n'
            afternoon.forEach((slot, index) => {
              const slotNumber = morning.length + index + 1
              message += `${slotNumber}. ${slot.displayTime}\n`
            })
          }
          
          message += '\nPor favor, selecciona un horario ingresando el número correspondiente:'
          
          await flowDynamic(message)
        } else {
          await flowDynamic('No hay horarios disponibles para hoy. Por favor, escribe *horarios* para consultar otro día.')
        }
      } catch (error) {
        console.error('Error al obtener horarios:', error)
        await flowDynamic('❌ Lo siento, hubo un problema al consultar los horarios disponibles. Por favor, intenta más tarde.')
      }
    }
  )
  .addAnswer('',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      try {
        console.log('Selección del usuario:', ctx.body)
        
        // Recuperar los slots desde el contexto
        let slots = []
        try {
          slots = JSON.parse(ctx.slotsData || '[]')
          console.log('Slots recuperados del contexto:', slots)
        } catch (parseError) {
          console.error('Error al parsear slots:', parseError)
          await flowDynamic('❌ Lo siento, hubo un problema con los horarios. Por favor, intenta nuevamente escribiendo *agendar*.')
          return
        }
        
        // Verificar que tenemos datos
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
          console.error('No hay slots disponibles en el contexto')
          await flowDynamic('❌ Lo siento, hubo un problema con los horarios. Por favor, intenta nuevamente escribiendo *agendar*.')
          return
        }
        
        // Obtener el índice seleccionado
        const slotIndex = parseInt(ctx.body) - 1
        console.log('Índice seleccionado:', slotIndex, 'Total slots:', slots.length)
        
        // Validar el índice
        if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= slots.length) {
          console.error('Índice inválido:', slotIndex)
          await flowDynamic('❌ Número inválido. Por favor, selecciona un número de la lista.')
          return
        }
        
        // Obtener el slot seleccionado
        const selectedSlot = slots[slotIndex]
        console.log('Slot seleccionado:', selectedSlot)
        
        // Verificar que el slot existe
        if (!selectedSlot || !selectedSlot.time) {
          console.error('Slot seleccionado inválido:', selectedSlot)
          await flowDynamic('❌ Lo siento, hubo un problema con el horario seleccionado. Por favor, intenta nuevamente.')
          return
        }
        
        // Formatear fecha y hora para la API
        const slotTime = new Date(selectedSlot.time)
        const date = slotTime.toISOString().split('T')[0]
        const time = slotTime.toISOString().split('T')[1].substring(0, 5)
        
        // Mostrar información de depuración
        console.log('Datos para crear cita:', {
          clientName: ctx.name,
          phone: ctx.phone,
          date,
          time,
          selectedSlot
        })
        
        // Llamar a la API para crear la cita
        const response = await axios.post(`${API_URL}/appointments`, {
          clientName: ctx.name,
          phone: ctx.phone,
          date,
          time
        })
        
        console.log('Respuesta de la API (crear cita):', response.data)
        
        if (response.data.success) {
          const appointmentData = response.data.data
          const startTime = new Date(appointmentData.start.dateTime)
          
          await flowDynamic([
            '✅ *¡Cita agendada con éxito!*',
            '',
            `📆 Fecha: ${formatDate(startTime)}`,
            `🕒 Hora: ${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' } as any)}`,
            `👤 Paciente: ${ctx.name}`,
            `📱 Teléfono: ${ctx.phone}`,
            '',
            'Recibirás un recordatorio antes de tu cita.',
            'Para cancelar tu cita, escribe *cancelar* seguido del ID de la cita.'
          ].join('\n'))
        } else {
          throw new Error('Error al agendar cita: ' + (response.data.message || 'Respuesta sin éxito'))
        }
      } catch (error) {
        console.error('Error al agendar cita:', error)
        await flowDynamic('❌ Lo siento, hubo un problema al agendar tu cita. Por favor, intenta más tarde.')
      }
    }
  )

const cancelarFlow = addKeyword<Provider, Database>(['5', 'cancelar'])
  .addAnswer('❌ *Cancelar Cita* ❌')
  .addAnswer('Por favor, ingresa el ID de la cita que deseas cancelar:',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      try {
        const appointmentId = ctx.body.trim()
        
        // Llamar a la API para cancelar la cita
        const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`)
        
        if (response.data.success) {
          await flowDynamic([
            '✅ *Cita cancelada con éxito*',
            '',
            'Tu cita ha sido cancelada correctamente.',
            '',
            'Para agendar una nueva cita, escribe *agendar*.'
          ].join('\n'))
        } else {
          throw new Error('Error al cancelar cita')
        }
      } catch (error) {
        console.error('Error al cancelar cita:', error)
        await flowDynamic('❌ Lo siento, hubo un problema al cancelar tu cita. Verifica que el ID sea correcto e intenta nuevamente.')
      }
    }
  )

const main = async () => {
  // Crear flujo con todos los flujos de la aplicación
  const adapterFlow = createFlow([
    welcomeFlow,
    horariosFlow,
    miscitasFlow,
    registrarmeFlow,
    agendarFlow,
    cancelarFlow,
  ])
  
  const adapterProvider = createProvider(Provider)
  const adapterDB = new Database()

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Endpoints para interactuar con el bot desde otras aplicaciones
  adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body
      await bot.sendMessage(number, message, { media: urlMedia ?? null })
      return res.end('sended')
    })
  )

  adapterProvider.server.post(
    '/v1/register',
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body
      await bot.dispatch('REGISTER_FLOW', { from: number, name })
      return res.end('trigger')
    })
  )

  adapterProvider.server.post(
    '/v1/samples',
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body
      await bot.dispatch('SAMPLES', { from: number, name })
      return res.end('trigger')
    })
  )

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

  httpServer(+PORT)
}

main()
