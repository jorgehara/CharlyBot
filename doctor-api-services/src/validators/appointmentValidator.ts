interface ValidationErrors {
    [key: string]: string;
}

export const validateAppointment = (data: any, isUpdate: boolean = false): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    // Si es una actualización, no todos los campos son requeridos
    if (!isUpdate) {
        if (!data.clientName) {
            errors.clientName = 'El nombre del cliente es requerido';
        }
        if (!data.phone) {
            errors.phone = 'El teléfono es requerido';
        }
        if (!data.date) {
            errors.date = 'La fecha es requerida';
        }
        if (!data.time) {
            errors.time = 'La hora es requerida';
        }
    }

    // Validaciones de formato si los campos están presentes
    if (data.clientName && (typeof data.clientName !== 'string' || data.clientName.length < 2)) {
        errors.clientName = 'El nombre del cliente debe tener al menos 2 caracteres';
    }    if (data.phone && !/^\+?[0-9]{10,15}$/.test(data.phone)) {
        errors.phone = 'El formato del teléfono no es válido (debe contener entre 10 y 15 dígitos, puede incluir el + inicial)';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'El formato del email no es válido';
    }

    if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
        errors.date = 'La fecha debe estar en formato YYYY-MM-DD';
    }

    if (data.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
        errors.time = 'La hora debe estar en formato HH:MM';
    }

    if (data.status && !['pending', 'confirmed', 'cancelled'].includes(data.status)) {
        errors.status = 'El estado debe ser pending, confirmed o cancelled';
    }

    return Object.keys(errors).length > 0 ? errors : null;
};
