/**
 * Formatea una fecha en formato legible
 * @param dateString Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada (ejemplo: "Lunes, 15 de marzo de 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea una hora en formato legible
 * @param timeString Hora en formato HH:MM
 * @returns Hora formateada (ejemplo: "14:30")
 */
export function formatTime(timeString: string): string {
  return timeString;
} 