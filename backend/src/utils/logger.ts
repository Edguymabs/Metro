import fs from 'fs';
import path from 'path';

// Niveaux de log
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

class Logger {
  private logDir: string;
  private isDevelopment: boolean;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Créer le répertoire de logs s'il n'existe pas
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private writeToFile(level: LogLevel, formattedMessage: string): void {
    if (this.isDevelopment) return; // Ne pas écrire dans les fichiers en dev
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-${level.toLowerCase()}.log`;
    const filepath = path.join(this.logDir, filename);
    
    fs.appendFile(filepath, formattedMessage + '\n', (err) => {
      if (err) {
        console.error('Erreur d\'écriture du log:', err);
      }
    });
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Toujours afficher dans la console en développement
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
        case LogLevel.DEBUG:
          console.log(formattedMessage);
          break;
      }
    }
    
    // Écrire dans les fichiers en production
    if (!this.isDevelopment) {
      this.writeToFile(level, formattedMessage);
    }
  }

  public error(message: string, error?: Error | any): void {
    const meta = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    this.log(LogLevel.ERROR, message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  public debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  public security(message: string, meta?: any): void {
    // Logs de sécurité toujours enregistrés
    const formattedMessage = this.formatMessage(LogLevel.WARN, `🚨 SECURITY: ${message}`, meta);
    console.warn(formattedMessage);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-security.log`;
    const filepath = path.join(this.logDir, filename);
    
    fs.appendFile(filepath, formattedMessage + '\n', (err) => {
      if (err) {
        console.error('Erreur d\'écriture du log de sécurité:', err);
      }
    });
  }
}

export const logger = new Logger();

