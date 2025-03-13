import { Controller } from '../types/express';
import { sheetsService } from '../services';
import config from '../config';

export const registerUser: Controller = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }
    
    const userData = {
      name,
      email,
      phone: phone || 'No proporcionado',
      timestamp: new Date().toISOString()
    };
    
    await sheetsService.appendRow(
      config.google.spreadsheetId!,
      config.google.sheetRange!,
      [userData.name, userData.email, userData.phone, userData.timestamp]
    );
    
    res.status(201).json({
      success: true,
      message: 'Datos registrados correctamente',
      data: userData
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar datos'
    });
  }
};