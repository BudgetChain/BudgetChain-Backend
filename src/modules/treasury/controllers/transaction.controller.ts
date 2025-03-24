import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  async findAll(@Query('treasuryId') treasuryId?: string): Promise<Transaction[]> {
    if (treasuryId) {
      return this.transactionService.findByTreasuryId(treasuryId);
    }
    return this.transactionService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.findById(id);
  }

  @Post()
  async create(@Body() transaction: Partial<Transaction>, @CurrentUser() user: any): Promise<Transaction> {
    return this.transactionService.create(transaction, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() transaction: Partial<Transaction>,
    @CurrentUser() user: any,
  ): Promise<Transaction> {
    return this.transactionService.update(id, transaction, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    return this.transactionService.delete(id, user.id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TransactionStatus,
    @CurrentUser() user: any,
  ): Promise<Transaction> {
    return this.transactionService.update(id, { status }, user.id);
  }
}