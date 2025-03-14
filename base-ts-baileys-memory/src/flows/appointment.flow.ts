import { addKeyword, EVENTS } from '@builderbot/bot';
import { ApiService } from '../services/api.service';
import { formatDate, formatTime } from '../utils/format';
import { Logger } from '../utils/logger';

export const appointmentFlow = addKeyword(['1', 'horarios', 'disponibles', 'consultar'])
  .addAnswer('📅 Vamos a consultar los horarios disponibles.')
  .addAnswer('¿Para qué fecha quieres consultar? (Formato: YYYY-MM-DD, ejemplo: 2025-03-15)')
  .addAction(async (ctx, { flowDynamic, state }) => {
    try {
      // Guardar el número de teléfono del usuario
      const currentState = state.getMyState() || {};
      currentState.phone = ctx.from;
      await state.update(currentState);
    } catch (error) {
      Logger.error('Error al guardar el teléfono:', error);
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    try {
      const date = ctx.body;
      
      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        await flowDynamic('⚠️ Formato de fecha incorrecto. Por favor, usa el formato YYYY-MM-DD (ejemplo: 2025-03-15)');
        return;
      }
      
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
      
      // Crear un array con todos los horarios disponibles
      const morningSlots = available.morning.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      
      const afternoonSlots = available.afternoon.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      
      // Mostrar horarios disponibles numerados
      let message = `*Horarios disponibles para ${displayDate}*\n\n`;
      
      if (morningSlots.length > 0) {
        message += '*Mañana:*\n';
        morningSlots.forEach((slot, index) => {
          message += `${index + 1}. ${slot.displayTime}\n`;
        });
        message += '\n';
      }
      
      if (afternoonSlots.length > 0) {
        message += '*Tarde:*\n';
        afternoonSlots.forEach((slot, index) => {
          message += `${morningSlots.length + index + 1}. ${slot.displayTime}\n`;
        });
      }
      
      message += '\nResponde con el número del horario que deseas seleccionar.';
      
      // Guardar los slots disponibles en el estado
      const currentState = state.getMyState() || {};
      currentState.availableSlots = [...morningSlots, ...afternoonSlots];
      currentState.selectedDate = date;
      currentState.displayDate = displayDate;
      await state.update(currentState);
      
      await flowDynamic(message);
    } catch (error) {
      Logger.error('Error al consultar horarios:', error);
      await flowDynamic('❌ Ocurrió un error al consultar los horarios. Por favor, intenta más tarde.');
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    try {
      const selectedOption = parseInt(ctx.body);
      const currentState = state.getMyState() || {};
      const allSlots = currentState.availableSlots || [];
      
      // Validar que la opción seleccionada sea válida
      if (isNaN(selectedOption) || selectedOption < 1 || selectedOption > allSlots.length) {
        await flowDynamic(`⚠️ Opción inválida. Por favor, selecciona un número entre 1 y ${allSlots.length}.`);
        return;
      }
      
      // Obtener el horario seleccionado
      const selectedSlot = allSlots[selectedOption - 1];
      
      // Guardar el horario seleccionado
      currentState.selectedSlot = selectedSlot;
      currentState.selectedTime = selectedSlot.displayTime;
      await state.update(currentState);
      
      await flowDynamic(`Has seleccionado el horario: ${selectedSlot.displayTime}`);
      await flowDynamic('Por favor, ingresa tu nombre completo:');
    } catch (error) {
      Logger.error('Error al seleccionar horario:', error);
      await flowDynamic('❌ Ocurrió un error. Por favor, intenta más tarde.');
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    try {
      const currentState = state.getMyState() || {};
      
      // Guardar el nombre del paciente
      currentState.clientName = ctx.body;
      await state.update(currentState);
      
      await flowDynamic(`Gracias ${currentState.clientName}. ¿Podrías proporcionar tu correo electrónico? (opcional, puedes responder "no" si prefieres no compartirlo)`);
    } catch (error) {
      Logger.error('Error al guardar nombre:', error);
      await flowDynamic('❌ Ocurrió un error. Por favor, intenta más tarde.');
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    try {
      const currentState = state.getMyState() || {};
      const email = ctx.body.toLowerCase() === 'no' ? '' : ctx.body;
      
      // Guardar el email
      currentState.email = email;
      await state.update(currentState);
      
      await flowDynamic('Por último, ¿cuál es el motivo de tu consulta? (Describe brevemente tu situación)');
    } catch (error) {
      Logger.error('Error al guardar email:', error);
      await flowDynamic('❌ Ocurrió un error. Por favor, intenta más tarde.');
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    try {
      const currentState = state.getMyState() || {};
      const description = ctx.body;
      
      // Guardar la descripción
      currentState.description = description;
      
      // Extraer la hora del horario seleccionado (formato HH:MM)
      const timeMatch = currentState.selectedTime.match(/(\d{1,2}):(\d{2})/);
      const formattedTime = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : currentState.selectedTime;
      
      // Crear la cita
      const appointmentData = {
        clientName: currentState.clientName,
        phone: currentState.phone,
        date: currentState.selectedDate,
        time: formattedTime,
        email: currentState.email,
        description: currentState.description
      };
      
      Logger.info('Datos de la cita a crear:', appointmentData);
      
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
        Logger.error('Error al agendar cita (respuesta API):', result);
      }
      
      // Limpiar el estado
      await state.update({});
    } catch (error) {
      Logger.error('Error al agendar cita:', error);
      await flowDynamic('❌ Ocurrió un error al agendar la cita. Por favor, intenta más tarde.');
      
      // Limpiar el estado incluso en caso de error
      await state.update({});
    }
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