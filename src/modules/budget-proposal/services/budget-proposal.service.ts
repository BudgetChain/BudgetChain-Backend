import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BudgetProposalImpl } from '../../repository/budget-proposal.repository';
import { BudgetProposal } from '../entities/budget-proposal.entity';
import { CreateBudgetProposalDto } from '../entities/dto/create-budget-proposal.dto';
import { UpdateBudgetProposalDto } from '../entities/dto/update-budget-proposal.dto';
import { BudgetProposalStatus } from '../entities/budget-proposal.entity';
import { User } from '../../user/entities/user.entity';
import { TreasuryService } from '../../treasury/services/treasury.service';
import { AddCommentDto } from '../entities/dto/add-comment.dto';

@Injectable()
export class BudgetProposalService {
  constructor(
    private readonly budgetProposalRepository: BudgetProposalImpl,
    private readonly treasuryService: TreasuryService
  ) {}

  async create(
    createDto: CreateBudgetProposalDto,
    user: User
  ): Promise<BudgetProposal> {
    // Validate treasury exists
    await this.treasuryService.findOne(createDto.treasuryId);

    const proposal = this.budgetProposalRepository.create({
      ...createDto,
      submitterId: user.id,
      status: BudgetProposalStatus.DRAFT,
    });

    return this.budgetProposalRepository.save(proposal);
  }

  async findAll(
    treasuryId?: string,
    status?: BudgetProposalStatus,
    submitterId?: string,
    search?: string
  ): Promise<BudgetProposal[]> {
    return this.budgetProposalRepository.findWithFilters(
      treasuryId,
      status,
      submitterId,
      search
    );
  }

  async findOne(id: string): Promise<BudgetProposal> {
    const proposal =
      await this.budgetProposalRepository.findByIdWithRelations(id);
    if (!proposal) {
      throw new NotFoundException(`Budget proposal with ID ${id} not found`);
    }
    return proposal;
  }

  async update(
    id: string,
    updateDto: UpdateBudgetProposalDto,
    user: User
  ): Promise<BudgetProposal> {
    const proposal = await this.findOne(id);

    // Check if user is the submitter (for draft updates)
    if (
      proposal.status === BudgetProposalStatus.DRAFT &&
      proposal.submitterId !== user.id
    ) {
      throw new BadRequestException(
        'Only the submitter can update a draft proposal'
      );
    }

    // Prevent certain updates based on status
    if (
      proposal.status === BudgetProposalStatus.APPROVED ||
      proposal.status === BudgetProposalStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot update an approved or rejected proposal'
      );
    }

    Object.assign(proposal, updateDto);
    return this.budgetProposalRepository.save(proposal);
  }

  async submitForReview(id: string, user: User): Promise<BudgetProposal> {
    const proposal = await this.findOne(id);

    // Only the submitter can submit for review
    if (proposal.submitterId !== user.id) {
      throw new BadRequestException(
        'Only the submitter can submit a proposal for review'
      );
    }

    // Validate required fields
    if (
      !proposal.categories ||
      proposal.categories.length === 0 ||
      !proposal.metrics ||
      proposal.metrics.length === 0
    ) {
      throw new BadRequestException(
        'Proposal must have at least one category and one metric before submission'
      );
    }

    proposal.status = BudgetProposalStatus.SUBMITTED;
    proposal.submissionDate = new Date();
    return this.budgetProposalRepository.save(proposal);
  }

  async changeStatus(
    id: string,
    status: BudgetProposalStatus,
    allocatedAmount?: number
  ): Promise<BudgetProposal> {
    const proposal = await this.findOne(id);

    if (
      status === BudgetProposalStatus.APPROVED &&
      allocatedAmount === undefined
    ) {
      throw new BadRequestException(
        'Allocated amount is required when approving a proposal'
      );
    }

    proposal.status = status;
    if (allocatedAmount !== undefined) {
      proposal.allocatedAmount = allocatedAmount;
    }
    proposal.approvalDate = new Date();

    return this.budgetProposalRepository.save(proposal);
  }

  async addComment(
    id: string,
    addCommentDto: AddCommentDto,
    user: User
  ): Promise<BudgetProposal> {
    const proposal = await this.findOne(id);

    if (!proposal.comments) {
      proposal.comments = [];
    }

    proposal.comments.push({
      content: addCommentDto.content,
      author: user,
      authorId: user.id,
      createdAt: new Date(),
    } as any);

    return this.budgetProposalRepository.save(proposal);
  }

  async remove(id: string, user: User): Promise<void> {
    const proposal = await this.findOne(id);

    // Only the submitter can delete a draft proposal
    if (
      proposal.status !== BudgetProposalStatus.DRAFT ||
      proposal.submitterId !== user.id
    ) {
      throw new BadRequestException(
        'Only draft proposals can be deleted, and only by the submitter'
      );
    }

    await this.budgetProposalRepository.remove(proposal);
  }
}
