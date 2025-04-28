import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class LoggingService implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    this.printMessage('log', message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.printMessage('error', message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.printMessage('warn', message, ...optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.printMessage('debug', message, ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.printMessage('verbose', message, ...optionalParams);
  }

  private printMessage(
    level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
    message: unknown,
    ...optionalParams: unknown[]
  ) {
    const timestamp = new Date().toISOString();
    const contextTag = this.context ? `[${this.context}] ` : '';
    // ensure message is a string
    const main =
      typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    // turn params into strings too
    const rest = optionalParams
      .map(p => (typeof p === 'string' ? p : JSON.stringify(p, null, 2)))
      .join(' ');
    const payload = rest ? `${main} ${rest}` : main;
    const output = `[${timestamp}] ${level.toUpperCase()} ${contextTag}${payload}`;

    // console.log only sees a single string, so no spread of any[]
    console.log(output);
  }
}
