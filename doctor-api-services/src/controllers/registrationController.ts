import { Request, Response } from 'express';
import { sheetsService } from '../services';
import config from '../config';
import { Controller } from '../types/express';

export const registerPatient: Controller = async (req, res) => {
  try {
    const { name, phone, email, birthdate, address, notes } = req.body;
    
    // Validar datos requeridos
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y teléfono son campos requeridos'
      });
    }
    
    // Preparar datos para Google Sheets
    const rowData = [
      new Date().toISOString(), // Fecha de registro
      name,
      phone,
      email || '',
      birthdate || '',
      address || '',
      notes || ''
    ];
    
    // Agregar a Google Sheets
    await sheetsService.appendRow(
      config.google.patientsSheetId!,
      'Pacientes!A:G',
      rowData
    );
    
    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: {
        name,
        phone,
        email,
        registrationDate: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error al registrar paciente:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar paciente'
    });
  }
};