import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TreasuryAllocationService } from '../services/treasury-allocation.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';

@Controller('treasury/allocations')
export class TreasuryAllocationController {
  constructor(private readonly allocationService: TreasuryAllocationService) {}

  /**
   * Get all allocations with optional filtering
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async findAll(
    @Query('budgetId') budgetId?: string,
    @Query('assetId') assetId?: string,
    @Query('status') status?: AllocationStatus,
    @Query('recipientId') recipientId?: string,
  ) {
    return this.allocationService.findAll(budgetId, assetId, status, recipientId);
  }

  /**
   * Get allocation by ID
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async findById(@Param('id') id: string) {
    return this.allocationService.findById(id);
  }

  /**
   * Create a new allocation
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() allocationData: Partial<Allocation>) {
    return this.allocationService.create(allocationData);
  }

  /**
   * Update an allocation
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async update(
    @Param('id') id: string,
    @Body() allocationData: Partial<Allocation>
  ) {
    return this.allocationService.update(id, allocationData);
  }

  /**
   * Approve an allocation
   */
  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async approveAllocation(
    @Param('id') id: string,
    @Body() data: { approvedBy: string }
  ) {
    return this.allocationService.approveAllocation(id, data.approvedBy);
  }

  /**
   * Reject an allocation
   */
  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async rejectAllocation(
    @Param('id') id: string,
    @Body() data: { rejectedBy: string }
  ) {
    return this.allocationService.rejectAllocation(id, data.rejectedBy);
  }

  /**
   * Cancel an allocation
   */
  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async cancelAllocation(@Param('id') id: string) {
    return this.allocationService.cancelAllocation(id);
  }

  /**
   * Complete an allocation
   */
  @Post(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async completeAllocation(@Param('id') id: string) {
    return this.allocationService.completeAllocation(id);
  }

  /**
   * Process a disbursement from an allocation
   */
  @Post(':id/disburse')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async processDisbursement(
    @Param('id') id: string,
    @Body() data: {
      amount: string;
      blockchainTxHash?: string;
      reference?: string;
      metadata?: Record<string, any>;
    }
  ) {
    return this.allocationService.processDisbursement(
      id,
      data.amount,
      data.blockchainTxHash,
      data.reference,
      data.metadata
    );
  }

  /**
   * Get allocation transactions
   */
  @Get(':id/transactions')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async getAllocationTransactions(@Param('id') id: string) {
    return this.allocationService.getAllocationTransactions(id);
  }

  /**
   * Delete an allocation (only allowed for PENDING status)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.allocationService.delete(id);
  }
}
