import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { LoggingService } from '../../../config/logging.service';
import {
  formatErrorMessage,
  NotFoundError,
  DatabaseError,
  ValidationError,
} from '../../../shared/erros/app-error';
import BigNumber from 'bignumber.js';

@Injectable()
export class TreasuryAssetService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @Inject(LoggingService)
    private logger: LoggingService,
    private dataSource: DataSource
  ) {
    this.logger.setContext('TreasuryAssetService');
    // Configure BigNumber for precision
    BigNumber.config({
      DECIMAL_PLACES: 18,
      ROUNDING_MODE: BigNumber.ROUND_DOWN,
    });
  }

  /**
   * Get all assets in the treasury
   */
  async findAll(includeInactive = false): Promise<Asset[]> {
    try {
      const query = this.assetRepository.createQueryBuilder('asset');

      if (!includeInactive) {
        query.where('asset.isActive = true');
      }

      const assets = await query.getMany();
      this.logger.debug(`Retrieved ${assets.length} assets`);
      return assets;
    } catch (error) {
      this.logger.error(
        `Error retrieving assets: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to retrieve assets: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Get asset by ID
   */
  async findById(id: string): Promise<Asset> {
    try {
      const asset = await this.assetRepository.findOne({ where: { id } });
      if (!asset) {
        this.logger.warn(`Asset with ID ${id} not found`);
        throw new NotFoundError('Asset', id);
      }
      return asset;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error finding asset by ID ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to find asset: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Get asset by symbol and contract address (for tokens)
   */
  async findBySymbolAndContract(
    symbol: string,
    contractAddress?: string
  ): Promise<Asset | null> {
    try {
      const queryBuilder = this.assetRepository
        .createQueryBuilder('asset')
        .where('asset.symbol = :symbol', { symbol });

      if (contractAddress) {
        queryBuilder.andWhere('asset.contractAddress = :contractAddress', {
          contractAddress,
        });
      } else {
        queryBuilder.andWhere('asset.contractAddress IS NULL');
      }

      const asset = await queryBuilder.getOne();
      return asset;
    } catch (error) {
      this.logger.error(
        `Error finding asset by symbol ${symbol}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to find asset by symbol: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Create a new asset
   */
  async create(assetData: Partial<Asset>): Promise<Asset> {
    try {
      // Validate required fields
      if (!assetData.name || !assetData.symbol) {
        throw new ValidationError('Asset name and symbol are required');
      }

      // Check if asset already exists
      if (assetData.contractAddress) {
        const existingAsset = await this.findBySymbolAndContract(
          assetData.symbol,
          assetData.contractAddress
        );

        if (existingAsset) {
          throw new ValidationError(
            `Asset ${assetData.symbol} with contract address ${assetData.contractAddress} already exists`
          );
        }
      }

      const asset = this.assetRepository.create(assetData);
      const savedAsset = await this.assetRepository.save(asset);

      this.logger.log(
        `Created new asset: ${savedAsset.name} (${savedAsset.symbol})`
      );
      return savedAsset;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error(`Error creating asset: ${formatErrorMessage(error)}`);
      throw new DatabaseError(
        `Failed to create asset: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Update an existing asset
   */
  async update(id: string, assetData: Partial<Asset>): Promise<Asset> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, find the asset to ensure it exists
      const asset = await this.findById(id);

      // Update the asset properties
      Object.assign(asset, assetData);

      const updatedAsset = await queryRunner.manager.save(Asset, asset);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated asset: ${updatedAsset.name} (${updatedAsset.symbol})`
      );
      return updatedAsset;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error updating asset ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update asset: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update asset balance
   */
  async updateBalance(id: string, newBalance: string): Promise<Asset> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, find the asset to ensure it exists
      const asset = await queryRunner.manager.findOne(Asset, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!asset) {
        throw new NotFoundError('Asset', id);
      }

      // Validate balance
      const balance = new BigNumber(newBalance);
      if (balance.isNaN() || balance.isLessThan(0)) {
        throw new ValidationError('Balance must be a non-negative number');
      }

      // Update the balance
      asset.balance = balance.toString();

      const updatedAsset = await queryRunner.manager.save(Asset, asset);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated balance for asset ${asset.symbol} to ${newBalance}`
      );
      return updatedAsset;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      this.logger.error(
        `Error updating asset balance ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update asset balance: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update asset allocated balance
   */
  async updateAllocatedBalance(id: string, delta: string): Promise<Asset> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, find the asset to ensure it exists
      const asset = await queryRunner.manager.findOne(Asset, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!asset) {
        throw new NotFoundError('Asset', id);
      }

      // Calculate new allocated balance
      const currentAllocated = new BigNumber(asset.allocatedBalance);
      const deltaAmount = new BigNumber(delta);
      const newAllocated = currentAllocated.plus(deltaAmount);

      // Validate allocated balance doesn't exceed total balance
      const totalBalance = new BigNumber(asset.balance);
      if (newAllocated.isGreaterThan(totalBalance)) {
        throw new ValidationError(
          'Allocated amount cannot exceed total balance'
        );
      }

      if (newAllocated.isLessThan(0)) {
        throw new ValidationError('Allocated balance cannot be negative');
      }

      // Update the allocated balance
      asset.allocatedBalance = newAllocated.toString();

      const updatedAsset = await queryRunner.manager.save(Asset, asset);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated allocated balance for asset ${asset.symbol} to ${newAllocated.toString()}`
      );
      return updatedAsset;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      this.logger.error(
        `Error updating asset allocated balance ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update asset allocated balance: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calculate available balance (total - allocated)
   */
  async getAvailableBalance(id: string): Promise<string> {
    try {
      const asset = await this.findById(id);

      const totalBalance = new BigNumber(asset.balance);
      const allocatedBalance = new BigNumber(asset.allocatedBalance);

      const availableBalance = totalBalance.minus(allocatedBalance);
      return availableBalance.toString();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error calculating available balance for asset ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to calculate available balance: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Delete asset (set inactive)
   */
  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, find the asset to ensure it exists
      const asset = await this.findById(id);

      // Set as inactive instead of deleting
      asset.isActive = false;

      await queryRunner.manager.save(Asset, asset);
      await queryRunner.commitTransaction();

      this.logger.log(`Deactivated asset: ${asset.name} (${asset.symbol})`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error deleting asset ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to delete asset: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calculate total treasury value across all assets
   * Note: This would need a price feed integration for accurate results
   */
  async calculateTreasuryValue(): Promise<{
    totalValue: string;
    assetValues: { symbol: string; value: string }[];
  }> {
    try {
      // This is a placeholder for actual implementation
      // Would need price feed integration to calculate actual values
      const assets = await this.findAll();

      // For demonstration, just return balances as values
      return {
        totalValue: '0',
        assetValues: assets.map(asset => ({
          symbol: asset.symbol,
          value: asset.balance,
        })),
      };
    } catch (error) {
      this.logger.error(
        `Error calculating treasury value: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to calculate treasury value: ${formatErrorMessage(error)}`
      );
    }
  }
}
