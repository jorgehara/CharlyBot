import { addKeyword } from '@builderbot/bot';
import { ApiService } from '../services/api.service';

export const patientFlow = addKeyword(['4', 'registrar', 'registro', 'paciente'])
  .addAnswer('📋 Vamos a registrarte como paciente.')
  .addAnswer('Por favor, ingresa tu nombre completo:')
  .addAction(async (ctx, { flowDynamic, state }) => {
    // Guardar el número de teléfono del usuario
    const currentState = state.getMyState() || {};
    currentState.phone = ctx.from;
    await state.update(currentState);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    // Guardar el nombre del paciente
    const currentState = state.getMyState();
    currentState.name = ctx.body;
    await state.update(currentState);
    
    await flowDynamic(`Gracias ${currentState.name}. ¿Podrías proporcionar tu correo electrónico? (opcional, puedes responder "no" si prefieres no compartirlo)`);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    const email = ctx.body.toLowerCase() === 'no' ? '' : ctx.body;
    
    // Guardar el email
    currentState.email = email;
    await state.update(currentState);
    
    await flowDynamic('¿Cuál es tu fecha de nacimiento? (Formato: YYYY-MM-DD, ejemplo: 1990-05-15)');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    const birthdate = ctx.body;
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthdate) && birthdate.toLowerCase() !== 'no') {
      await flowDynamic('⚠️ Formato de fecha incorrecto. Por favor, usa el formato YYYY-MM-DD (ejemplo: 1990-05-15)');
      return;
    }
    
    // Guardar la fecha de nacimiento
    currentState.birthdate = birthdate.toLowerCase() === 'no' ? '' : birthdate;
    await state.update(currentState);
    
    await flowDynamic('¿Cuál es tu dirección? (opcional, puedes responder "no" si prefieres no compartirla)');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    const address = ctx.body.toLowerCase() === 'no' ? '' : ctx.body;
    
    // Guardar la dirección
    currentState.address = address;
    await state.update(currentState);
    
    await flowDynamic('Por último, ¿tienes alguna condición médica o información adicional que debamos conocer? (opcional)');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const currentState = state.getMyState();
    const notes = ctx.body.toLowerCase() === 'no' ? '' : ctx.body;
    
    // Guardar las notas
    currentState.notes = notes;
    
    try {
      // Registrar al paciente
      const patientData = {
        name: currentState.name,
        phone: currentState.phone,
        email: currentState.email,
        birthdate: currentState.birthdate,
        address: currentState.address,
        notes: currentState.notes
      };
      
      const result = await ApiService.registerPatient(patientData);
      
      if (result.success) {
        await flowDynamic(`
✅ *Registro exitoso*

Gracias ${currentState.name}, has sido registrado correctamente como paciente.

Ahora puedes agendar citas utilizando el número de teléfono con el que te has registrado.

¿Deseas agendar una cita ahora? Responde *SI* para continuar o *NO* para finalizar.
`);
      } else {
        await flowDynamic('❌ No se pudo completar el registro. Por favor, intenta nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      await flowDynamic('❌ Ocurrió un error al registrar tus datos. Por favor, intenta más tarde.');
    }
    
    // Limpiar el estado
    await state.update({});
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, gotoFlow }) => {
    const response = ctx.body.toLowerCase();
    
    if (response === 'si' || response === 'sí') {
      await flowDynamic('📅 Perfecto, vamos a agendar tu cita.');
      
      // Redirigir al flujo de agendar cita
      const appointmentKeyword = addKeyword(['agendar'])
        .addAnswer('Redirigiendo al proceso de agendar cita...');
      
      return gotoFlow(appointmentKeyword);
    } else {
      await flowDynamic('👍 Entendido. ¡Gracias por registrarte! Si necesitas agendar una cita en el futuro, no dudes en contactarnos.');
    }
  }); 