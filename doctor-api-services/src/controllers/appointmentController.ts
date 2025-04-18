import { Request, Response } from 'express';
import { calendarService, appointmentService } from '../services';
import config from '../config';
import { Controller } from '../types/express';
import { SlotsResponse, TimeSlot, AppointmentInfo, WeeklySlotResponse, WeeklySlotDay } from '../types/appointment';

export const getAvailableSlots: Controller = async (req, res) => {
  try {
    const { date, showOccupied } = req.query;
    console.log(`Solicitud de horarios para fecha: ${date || 'hoy'}, mostrar ocupados: ${showOccupied || 'false'}`);
    
    // Obtener fecha actual si no se proporciona
    const selectedDate = date ? String(date) : new Date().toISOString().split('T')[0];
    
    // Configurar inicio del día para buscar eventos
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    console.log('Buscando eventos desde', startOfDay.toISOString());
    
    const existingEvents = await calendarService.listEvents(
      config.google.calendarId!, 
      startOfDay
    );
    
    // Obtener horarios disponibles
    const slotsData = await appointmentService.getAvailableTimeSlots(selectedDate, existingEvents);
    
    // Preparar respuesta
    const response: SlotsResponse = {
      success: true,
      date: slotsData.date,
      displayDate: slotsData.displayDate,
      available: {
        morning: slotsData.available.morning,
        afternoon: slotsData.available.afternoon,
        total: slotsData.available.total
      },
      occupied: {
        morning: slotsData.occupied.morning,
        afternoon: slotsData.occupied.afternoon,
        total: slotsData.occupied.total
      }
    };
    
    // Incluir todos los slots si se solicita mostrar ocupados
    if (showOccupied === 'true' && slotsData.slots) {
      response.slots = slotsData.slots;
    }
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error al obtener horarios disponibles:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener horarios disponibles'
    });
  }
};

export const createAppointment: Controller = async (req, res) => {
  try {
    const { clientName, socialWork, phone, date, time, description, email } = req.body;
    
    console.log('Solicitud de creación de cita:', { clientName, socialWork, phone, date, time });
    
    if (!clientName || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, teléfono, fecha y hora son requeridos'
      });
    }
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }
    
    // Validar formato de hora
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido. Use HH:MM'
      });
    }
    
    // Crear fecha y hora de inicio
    const startDateTime = new Date(`${date}T${time}:00`);
    
    // Verificar que la fecha no esté en el pasado
    const now = new Date();
    if (startDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden agendar citas en el pasado'
      });
    }
    
    // Crear fecha y hora de fin (30 minutos después)
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
    
    // Verificar si el horario está disponible
    const existingEvents = await calendarService.listEvents(config.google.calendarId!, new Date(date));
    const busySlots = existingEvents
      .filter(event => event.start?.dateTime && event.end?.dateTime)
      .map(event => ({
        start: new Date(event.start!.dateTime!),
        end: new Date(event.end!.dateTime!)
      }));
    
    const isSlotBusy = busySlots.some(busySlot => 
      (startDateTime >= busySlot.start && startDateTime < busySlot.end) ||
      (endDateTime > busySlot.start && endDateTime <= busySlot.end) ||
      (startDateTime <= busySlot.start && endDateTime >= busySlot.end)
    );
    
    if (isSlotBusy) {
      return res.status(409).json({
        success: false,
        message: 'El horario seleccionado ya está ocupado'
      });
    }
    
    // Crear evento en Google Calendar
    const eventData: any = {
      summary: `Cita médica - ${clientName}`,
      socialWork: socialWork || null,
      description: `Cita médica para ${clientName}. Teléfono: ${phone}${email ? `. Email: ${email}` : ''}${description ? `. Notas: ${description}` : ''}`,

      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: config.google.timezone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: config.google.timezone
      },
      // Sin attendees para evitar el error de permisos
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    console.log('Datos del evento a crear:', eventData);
    
    try {
      console.log('Intentando crear evento en Google Calendar');
      const createdEvent = await calendarService.createEvent(config.google.calendarId!, eventData);
      console.log('Evento creado exitosamente:', createdEvent.id);
      
      // Formatear la respuesta
      const appointmentInfo = {
        id: createdEvent.id,
        summary: createdEvent.summary,
        start: {
          dateTime: createdEvent.start?.dateTime,
          displayTime: new Date(createdEvent.start?.dateTime!).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        end: {
          dateTime: createdEvent.end?.dateTime,
          displayTime: new Date(createdEvent.end?.dateTime!).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        displayDate: new Date(createdEvent.start?.dateTime!).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        patient: {
          name: clientName,
          obrasocial: socialWork || null,
          phone: phone,
          email: email || null
        }
      };
      
      res.status(201).json({
        success: true,
        message: 'Cita agendada exitosamente',
        data: appointmentInfo
      });
    } catch (calendarError) {
      console.error('Error específico de Google Calendar:', calendarError);
      
      res.status(500).json({
        success: false,
        message: 'Error al crear evento en Google Calendar: ' + calendarError.message
      });
    }
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al agendar la cita'
    });
  }
};

export const listAppointments: Controller = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Validar formato de fecha si se proporciona
    if (date && typeof date === 'string' && date.trim() !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
    }
    
    // Determinar la fecha para la cual listar eventos
    let selectedDate: Date;
    if (date && typeof date === 'string' && date.trim() !== '') {
      selectedDate = new Date(date);
    } else {
      selectedDate = new Date();
    }
    
    // Obtener eventos
    const events = await calendarService.listEvents(config.google.calendarId!, selectedDate);
    
    // Formatear eventos para la respuesta
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      created: event.created,
      updated: event.updated,
      status: event.status
    }));
    
    res.status(200).json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      events: formattedEvents
    });
  } catch (error: any) {
    console.error('Error al listar eventos:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al listar eventos'
    });
  }
};

export const deleteAppointment: Controller = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento requerido'
      });
    }
    
    console.log(`Intentando eliminar cita con ID: ${id}`);
    
    try {
      // Primero verificamos que el evento existe
      const event = await calendarService.getEvent(config.google.calendarId!, id);
      console.log('Evento encontrado:', event.id);
    } catch (eventError) {
      console.error('Error al buscar el evento:', eventError);
      return res.status(404).json({
        success: false,
        message: 'No se encontró la cita con el ID proporcionado'
      });
    }
    
    // Si llegamos aquí, el evento existe, procedemos a eliminarlo
    await calendarService.deleteEvent(config.google.calendarId!, id);
    
    res.status(200).json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });
  } catch (error: any) {
    console.error('Error al cancelar cita:', error);
    
    // Determinar el tipo de error para dar una respuesta más específica
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la cita con el ID proporcionado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al cancelar la cita'
    });
  }
};

export const getWeeklySlots: Controller = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    // Determinar la fecha de inicio
    let start: Date;
    if (startDate && typeof startDate === 'string' && startDate.trim() !== '') {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de inicio inválida'
        });
      }
    } else {
      // Si no se proporciona fecha, usar la fecha actual
      start = new Date();
    }
    
    // Resetear la hora a 00:00:00
    start.setHours(0, 0, 0, 0);
    
    // Generar array de 7 días a partir de la fecha de inicio
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }
    
    // Obtener slots para cada día
    const weeklySlots: WeeklySlotDay[] = [];
    for (const day of weekDays) {
      // Obtener eventos existentes
      const existingEvents = await calendarService.listEvents(config.google.calendarId!, day);
      
      // Obtener slots disponibles
      const daySlots = await appointmentService.getAvailableTimeSlots(
        day.toISOString().split('T')[0],
        existingEvents
      );
      
      // Simplificar la respuesta para incluir solo lo necesario
      weeklySlots.push({
        date: daySlots.date,
        displayDate: daySlots.displayDate,
        dayOfWeek: new Date(daySlots.date).toLocaleDateString('es-ES', { weekday: 'long' }),
        availableCount: daySlots.available.total,
        occupiedCount: daySlots.occupied.total,
        // Incluir solo los slots disponibles
        availableSlots: [...daySlots.available.morning, ...daySlots.available.afternoon]
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      });
    }
    
    const response: WeeklySlotResponse = {
      success: true,
      startDate: start.toISOString().split('T')[0],
      endDate: weekDays[6].toISOString().split('T')[0],
      days: weeklySlots
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error al obtener horarios semanales:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener horarios semanales'
    });
  }
};