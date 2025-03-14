import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Consultorio Médico',
      version: '1.0.0',
      description: 'API para gestión de citas médicas y pacientes',
      contact: {
        name: 'Soporte',
        email: 'soporte@consultorio.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        TimeSlot: {
          type: 'object',
          properties: {
            time: {
              type: 'string',
              format: 'date-time',
              description: 'Hora del turno en formato ISO'
            },
            displayTime: {
              type: 'string',
              description: 'Hora del turno formateada para mostrar'
            },
            displayDate: {
              type: 'string',
              description: 'Fecha del turno formateada para mostrar'
            },
            period: {
              type: 'string',
              enum: ['mañana', 'tarde'],
              description: 'Período del día (mañana o tarde)'
            },
            status: {
              type: 'string',
              enum: ['disponible', 'ocupado'],
              description: 'Estado del turno'
            }
          }
        },
        AppointmentRequest: {
          type: 'object',
          required: ['clientName', 'phone', 'date', 'time'],
          properties: {
            clientName: {
              type: 'string',
              description: 'Nombre del paciente'
            },
            phone: {
              type: 'string',
              description: 'Teléfono del paciente'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del paciente (opcional)'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Fecha de la cita (YYYY-MM-DD)'
            },
            time: {
              type: 'string',
              description: 'Hora de la cita (HH:MM)'
            },
            description: {
              type: 'string',
              description: 'Descripción o motivo de la cita (opcional)'
            }
          }
        },
        PatientRequest: {
          type: 'object',
          required: ['name', 'phone'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del paciente'
            },
            phone: {
              type: 'string',
              description: 'Teléfono del paciente'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del paciente (opcional)'
            },
            birthdate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento (opcional)'
            },
            address: {
              type: 'string',
              description: 'Dirección del paciente (opcional)'
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales (opcional)'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  // Ruta para la documentación de Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Ruta para obtener el JSON de Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Documentación Swagger disponible en /api-docs');
} 