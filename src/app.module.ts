import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AiModule } from './modules/ai/ai.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { BudgetModule } from './modules/budget/budget.module';
import { AuthModule } from './modules/auth/auth.module';
import { TreasuryModule } from './modules/treasury/treasury.module';
import { ConfigService } from './config/config.service';
import { LoggingService } from './config/logging.service';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/user.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '.env',
      isGlobal: true, // Makes the ConfigService available everywhere
    }),
    UserModule,
    AiModule,
    ReportingModule,
    BlockchainModule,
    BudgetModule,
    AuthModule,
    TreasuryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts, .js}'], // add all entities here
      synchronize: true, // when true: automatically creates the schema in development (make sure to disable in production)
    }),
    TypeOrmModule.forFeature([User]), // add entities in the square bracket
  ],
  exports: [ConfigService, LoggingService],
  controllers: [AppController],
  providers: [AppService, ConfigService, LoggingService],
})
export class AppModule {}
