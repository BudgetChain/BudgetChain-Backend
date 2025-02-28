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

@Module({
  imports: [UserModule, AiModule, ReportingModule, BlockchainModule, BudgetModule, AuthModule, TreasuryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
