import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TreasuryService } from '../services/treasury.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  /**
   * Get treasury overview with balances, allocations, and recent activity
   */
  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async getTreasuryOverview() {
    return this.treasuryService.getTreasuryOverview();
  }

  /**
   * Calculate risk metrics for the treasury
   */
  @Get('risk-metrics')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async calculateRiskMetrics() {
    return this.treasuryService.calculateRiskMetrics();
  }

  /**
   * Process a deposit
   */
  @Post('deposit')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async processDeposit(
    @Body() depositData: {
      assetId: string;
      amount: string;
      fromAddress?: string;
      blockchainTxHash?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.treasuryService.processDeposit(
      depositData.assetId,
      depositData.amount,
      depositData.fromAddress,
      depositData.blockchainTxHash,
      depositData.metadata
    );
  }

  /**
   * Process a withdrawal
   */
  @Post('withdrawal')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async processWithdrawal(
    @Body() withdrawalData: {
      assetId: string;
      amount: string;
      toAddress: string;
      blockchainTxHash?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.treasuryService.processWithdrawal(
      withdrawalData.assetId,
      withdrawalData.amount,
      withdrawalData.toAddress,
      withdrawalData.blockchainTxHash,
      withdrawalData.metadata
    );
  }

  /**
   * Approve a budget
   */
  @Post('budget/:id/approve')
  @Roles(UserRole.ADMIN)
  async approveBudget(
    @Param('id') budgetId: string,
    @Body() data: { approverId: string }
  ) {
    return this.treasuryService.processBudgetApproval(budgetId, data.approverId);
  }

  /**
   * Approve an allocation
   */
  @Post('allocation/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async approveAllocation(
    @Param('id') allocationId: string,
    @Body() data: { approverId: string }
  ) {
    return this.treasuryService.processAllocationApproval(allocationId, data.approverId);
  }

  /**
   * Create a budget with allocation
   */
  @Post('budget-with-allocation')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async createBudgetWithAllocation(
    @Body() data: {
      budget: any;
      allocation: any
    }
  ) {
    return this.treasuryService.createBudgetWithAllocation(data.budget, data.allocation);
  }

  /**
   * Generate audit report
   */
  @Get('audit')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async generateAuditReport(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.treasuryService.generateAuditReport(
      new Date(fromDate),
      new Date(toDate || Date.now())
    );
  }

  /**
   * Run treasury housekeeping tasks
   */
  @Post('housekeeping')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async performHousekeeping() {
    return this.treasuryService.performHousekeeping();
  }
}
