import { Request, Response } from 'express';
import { calendarService, appointmentService } from '../services';
import config from '../config';
import { Controller } from '../types/express';

export const getAvailableSlots: Controller = async (req, res) => {
  try {
    const { date } = req.query;
    console.log(`Solicitud de horarios para fecha: ${date || 'hoy'}`);
    
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
    
    // Determinar la fecha para la cual buscar horarios
    let selectedDate: Date;
    if (date && typeof date === 'string' && date.trim() !== '') {
      selectedDate = new Date(date);
    } else {
      selectedDate = new Date();
    }
    
    // Obtener eventos existentes
    const existingEvents = await calendarService.listEvents(config.google.calendarId!, selectedDate);
    
    // Obtener slots disponibles
    const availableSlots = await appointmentService.getAvailableTimeSlots(
      date as string | undefined,
      existingEvents
    );
    
    res.status(200).json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      slots: availableSlots
    });
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
    const { clientName, date, time, phone } = req.body;
    
    if (!clientName || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, fecha y hora son requeridos'
      });
    }
    
    console.log(`Solicitud para crear evento: ${clientName}, ${date}, ${time}`);
    
    // Crear fecha y hora de inicio
    const startTime = new Date(`${date}T${time}`);
    
    // Crear fecha y hora de fin (30 minutos después)
    const endTime = new Date(startTime.getTime() + 30 * 60000);
    
    const event = await calendarService.createEvent(config.google.calendarId!, {
      summary: `Cita - ${clientName}`,
      description: `Cita agendada por: ${clientName}\nTeléfono: ${phone || 'No proporcionado'}`,
      start: { 
        dateTime: startTime.toISOString(),
        timeZone: config.google.timezone
      },
      end: { 
        dateTime: endTime.toISOString(),
        timeZone: config.google.timezone
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Cita agendada exitosamente',
      data: {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end
      }
    });
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la cita'
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
    
    await calendarService.deleteEvent(config.google.calendarId!, id);
    
    res.status(200).json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });
  } catch (error: any) {
    console.error('Error al cancelar cita:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al cancelar la cita'
    });
  }
};