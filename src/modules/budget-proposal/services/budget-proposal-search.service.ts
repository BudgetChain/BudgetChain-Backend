import { Injectable } from '@nestjs/common';
import { BudgetProposalRepository } from '../../repository/budget-proposal.repository';
import {
  BudgetProposal,
  BudgetProposalStatus,
} from '../entities/budget-proposal.entity';
import { Between, Like, FindOptionsWhere } from 'typeorm';

@Injectable()
export class BudgetProposalSearchService {
  constructor(
    private readonly budgetProposalRepository: BudgetProposalRepository
  ) {}

  async search(
    query: string,
    treasuryId?: string,
    status?: BudgetProposalStatus,
    submitterId?: string,
    minAmount?: number,
    maxAmount?: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<BudgetProposal[]> {
    const where: FindOptionsWhere<BudgetProposal> = {};

    if (query) {
      where.name = Like(`%${query}%`);
    }

    if (treasuryId) {
      where.treasuryId = treasuryId;
    }

    if (status) {
      where.status = status;
    }

    if (submitterId) {
      where.submitterId = submitterId;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.requestedAmount = Between(
        minAmount ?? 0,
        maxAmount ?? Number.MAX_SAFE_INTEGER
      );
    }

    if (startDate || endDate) {
      where.startDate = Between(
        startDate ?? new Date(0),
        endDate ?? new Date()
      );
    }

    return this.budgetProposalRepository.find({
      where,
      relations: ['categories', 'metrics', 'comments', 'submitter'],
    });
  }

  async findByDepartment(department: string): Promise<BudgetProposal[]> {
    return this.budgetProposalRepository.find({
      where: { department },
      relations: ['categories', 'metrics', 'comments', 'submitter'],
    });
  }

  async findByStatus(status: string): Promise<BudgetProposal[]> {
    if (
      !Object.values(BudgetProposalStatus).includes(
        status as BudgetProposalStatus
      )
    ) {
      throw new Error(`Invalid status: ${status}`);
    }

    return this.budgetProposalRepository.find({
      where: { status: status as BudgetProposalStatus },
      relations: ['categories', 'metrics', 'comments', 'submitter'],
    });
  }
}
