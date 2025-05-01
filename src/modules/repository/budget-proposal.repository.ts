import { Repository } from 'typeorm';
import { BudgetProposal } from '../budget-proposal/entities/budget-proposal.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface BudgetProposalRepository extends Repository<BudgetProposal> {
  findByTreasuryId(treasuryId: string): Promise<BudgetProposal[]>;
  findWithFilters(
    treasuryId?: string,
    status?: string,
    submitterId?: string,
    search?: string
  ): Promise<BudgetProposal[]>;
  findByIdWithRelations(id: string): Promise<BudgetProposal | null>;
}

@Injectable()
export class BudgetProposalImpl
  extends Repository<BudgetProposal>
  implements BudgetProposalRepository
{
  constructor(
    @InjectRepository(BudgetProposal)
    private readonly repo: Repository<BudgetProposal>
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  // Create
  async createBudgetProposal(
    budget_proposal: Partial<BudgetProposal>
  ): Promise<BudgetProposal> {
    const newBudgetProposal = this.repo.create(budget_proposal);
    return this.repo.save(newBudgetProposal);
  }

  // Read (Single)
  async findById(id: string): Promise<BudgetProposal | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Read (Multiple)
  async findAll(): Promise<BudgetProposal[]> {
    return this.repo.find();
  }

  // Read (Custom)
  async findByTreasuryId(treasuryId: string): Promise<BudgetProposal[]> {
    return this.repo.find({ where: { treasuryId  } });
  }

  //   find with filters
  async findWithFilters(
    treasuryId?: string,
    status?: string,
    submitterId?: string,
    search?: string
  ): Promise<BudgetProposal[]> {
    const query = this.createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.categories', 'categories')
      .leftJoinAndSelect('proposal.metrics', 'metrics')
      .leftJoinAndSelect('proposal.comments', 'comments')
      .leftJoinAndSelect('proposal.submitter', 'submitter');

    if (treasuryId) {
      query.andWhere('proposal.treasuryId = :treasuryId', { treasuryId });
    }

    if (status) {
      query.andWhere('proposal.status = :status', { status });
    }

    if (submitterId) {
      query.andWhere('proposal.submitterId = :submitterId', { submitterId });
    }

    if (search) {
      query.andWhere(
        '(proposal.name LIKE :search OR proposal.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    return query.getMany();
  }

  //   Find with relations
  async findByIdWithRelations(id: string): Promise<BudgetProposal | null> {
    return this.createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.categories', 'categories')
      .leftJoinAndSelect('proposal.metrics', 'metrics')
      .leftJoinAndSelect('proposal.comments', 'comments')
      .leftJoinAndSelect('proposal.submitter', 'submitter')
      .where('proposal.id = :id', { id })
      .getOne();
  }

  // Update
  async updateBudgetProposal(
    id: string,
    updateData: Partial<BudgetProposal>
  ): Promise<BudgetProposal | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  // Delete
  async deleteBudgetProposal(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
