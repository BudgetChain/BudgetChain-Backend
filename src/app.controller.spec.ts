import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingService } from './config/logging.service';

// Create a mock LoggingService
const mockLoggingService = {
  setContext: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // Provide the mock LoggingService
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should log messages when getHello is called', () => {
      appController.getHello();

      expect(mockLoggingService.setContext).toHaveBeenCalledWith('AppService');
      expect(mockLoggingService.log).toHaveBeenCalledWith('Doing something...');
      expect(mockLoggingService.debug).toHaveBeenCalledWith(
        'Debugging information...',
      );
      expect(mockLoggingService.warn).toHaveBeenCalledWith(
        'A warning occurred!',
      );
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        'An error occurred!',
        'Stack trace or error object',
      );
    });
  });
});
