import { Controller, Post, Get, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@Controller('transactions')
@UseGuards(RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createTransaction(
    @Request() req,
    @Body() body: {
      date: Date;
      description: string;
      category: string;
      ledgerEntries: { accountId: number; type: 'debit' | 'credit'; amount: number }[];
      metadata?: any;
    },
  ) {
    return this.transactionService.createTransaction(
      req.user,
      body.date,
      body.description,
      body.category,
      body.ledgerEntries,
      body.metadata,
    );
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateTransaction(
    @Param('id') id: number,
    @Request() req,
    @Body() body: {
      date?: Date;
      description?: string;
      category?: string;
      ledgerEntries?: { accountId: number; type: 'debit' | 'credit'; amount: number }[];
      metadata?: any;
    },
  ) {
    return this.transactionService.updateTransaction(
      id,
      req.user,
      body.date,
      body.description,
      body.category,
      body.ledgerEntries,
      body.metadata,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteTransaction(@Param('id') id: number, @Request() req) {
    await this.transactionService.deleteTransaction(id, req.user);
    return { message: 'Transaction deleted successfully' };
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  async getTransactions(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('category') category?: string,
    @Query('accountId') accountId?: number,
    @Query('description') description?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const filters = { startDate, endDate, category, accountId, description };
    return this.transactionService.findTransactions(filters, page, limit);
  }

  @Post('reconcile')
  @Roles(UserRole.ADMIN)
  async reconcileTransactions() {
    await this.transactionService.reconcileTransactions();
    return { message: 'Reconciliation completed' };
  }

  @Get('report')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async generateReport(@Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {
    return this.transactionService.generateReport(startDate, endDate);
  }
}