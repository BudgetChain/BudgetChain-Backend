import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { JwtConfigService } from './jwt-config.service';
import { LoggingService } from './logging.service';
import configuration from './configuration';

@Global() // Make this module global so its providers are available everywhere
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, JwtConfigService, LoggingService], // Register LoggingService
  exports: [ConfigService, JwtConfigService, LoggingService], // Export LoggingService
})
export class ConfigModule {}
