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
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true, // Makes the ConfigService available everywhere
    }),
    UserModule,
    AiModule,
    ReportingModule,
    BlockchainModule,
    BudgetModule,
    AuthModule,
    TreasuryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
