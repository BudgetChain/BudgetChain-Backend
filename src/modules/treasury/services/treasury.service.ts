import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '../../../config/logging.service';
import { TreasuryAssetService } from './treasury-asset.service';
import { TreasuryTransactionService } from './treasury-transaction.service';
import { TreasuryBudgetService } from './treasury-budget.service';
import { TreasuryAllocationService } from './treasury-allocation.service';
import { formatErrorMessage, BusinessLogicError } from '../../../shared/erros/app-error';
import BigNumber from 'bignumber.js';
import { Asset } from '../entities/asset.entity';
import { TransactionType } from '../entities/asset-transaction.entity';
import { Budget, BudgetStatus } from '../entities/budget.entity';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';

/**
 * Main Treasury Service that coordinates operations across the treasury module.
 * Acts as a facade for underlying services and provides higher-level business operations.
 */
@Injectable()
export class TreasuryService {
  constructor(
    private assetService: TreasuryAssetService,
    private transactionService: TreasuryTransactionService,
    private budgetService: TreasuryBudgetService,
    private allocationService: TreasuryAllocationService,
    @Inject(LoggingService)
    private logger: LoggingService,
  ) {
    this.logger.setContext('TreasuryService');

    // Configure BigNumber for precision
    BigNumber.config({
      DECIMAL_PLACES: 18,
      ROUNDING_MODE: BigNumber.ROUND_DOWN
    });
  }

  /**
   * Get treasury overview with balances, allocations, and recent activity
   */
  async getTreasuryOverview(): Promise<{
    assets: Asset[];
    totalBalance: string;
    allocatedBalance: string;
    availableBalance: string;
    budgetCount: number;
    activeAllocations: number;
    recentTransactions: any[];
  }> {
    try {
      // Get all active assets
      const assets = await this.assetService.findAll();

      // Calculate total and allocated balances
      let totalBalance = new BigNumber(0);
      let allocatedBalance = new BigNumber(0);

      for (const asset of assets) {
        totalBalance = totalBalance.plus(asset.balance);
        allocatedBalance = allocatedBalance.plus(asset.allocatedBalance);
      }

      // Calculate available balance
      const availableBalance = totalBalance.minus(allocatedBalance);

      // Get active budgets count
      const activeBudgets = await this.budgetService.findAll(BudgetStatus.ACTIVE);

      // Get active allocations count
      const activeAllocations = await this.allocationService.findAll(
        undefined, undefined, AllocationStatus.APPROVED
      );

      // Get recent transactions
      const recentTransactions = await this.transactionService.findAll(
        undefined, undefined, undefined,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      );

      return {
        assets,
        totalBalance: totalBalance.toString(),
        allocatedBalance: allocatedBalance.toString(),
        availableBalance: availableBalance.toString(),
        budgetCount: activeBudgets.length,
        activeAllocations: activeAllocations.length,
        recentTransactions: recentTransactions.slice(0, 10), // Limit to 10 recent transactions
      };
    } catch (error) {
      this.logger.error(`Error getting treasury overview: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Calculate risk metrics for the treasury
   */
  async calculateRiskMetrics(): Promise<{
    diversificationScore: number;
    allocationRiskScore: number;
    liquidityRatio: number;
    volatilityIndex?: number;
    riskAssessment: string;
  }> {
    try {
      // Get all assets and their info
      const assets = await this.assetService.findAll();
      const assetCount = assets.length;

      // Calculate diversification score (higher is better)
      // This is a simplified model that considers how evenly funds are distributed
      let diversificationScore = 0;
      if (assetCount > 0) {
        // Calculate total treasury value
        const totalValue = new BigNumber(
          assets.reduce((sum, asset) => sum.plus(new BigNumber(asset.balance)), new BigNumber(0))
        );

        if (!totalValue.isZero()) {
          // Calculate the ideal even distribution percentage
          const idealPercentage = new BigNumber(1).dividedBy(assetCount);

          // Calculate the deviation from ideal for each asset
          let totalDeviation = new BigNumber(0);
          for (const asset of assets) {
            const assetPercentage = new BigNumber(asset.balance).dividedBy(totalValue);
            const deviation = assetPercentage.minus(idealPercentage).abs();
            totalDeviation = totalDeviation.plus(deviation);
          }

          // Normalize the diversification score from 0-100, where 100 is perfect diversification
          const normalizedDeviation = totalDeviation.dividedBy(2).toNumber(); // Max deviation is 2
          diversificationScore = Math.round((1 - normalizedDeviation) * 100);
        }
      }

      // Calculate allocation risk (lower is better)
      const totalBalance = assets.reduce((sum, asset) => sum.plus(new BigNumber(asset.balance)), new BigNumber(0));
      const allocatedBalance = assets.reduce((sum, asset) => sum.plus(new BigNumber(asset.allocatedBalance)), new BigNumber(0));

      const allocatedRatio = totalBalance.isZero()
        ? new BigNumber(0)
        : allocatedBalance.dividedBy(totalBalance);

      // Higher allocation ratio = higher risk score
      const allocationRiskScore = Math.round(allocatedRatio.multipliedBy(100).toNumber());

      // Calculate liquidity ratio (available funds / allocated funds)
      // Higher is better as it indicates more buffer
      const availableBalance = totalBalance.minus(allocatedBalance);
      const liquidityRatio = allocatedBalance.isZero()
        ? new BigNumber(100) // If no allocations, perfect liquidity
        : availableBalance.dividedBy(allocatedBalance).multipliedBy(100);

      // Determine overall risk assessment based on metrics
      let riskAssessment = 'Low Risk';

      if (diversificationScore < 30 || allocationRiskScore > 85 || liquidityRatio.isLessThan(20)) {
        riskAssessment = 'High Risk';
      } else if (diversificationScore < 50 || allocationRiskScore > 70 || liquidityRatio.isLessThan(50)) {
        riskAssessment = 'Medium Risk';
      }

      return {
        diversificationScore,
        allocationRiskScore,
        liquidityRatio: liquidityRatio.toNumber(),
        riskAssessment,
      };
    } catch (error) {
      this.logger.error(`Error calculating risk metrics: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Create a new budget and its initial allocation
   */
  async createBudgetWithAllocation(
    budgetData: Partial<Budget>,
    allocationData: Partial<Allocation>
  ): Promise<{ budget: Budget; allocation: Allocation }> {
    try {
      // First, create the budget
      const budget = await this.budgetService.create(budgetData);

      // Prepare the allocation data
      const allocation = {
        ...allocationData,
        budgetId: budget.id
      };

      // Create the allocation
      const createdAllocation = await this.allocationService.create(allocation);

      return {
        budget,
        allocation: createdAllocation
      };
    } catch (error) {
      this.logger.error(`Error creating budget with allocation: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Process a deposit of assets into the treasury
   */
  async processDeposit(
    assetId: string,
    amount: string,
    fromAddress?: string,
    blockchainTxHash?: string,
    metadata?: Record<string, any>
  ) {
    try {
      return this.transactionService.recordDeposit(
        assetId,
        amount,
        fromAddress,
        blockchainTxHash,
        metadata
      );
    } catch (error) {
      this.logger.error(`Error processing deposit: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Process a withdrawal from the treasury
   */
  async processWithdrawal(
    assetId: string,
    amount: string,
    toAddress: string,
    blockchainTxHash?: string,
    metadata?: Record<string, any>
  ) {
    try {
      return this.transactionService.recordWithdrawal(
        assetId,
        amount,
        toAddress,
        blockchainTxHash,
        metadata
      );
    } catch (error) {
      this.logger.error(`Error processing withdrawal: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Process the complete budget approval workflow
   */
  async processBudgetApproval(budgetId: string, approverId: string): Promise<Budget> {
    try {
      // First check if the budget is in DRAFT status
      const budget = await this.budgetService.findById(budgetId);

      if (budget.status !== BudgetStatus.DRAFT) {
        throw new BusinessLogicError(`Cannot approve budget with status ${budget.status}`);
      }

      // Update the budget to ACTIVE status
      const activatedBudget = await this.budgetService.activateBudget(budgetId);

      this.logger.log(`Budget ${budgetId} approved by ${approverId}`);
      return activatedBudget;
    } catch (error) {
      this.logger.error(`Error processing budget approval: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Process the complete allocation approval workflow
   */
  async processAllocationApproval(allocationId: string, approverId: string): Promise<Allocation> {
    try {
      // First check if the allocation is in PENDING status
      const allocation = await this.allocationService.findById(allocationId);

      if (allocation.status !== AllocationStatus.PENDING) {
        throw new BusinessLogicError(`Cannot approve allocation with status ${allocation.status}`);
      }

      // Approve the allocation
      const approvedAllocation = await this.allocationService.approveAllocation(
        allocationId,
        approverId
      );

      this.logger.log(`Allocation ${allocationId} approved by ${approverId}`);
      return approvedAllocation;
    } catch (error) {
      this.logger.error(`Error processing allocation approval: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Generate audit report for treasury activity
   */
  async generateAuditReport(
    fromDate: Date,
    toDate: Date
  ): Promise<{
    transactionSummary: Record<string, any>;
    budgetActivity: Record<string, any>;
    allocationActivity: Record<string, any>;
  }> {
    try {
      // Get all transactions in the period
      const transactions = await this.transactionService.findAll(
        undefined, undefined, undefined, fromDate, toDate
      );

      // Summarize transactions by type
      const transactionSummary = {
        deposits: transactions.filter(tx => tx.type === TransactionType.DEPOSIT),
        withdrawals: transactions.filter(tx => tx.type === TransactionType.WITHDRAWAL),
        totalDeposited: transactions
          .filter(tx => tx.type === TransactionType.DEPOSIT)
          .reduce((sum, tx) => sum.plus(new BigNumber(tx.amount)), new BigNumber(0))
          .toString(),
        totalWithdrawn: transactions
          .filter(tx => tx.type === TransactionType.WITHDRAWAL)
          .reduce((sum, tx) => sum.plus(new BigNumber(tx.amount)), new BigNumber(0))
          .toString(),
      };

      // Get budget activity
      const budgets = await this.budgetService.findAll();
      const activeBudgets = budgets.filter(b => b.status === BudgetStatus.ACTIVE);
      const closedBudgets = budgets.filter(b =>
        b.status === BudgetStatus.CLOSED &&
        b.updatedAt >= fromDate &&
        b.updatedAt <= toDate
      );

      const budgetActivity = {
        totalBudgets: budgets.length,
        activeBudgets: activeBudgets.length,
        closedBudgets: closedBudgets.length,
        totalBudgetAmount: budgets.reduce(
          (sum, budget) => sum.plus(new BigNumber(budget.totalAmount)),
          new BigNumber(0)
        ).toString(),
        totalAllocatedAmount: budgets.reduce(
          (sum, budget) => sum.plus(new BigNumber(budget.allocatedAmount)),
          new BigNumber(0)
        ).toString(),
        totalSpentAmount: budgets.reduce(
          (sum, budget) => sum.plus(new BigNumber(budget.spentAmount)),
          new BigNumber(0)
        ).toString(),
      };

      // Get allocation activity
      const allocations = await this.allocationService.findAll();
      const approvedAllocations = allocations.filter(
        a => a.status === AllocationStatus.APPROVED &&
        a.approvedAt &&
        a.approvedAt >= fromDate &&
        a.approvedAt <= toDate
      );
      const completedAllocations = allocations.filter(
        a => a.status === AllocationStatus.COMPLETED &&
        a.updatedAt >= fromDate &&
        a.updatedAt <= toDate
      );

      const allocationActivity = {
        approvedAllocations: approvedAllocations.length,
        completedAllocations: completedAllocations.length,
        totalAllocatedAmount: allocations.reduce(
          (sum, allocation) => sum.plus(new BigNumber(allocation.amount)),
          new BigNumber(0)
        ).toString(),
        totalSpentAmount: allocations.reduce(
          (sum, allocation) => sum.plus(new BigNumber(allocation.spentAmount)),
          new BigNumber(0)
        ).toString(),
      };

      return {
        transactionSummary,
        budgetActivity,
        allocationActivity
      };
    } catch (error) {
      this.logger.error(`Error generating audit report: ${formatErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Run housekeeping operations for the treasury
   * This could be scheduled to run periodically
   */
  async performHousekeeping(): Promise<{
    expiredBudgetsUpdated: number;
    pendingTransactionsProcessed: number;
  }> {
    try {
      // Check and update expired budgets
      const expiredBudgetsUpdated = await this.budgetService.checkAndUpdateExpiredBudgets();

      // Process pending blockchain transactions
      const pendingTransactionsProcessed = await this.transactionService.processPendingTransactions();

      this.logger.log(
        `Housekeeping completed: updated ${expiredBudgetsUpdated} expired budgets, ` +
        `processed ${pendingTransactionsProcessed} pending transactions`
      );

      return {
        expiredBudgetsUpdated,
        pendingTransactionsProcessed
      };
    } catch (error) {
      this.logger.error(`Error performing treasury housekeeping: ${formatErrorMessage(error)}`);
      throw error;
    }
  }
}
