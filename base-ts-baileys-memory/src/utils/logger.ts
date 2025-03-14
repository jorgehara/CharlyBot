export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data ? data : '');
  }
  
  static error(message: string, error: any) {
    console.error(`[ERROR] ${message}`, error);
  }
  
  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data ? data : '');
  }
  
  static debug(message: string, data?: any) {
    console.debug(`[DEBUG] ${message}`, data ? data : '');
  }
} 