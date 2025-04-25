import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TreasuryBudgetService } from '../services/treasury-budget.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { Budget, BudgetStatus } from '../entities/budget.entity';

@Controller('treasury/budgets')
export class TreasuryBudgetController {
  constructor(private readonly budgetService: TreasuryBudgetService) {}

  /**
   * Get all budgets
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async findAll(
    @Query('status') status?: BudgetStatus,
    @Query('ownerId') ownerId?: string
  ) {
    return this.budgetService.findAll(status, ownerId);
  }

  /**
   * Get budget by ID
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async findById(@Param('id') id: string) {
    return this.budgetService.findById(id);
  }

  /**
   * Create a new budget
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() budgetData: Partial<Budget>) {
    return this.budgetService.create(budgetData);
  }

  /**
   * Update a budget
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async update(@Param('id') id: string, @Body() budgetData: Partial<Budget>) {
    return this.budgetService.update(id, budgetData);
  }

  /**
   * Activate a budget
   */
  @Post(':id/activate')
  @Roles(UserRole.ADMIN)
  async activateBudget(@Param('id') id: string) {
    return this.budgetService.activateBudget(id);
  }

  /**
   * Close a budget
   */
  @Post(':id/close')
  @Roles(UserRole.ADMIN)
  async closeBudget(@Param('id') id: string) {
    return this.budgetService.closeBudget(id);
  }

  /**
   * Get available budget amount
   */
  @Get(':id/available')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async getAvailableBudget(@Param('id') id: string) {
    const availableBudget = await this.budgetService.getAvailableBudget(id);
    return { availableBudget };
  }

  /**
   * Get remaining budget amount
   */
  @Get(':id/remaining')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async getRemainingBudget(@Param('id') id: string) {
    const remainingBudget = await this.budgetService.getRemainingBudget(id);
    return { remainingBudget };
  }

  /**
   * Delete a budget (only allowed for DRAFT status)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.budgetService.delete(id);
  }

  /**
   * Check and update expired budgets
   */
  @Post('check-expired')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async checkAndUpdateExpiredBudgets() {
    const count = await this.budgetService.checkAndUpdateExpiredBudgets();
    return { updatedCount: count };
  }
}
