import { Injectable } from '@nestjs/common';
import { LoggingService } from './config/logging.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggingService) {
    this.logger.setContext(AppService.name); // Set the context
  }
  getHello(): string {
    this.logger.log('Doing something...');
    this.logger.debug('Debugging information...');
    this.logger.warn('A warning occurred!');
    this.logger.error('An error occurred!', 'Stack trace or error object');
    return 'Hello World!';
  }
}
