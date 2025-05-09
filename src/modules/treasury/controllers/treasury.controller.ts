import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { TreasuryService } from '../services/treasury.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { CreateTreasuryDto } from '../dto/create-treasury.dto';
import { UpdateTreasuryDto } from '../dto/update-treasury.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Treasuries')
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  /**
   * Create a new treasury
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new treasury' })
  @ApiBody({ type: CreateTreasuryDto })
  @ApiResponse({ status: 201, description: 'Treasury created' })
  async createTreasury(@Body() dto: CreateTreasuryDto) {
    return this.treasuryService.create(dto);
  }

  /**
   * Get treasury by ID
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get treasury by ID' })
  @ApiResponse({ status: 200, description: 'Treasury found' })
  async getTreasuryById(@Param('id') id: string) {
    return this.treasuryService.findOne(id);
  }

  /**
   * Update treasury by ID
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update treasury by ID' })
  @ApiBody({ type: UpdateTreasuryDto })
  @ApiResponse({ status: 200, description: 'Treasury updated' })
  async updateTreasury(
    @Param('id') id: string,
    @Body() dto: UpdateTreasuryDto
  ) {
    return this.treasuryService.update(id, dto);
  }

  /**
   * Delete treasury by ID
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete treasury by ID' })
  @ApiResponse({ status: 204, description: 'Treasury deleted' })
  async deleteTreasury(@Param('id') id: string) {
    await this.treasuryService.delete(id);
    return;
  }

  /**
   * Get treasury overview with balances, allocations, and recent activity
   */
  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get treasury overview' })
  @ApiResponse({ status: 200, description: 'Treasury overview retrieved' })
  async getTreasuryOverview() {
    return this.treasuryService.getTreasuryOverview();
  }

  /**
   * Calculate risk metrics for the treasury
   */
  @Get('risk-metrics')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Calculate risk metrics for the treasury' })
  @ApiResponse({ status: 200, description: 'Risk metrics calculated' })
  async calculateRiskMetrics() {
    return this.treasuryService.calculateRiskMetrics();
  }

  /**
   * Process a deposit
   */
  @Post('deposit')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Process a deposit' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        assetId: { type: 'string' },
        amount: { type: 'string' },
        fromAddress: { type: 'string', nullable: true },
        blockchainTxHash: { type: 'string', nullable: true },
        metadata: {
          type: 'object',
          additionalProperties: true,
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Deposit processed' })
  async processDeposit(
    @Body()
    depositData: {
      assetId: string;
      amount: string;
      fromAddress?: string;
      blockchainTxHash?: string;
      metadata?: Record<string, any>;
    }
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
  @ApiOperation({ summary: 'Process a withdrawal' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        assetId: { type: 'string' },
        amount: { type: 'string' },
        toAddress: { type: 'string' },
        blockchainTxHash: { type: 'string', nullable: true },
        metadata: {
          type: 'object',
          additionalProperties: true,
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Withdrawal processed' })
  async processWithdrawal(
    @Body()
    withdrawalData: {
      assetId: string;
      amount: string;
      toAddress: string;
      blockchainTxHash?: string;
      metadata?: Record<string, any>;
    }
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
  @ApiOperation({ summary: 'Approve a budget' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approverId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Budget approved' })
  async approveBudget(
    @Param('id') budgetId: string,
    @Body() data: { approverId: string }
  ) {
    return this.treasuryService.processBudgetApproval(
      budgetId,
      data.approverId
    );
  }

  /**
   * Approve an allocation
   */
  @Post('allocation/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Approve an allocation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approverId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Allocation approved' })
  async approveAllocation(
    @Param('id') allocationId: string,
    @Body() data: { approverId: string }
  ) {
    return this.treasuryService.processAllocationApproval(
      allocationId,
      data.approverId
    );
  }

  /**
   * Create a budget with allocation
   */
  @Post('budget-with-allocation')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Create a budget with allocation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        budget: { type: 'object', additionalProperties: true },
        allocation: { type: 'object', additionalProperties: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Budget with allocation created' })
  async createBudgetWithAllocation(
    @Body() data: { budget: any; allocation: any }
  ) {
    return this.treasuryService.createBudgetWithAllocation(
      data.budget,
      data.allocation
    );
  }

  /**
   * Generate audit report
   */
  @Get('audit')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Generate audit report' })
  @ApiResponse({ status: 200, description: 'Audit report generated' })
  async generateAuditReport(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string
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
  @ApiOperation({ summary: 'Run treasury housekeeping tasks' })
  @ApiResponse({ status: 200, description: 'Housekeeping tasks completed' })
  async performHousekeeping() {
    return this.treasuryService.performHousekeeping();
  }
}
