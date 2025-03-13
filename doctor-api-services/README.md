# API de Servicios para Consultorio Médico

Esta API proporciona endpoints para gestionar citas médicas y registros de pacientes.

## Requisitos

- Node.js 14 o superior
- Cuenta de servicio de Google con acceso a Google Calendar y Google Sheets

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Copiar el archivo `.env.example` a `.env` y configurar las variables de entorno
4. Colocar el archivo `credentials.json` de la cuenta de servicio de Google en la raíz del proyecto
5. Iniciar el servidor: `npm run dev`

## Endpoints

### Citas

- `GET /api/appointments/available-slots` - Obtener horarios disponibles
- `POST /api/appointments` - Crear una nueva cita
- `GET /api/appointments` - Listar citas existentes
- `DELETE /api/appointments/:id` - Cancelar una cita

### Registro

- `POST /api/registration` - Registrar un nuevo usuario

## Ejemplos de uso

### Obtener horarios disponibles



### Crear una cita
