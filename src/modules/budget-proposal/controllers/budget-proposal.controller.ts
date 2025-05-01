import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BudgetProposalService } from '../services/budget-proposal.service';
import { BudgetProposal } from '../entities/budget-proposal.entity';
import { CreateBudgetProposalDto } from '../entities/dto/create-budget-proposal.dto';
import { UpdateBudgetProposalDto } from '../entities/dto/update-budget-proposal.dto';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { AddCommentDto } from '../entities/dto/add-comment.dto';
import { BudgetProposalStatus } from '../entities/budget-proposal.entity';

@Controller('budget-proposals')
export class BudgetProposalController {
  constructor(private readonly budgetProposalService: BudgetProposalService) {}

  @Post()
  @Roles(UserRole.USER)
  create(
    @Body() createBudgetProposalDto: CreateBudgetProposalDto,
    @Req() req
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.create(createBudgetProposalDto, req.user);
  }

  @Get()
  @Roles(UserRole.USER)
  findAll(
    @Query('treasuryId') treasuryId?: string,
    @Query('status') status?: BudgetProposalStatus,
    @Query('submitterId') submitterId?: string,
    @Query('search') search?: string
  ): Promise<BudgetProposal[]> {
    return this.budgetProposalService.findAll(
      treasuryId,
      status,
      submitterId,
      search
    );
  }

  @Get(':id')
  @Roles(UserRole.USER)
  findOne(@Param('id') id: string): Promise<BudgetProposal> {
    return this.budgetProposalService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.USER)
  update(
    @Param('id') id: string,
    @Body() updateBudgetProposalDto: UpdateBudgetProposalDto,
    @Req() req
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.update(
      id,
      updateBudgetProposalDto,
      req.user
    );
  }

  @Post(':id/submit')
  @Roles(UserRole.USER)
  submitForReview(
    @Param('id') id: string,
    @Req() req
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.submitForReview(id, req.user);
  }

  @Put(':id/status')
  @Roles(UserRole.USER)
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: BudgetProposalStatus,
    @Body('allocatedAmount') allocatedAmount?: number
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.changeStatus(id, status, allocatedAmount);
  }

  @Post(':id/comments')
  @Roles(UserRole.USER)
  addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @Req() req
  ): Promise<BudgetProposal> {
    return this.budgetProposalService.addComment(id, addCommentDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.USER)
  remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.budgetProposalService.remove(id, req.user);
  }
}
