import { Injectable } from '@nestjs/common';
import { BudgetProposalWorkflowService } from './budget-proposal-workflow.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class BudgetProposalTemplateService {
  constructor(
    private readonly workflowService: BudgetProposalWorkflowService
  ) {}

  async createFromMarketingTemplate(treasuryId: string, user: User) {
    const proposal = await this.workflowService.startNewProposal(
      treasuryId,
      user
    );

    await this.workflowService.addBasicInfo(
      proposal.id,
      'Marketing Campaign Budget',
      'Budget for upcoming marketing campaigns',
      'Marketing',
      user
    );

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + 3);

    await this.workflowService.setDates(proposal.id, now, endDate, user);
    await this.workflowService.setAmount(proposal.id, 50000, user);

    await this.workflowService.addCategories(
      proposal.id,
      [
        {
          name: 'Digital Ads',
          amount: 20000,
          description: 'Facebook, Google, and LinkedIn ads',
        },
        {
          name: 'Content Creation',
          amount: 15000,
          description: 'Blog posts, videos, and graphics',
        },
        {
          name: 'Events',
          amount: 10000,
          description: 'Trade shows and webinars',
        },
        {
          name: 'Miscellaneous',
          amount: 5000,
          description: 'Unexpected expenses',
        },
      ],
      user
    );

    await this.workflowService.addMetrics(
      proposal.id,
      [
        {
          name: 'Expected Leads',
          value: '1000',
          description: 'Number of leads expected from campaigns',
        },
        {
          name: 'ROI',
          value: '3.5',
          description: 'Expected return on investment',
        },
      ],
      user
    );

    return this.workflowService.completeProposal(proposal.id, user);
  }
}
