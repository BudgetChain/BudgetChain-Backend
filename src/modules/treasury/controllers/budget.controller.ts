import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BudgetService } from '../services/budget.service';
import { AllocationService } from '../services/allocation.service';
import { Budget, BudgetStatus } from '../entities/budget.entity';
import { Allocation } from '../entities/allocation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(
    private budgetService: BudgetService,
    private allocationService: AllocationService,
  ) {}

  @Get()
  async findAll(
    @Query('treasuryId') treasuryId?: string,
    @Query('status') status?: BudgetStatus,
  ): Promise<Budget[]> {
    if (treasuryId) {
      return this.budgetService.findByTreasuryId(treasuryId);
    }
    if (status) {
      return this.budgetService.findByStatus(status);
    }
    return this.budgetService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Budget> {
    return this.budgetService.findById(id);
  }

  @Post()
  async create(
    @Body() budget: Partial<Budget>,
    @CurrentUser() user: any,
  ): Promise<Budget> {
    return this.budgetService.create(budget, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() budget: Partial<Budget>,
    @CurrentUser() user: any,
  ): Promise<Budget> {
    return this.budgetService.update(id, budget, user.id);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.budgetService.delete(id, user.id);
  }

  @Post(':id/submit')
  async submitBudget(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Budget> {
    return this.budgetService.submitBudget(id, user.id);
  }

  @Post(':id/approve')
  async approveBudget(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Budget> {
    return this.budgetService.approveBudget(id, user.id);
  }

  @Post(':id/reject')
  async rejectBudget(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Budget> {
    return this.budgetService.rejectBudget(id, user.id);
  }

  @Get(':id/allocations')
  async getAllocations(@Param('id') budgetId: string): Promise<Allocation[]> {
    return this.allocationService.findByBudgetId(budgetId);
  }

  @Post(':id/allocations')
  async createAllocation(
    @Param('id') budgetId: string,
    @Body() allocation: Partial<Allocation>,
    @CurrentUser() user: any,
  ): Promise<Allocation> {
    allocation.budgetId = budgetId;
    return this.allocationService.create(allocation, user.id);
  }
}
