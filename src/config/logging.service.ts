import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.printMessage('log', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.printMessage('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.printMessage('warn', message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.printMessage('debug', message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.printMessage('verbose', message, ...optionalParams);
  }

  private printMessage(level: string, message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${level.toUpperCase()} `;

    if (this.context) {
      logMessage += `[${this.context}] `;
    }

    logMessage += message;

    if (optionalParams.length > 0) {
      logMessage += ` ${optionalParams.join(' ')}`;
    }

    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to send logs to a centralized logging system
      // (e.g., using Winston, Morgan, or a cloud logging service)
      console.log(logMessage); // Or send to your logging service
    } else {
      // In development, you can simply print to the console
      console.log(logMessage);
    }
  }
}
