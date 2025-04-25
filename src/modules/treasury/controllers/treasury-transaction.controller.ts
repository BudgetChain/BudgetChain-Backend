import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TreasuryTransactionService } from '../services/treasury-transaction.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import {
  TransactionStatus,
  TransactionType,
} from '../entities/asset-transaction.entity';

@Controller('treasury/transactions')
export class TreasuryTransactionController {
  constructor(
    private readonly transactionService: TreasuryTransactionService
  ) {}

  /**
   * Get all transactions with optional filtering
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async findAll(
    @Query('assetId') assetId?: string,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('fromDate') fromDate?: Date,
    @Query('toDate') toDate?: Date
  ) {
    return this.transactionService.findAll(
      assetId,
      type,
      status,
      fromDate,
      toDate
    );
  }

  /**
   * Get transaction by ID
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async findById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  /**
   * Record a deposit
   */
  @Post('deposit')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @HttpCode(HttpStatus.CREATED)
  async recordDeposit(
    @Body()
    data: {
      assetId: string;
      amount: string;
      fromAddress?: string;
      blockchainTxHash?: string;
      metadata?: Record<string, any>;
    }
  ) {
    return this.transactionService.recordDeposit(
      data.assetId,
      data.amount,
      data.fromAddress,
      data.blockchainTxHash,
      data.metadata
    );
  }

  /**
   * Record a withdrawal
   */
  @Post('withdrawal')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @HttpCode(HttpStatus.CREATED)
  async recordWithdrawal(
    @Body()
    data: {
      assetId: string;
      amount: string;
      toAddress: string;
      blockchainTxHash?: string;
      metadata?: Record<string, any>;
    }
  ) {
    return this.transactionService.recordWithdrawal(
      data.assetId,
      data.amount,
      data.toAddress,
      data.blockchainTxHash,
      data.metadata
    );
  }

  /**
   * Update transaction status
   */
  @Post(':id/status')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body()
    data: {
      status: TransactionStatus;
      blockNumber?: string;
    }
  ) {
    return this.transactionService.updateTransactionStatus(
      id,
      data.status,
      data.blockNumber
    );
  }

  /**
   * Process pending transactions
   */
  @Post('process-pending')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async processPendingTransactions() {
    return this.transactionService.processPendingTransactions();
  }

  /**
   * Calculate transaction volume for a specific period
   */
  @Get('volume')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.AUDITOR)
  async calculateTransactionVolume(
    @Query('assetId') assetId?: string,
    @Query('fromDate') fromDate?: Date,
    @Query('toDate') toDate?: Date
  ) {
    return this.transactionService.calculateTransactionVolume(
      assetId,
      fromDate,
      toDate
    );
  }
}
