import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetProposalController } from './controllers/budget-proposal.controller';
import { BudgetProposalService } from './services/budget-proposal.service';
import { BudgetProposalImpl, BudgetProposalRepository } from '../repository/budget-proposal.repository';
import { BudgetProposal } from './entities/budget-proposal.entity';
import { BudgetProposalCategory } from './entities/budget-proposal-category.entity';
import { BudgetProposalMetric } from './entities/budget-proposal-metric.entity';
import { BudgetProposalComment } from './entities/budget-proposal-comment.entity';
import { TreasuryModule } from '../treasury/treasury.module';
import { UserModule } from '../user/user.module';
import { TreasuryService } from '../treasury/services/treasury.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BudgetProposal,
      BudgetProposalCategory,
      BudgetProposalMetric,
      BudgetProposalComment,
    ]),
    TreasuryModule, 
    UserModule,
  ],
  controllers: [BudgetProposalController],
  providers: [BudgetProposalService, BudgetProposalImpl],
  exports: [BudgetProposalService],
})
export class BudgetProposalModule {}

