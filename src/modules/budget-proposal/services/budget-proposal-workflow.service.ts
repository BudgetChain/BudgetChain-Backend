import { Injectable } from '@nestjs/common';
import { BudgetProposalService } from './budget-proposal.service';
import { BudgetProposal } from '../entities/budget-proposal.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class BudgetProposalWorkflowService {
  constructor(private readonly budgetProposalService: BudgetProposalService) {}

  async startNewProposal(
    treasuryId: string,
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.create(
      {
        treasuryId,
        name: 'New Budget Proposal',
        description: '',
        department: '',
        startDate: new Date(),
        endDate: new Date(),
        requestedAmount: 0,
        categories: [],
        metrics: [],
      },
      user
    );
  }

  async addBasicInfo(
    id: string,
    name: string,
    description: string,
    department: string,
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(
      id,
      { name, description, department },
      user
    );
  }

  async setDates(
    id: string,
    startDate: Date,
    endDate: Date,
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(id, { startDate, endDate }, user);
  }

  async setAmount(
    id: string,
    requestedAmount: number,
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(id, { requestedAmount }, user);
  }

  async addCategories(
    id: string,
    categories: any[],
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(id, { categories }, user);
  }

  async addMetrics(
    id: string,
    metrics: any[],
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(id, { metrics }, user);
  }

  async addDocuments(
    id: string,
    documents: string[],
    user: User
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(
      id,
      { supportingDocuments: documents },
      user
    );
  }

  async completeProposal(id: string, user: User): Promise<BudgetProposal> {
    return this.budgetProposalService.submitForReview(id, user);
  }
}
