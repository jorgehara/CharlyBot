import { addKeyword, EVENTS } from '@builderbot/bot';
import { ApiService } from '../services/api.service';
import { formatDate, formatTime } from '../utils/format';

export const appointmentFlow = addKeyword(['1', 'horarios', 'disponibles', 'consultar'])
  .addAnswer('📅 Vamos a consultar los horarios disponibles.')
  .addAnswer('¿Para qué fecha quieres consultar? (Formato: YYYY-MM-DD, ejemplo: 2025-03-15)')
  .addAction(async (ctx, { flowDynamic, state }) => {
    // Guardar el número de teléfono del usuario
    const currentState = state.getMyState() || {};
    currentState.phone = ctx.from;
    await state.update(currentState);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const date = ctx.body;
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      await flowDynamic('⚠️ Formato de fecha incorrecto. Por favor, usa el formato YYYY-MM-DD (ejemplo: 2025-03-15)');
      return;
    }
    
    try {
      // Consultar horarios disponibles
      const slotsData = await ApiService.getAvailableSlots(date);
      
      if (!slotsData.success) {
        await flowDynamic('❌ Ocurrió un error al consultar los horarios. Por favor, intenta más tarde.');
        return;
      }
      
      const { available, displayDate } = slotsData;
      
      if (available.total === 0) {
        await flowDynamic(`No hay horarios disponibles para el ${displayDate}. ¿Quieres consultar otra fecha?`);
        return;
      }
      
      // Mostrar horarios disponibles
      let message = `*Horarios disponibles para ${displayDate}*\n\n`;
      
      if (available.morning.length > 0) {
        message += '*Mañana:*\n';
        available.morning.forEach((slot: any) => {
          message += `- ${slot.displayTime}\n`;
        });
        message += '\n';
      }
      
      if (available.afternoon.length > 0) {
        message += '*Tarde:*\n';
        available.afternoon.forEach((slot: any) => {
          message += `- ${slot.displayTime}\n`;
        });
      }
      
      message += '\n¿Quieres agendar una cita? Responde *SI* para continuar o *NO* para volver al menú.';
      
      // Guardar los slots disponibles en el estado
      const currentState = state.getMyState();
      currentState.availableSlots = slotsData;
      currentState.selectedDate = date;
      await state.update(currentState);
      
      await flowDynamic(message);
    } catch (error) {
      console.error('Error al consultar horarios:', error);
      await flowDynamic('❌ Ocurrió un error al consultar los horarios. Por favor, intenta más tarde.');
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state, gotoFlow }) => {
    const response = ctx.body.toLowerCase();
    
    if (response === 'si' || response === 'sí') {
      await flowDynamic('📝 Perfecto, vamos a agendar tu cita.');
      await flowDynamic('Por favor, ingresa tu nombre completo:');
      
      // Actualizar el estado para indicar que estamos en el proceso de agendar
      const currentState = state.getMyState();
      currentState.isBooking = true;
      await state.update(currentState);
    } else {
      await flowDynamic('👍 Entendido. ¿En qué más puedo ayudarte?');
      
      // Volver al menú principal
      const menuKeyword = addKeyword(['menu'])
        .addAnswer('Volviendo al menú principal...');
      
      return gotoFlow(menuKeyword);
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    
    // Verificar si estamos en el proceso de agendar
    if (!currentState.isBooking) return;
    
    // Guardar el nombre del paciente
    currentState.clientName = ctx.body;
    await state.update(currentState);
    
    await flowDynamic(`Gracias ${currentState.clientName}. Ahora, ¿a qué hora te gustaría agendar tu cita? (Formato: HH:MM, ejemplo: 14:30)`);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    
    // Verificar si estamos en el proceso de agendar
    if (!currentState.isBooking) return;
    
    const time = ctx.body;
    
    // Validar formato de hora
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      await flowDynamic('⚠️ Formato de hora incorrecto. Por favor, usa el formato HH:MM (ejemplo: 14:30)');
      return;
    }
    
    // Guardar la hora seleccionada
    currentState.selectedTime = time;
    await state.update(currentState);
    
    await flowDynamic('¿Podrías proporcionar tu correo electrónico? (opcional, puedes responder "no" si prefieres no compartirlo)');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    
    // Verificar si estamos en el proceso de agendar
    if (!currentState.isBooking) return;
    
    const email = ctx.body.toLowerCase() === 'no' ? '' : ctx.body;
    
    // Guardar el email
    currentState.email = email;
    await state.update(currentState);
    
    await flowDynamic('Por último, ¿cuál es el motivo de tu consulta? (Describe brevemente tu situación)');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    
    // Verificar si estamos en el proceso de agendar
    if (!currentState.isBooking) return;
    
    const description = ctx.body;
    
    // Guardar la descripción
    currentState.description = description;
    
    try {
      // Crear la cita
      const appointmentData = {
        clientName: currentState.clientName,
        phone: currentState.phone,
        date: currentState.selectedDate,
        time: currentState.selectedTime,
        email: currentState.email,
        description: currentState.description
      };
      
      const result = await ApiService.createAppointment(appointmentData);
      
      if (result.success) {
        const { data } = result;
        
        // Formatear la información de la cita
        const appointmentInfo = `
📅 *CITA CONFIRMADA*

👤 *Paciente:* ${data.patient.name}
📞 *Teléfono:* ${data.patient.phone}
📧 *Email:* ${data.patient.email || 'No proporcionado'}
🗓️ *Fecha:* ${data.displayDate}
⏰ *Hora:* ${data.start.displayTime}
🏥 *ID de la cita:* ${data.id}

_Guarda este ID por si necesitas cancelar tu cita._

¡Gracias por agendar con nosotros! Te esperamos en la fecha y hora indicada.
`;
        
        await flowDynamic(appointmentInfo);
      } else {
        await flowDynamic('❌ No se pudo agendar la cita. Por favor, intenta nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error al agendar cita:', error);
      await flowDynamic('❌ Ocurrió un error al agendar la cita. Por favor, intenta más tarde.');
    }
    
    // Limpiar el estado
    await state.update({});
  });

// Flujo para cancelar citas
export const cancelAppointmentFlow = addKeyword(['3', 'cancelar', 'cancelar cita'])
  .addAnswer('🗑️ Vamos a cancelar tu cita.')
  .addAnswer('Por favor, proporciona tu número de teléfono para buscar tus citas:')
  .addAction({ capture: true }, async (ctx, { flowDynamic }) => {
    const phone = ctx.body;
    
    try {
      // Buscar citas por teléfono
      const appointments = await ApiService.findAppointmentsByPhone(phone);
      
      if (!appointments.success || appointments.data.length === 0) {
        await flowDynamic('No se encontraron citas asociadas a este número de teléfono.');
        return;
      }
      
      // Mostrar las citas encontradas
      let message = '*Citas encontradas:*\n\n';
      
      appointments.data.forEach((appointment: any, index: number) => {
        message += `${index + 1}. *Fecha:* ${appointment.displayDate}\n`;
        message += `   *Hora:* ${appointment.start.displayTime}\n`;
        message += `   *ID:* ${appointment.id}\n\n`;
      });
      
      message += 'Por favor, proporciona el ID de la cita que deseas cancelar:';
      
      await flowDynamic(message);
    } catch (error) {
      console.error('Error al buscar citas:', error);
      await flowDynamic('❌ Ocurrió un error al buscar tus citas. Por favor, intenta más tarde.');
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic }) => {
    const appointmentId = ctx.body;
    
    try {
      // Cancelar la cita
      const result = await ApiService.cancelAppointment(appointmentId);
      
      if (result.success) {
        await flowDynamic('✅ Cita cancelada exitosamente. Gracias por notificarnos.');
      } else {
        await flowDynamic('❌ No se pudo cancelar la cita. Verifica el ID e intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      await flowDynamic('❌ Ocurrió un error al cancelar la cita. Por favor, intenta más tarde.');
    }
  });

// Combinar los flujos
export const appointmentFlows = [
  appointmentFlow,
  cancelAppointmentFlow,
  // Agregar aquí otros flujos relacionados con citas
]; 