import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  status: number;
  stack?: string;
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: ErrorResponse = {
    message: err.message || 'Error del servidor',
    status: (err as any).status || 500 // Aseguramos un valor por defecto
  };

  // Agregar stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export default errorHandler;