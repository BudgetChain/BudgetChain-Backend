import { Injectable } from '@nestjs/common';
import { AssetRepository } from '../repositories/asset.repository';
import { TreasuryRepository } from '../repositories/treasury.repository';
import { Asset } from '../entities/asset.entity';
import { AuditLogService } from './audit-log.service';
import { EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class AssetService {
  constructor(
    private assetRepository: AssetRepository,
    private treasuryRepository: TreasuryRepository,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<Asset[]> {
    return this.assetRepository.findAll();
  }

  async findById(id: string): Promise<Asset | null> {
    return this.assetRepository.findById(id);
  }

  async findByTreasuryId(treasuryId: string): Promise<Asset[]> {
    return this.assetRepository.findByTreasuryId(treasuryId);
  }

  async create(asset: Partial<Asset>, userId: string): Promise<Asset> {
    const newAsset = await this.assetRepository.create({
      ...asset,
      lastUpdated: new Date(),
    });

    // Update the treasury's total balance
    const treasury = await this.treasuryRepository.findById(
      newAsset.treasuryId,
    );

    if (!treasury) throw new Error('Treasury not found');

    const newTotalBalance =
      Number(treasury.totalBalance) + Number(newAsset.currentValue);
    await this.treasuryRepository.update(treasury.id, {
      totalBalance: newTotalBalance,
    });

    // Log the creation action
    await this.auditLogService.logAction({
      treasuryId: newAsset.treasuryId,
      entityType: EntityType.ASSET,
      entityId: newAsset.id,
      action: ActionType.CREATE,
      userId,
      previousState: null,
      newState: newAsset,
    });

    return newAsset;
  }

  async update(
    id: string,
    asset: Partial<Asset>,
    userId: string,
  ): Promise<Asset | null> {
    const existingAsset = await this.assetRepository.findById(id);

    if (!existingAsset) throw new Error('No existing asset');

    // Update the asset with the lastUpdated timestamp
    const updatedAsset = await this.assetRepository.update(id, {
      ...asset,
      lastUpdated: new Date(),
    });

    // If the current value changed, update the treasury's total balance
    if (
      asset.currentValue &&
      existingAsset.currentValue !== asset.currentValue
    ) {
      const treasury = await this.treasuryRepository.findById(
        existingAsset.treasuryId,
      );
      if (!treasury) throw new Error('No Treasury');
      const valueDifference =
        Number(asset.currentValue) - Number(existingAsset.currentValue);
      const newTotalBalance = Number(treasury.totalBalance) + valueDifference;
      await this.treasuryRepository.update(treasury.id, {
        totalBalance: newTotalBalance,
      });
    }

    // Log the update action
    await this.auditLogService.logAction({
      treasuryId: existingAsset.treasuryId,
      entityType: EntityType.ASSET,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingAsset,
      newState: updatedAsset,
    });

    return updatedAsset;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingAsset = await this.assetRepository.findById(id);
    if (!existingAsset) throw new Error('No Existing Asset Found');

    // Update the treasury's total balance
    const treasury = await this.treasuryRepository.findById(
      existingAsset.treasuryId,
    );
    if (!treasury) throw new Error('treasury not found');
    const newTotalBalance =
      Number(treasury.totalBalance) - Number(existingAsset.currentValue);
    await this.treasuryRepository.update(treasury.id, {
      totalBalance: newTotalBalance,
    });

    await this.assetRepository.delete(id);

    // Log the delete action
    await this.auditLogService.logAction({
      treasuryId: existingAsset.treasuryId,
      entityType: EntityType.ASSET,
      entityId: id,
      action: ActionType.DELETE,
      userId,
      previousState: existingAsset,
      newState: null,
    });
  }

  async updateAssetValue(
    id: string,
    currentValue: number,
    userId: string,
  ): Promise<Asset | null> {
    const existingAsset = await this.assetRepository.findById(id);
    if (!existingAsset) throw new Error('No existing asset found');

    // Update the asset with the new value and lastUpdated timestamp
    const updatedAsset = await this.assetRepository.update(id, {
      currentValue,
      lastUpdated: new Date(),
    });

    // Update the treasury's total balance
    const treasury = await this.treasuryRepository.findById(
      existingAsset.treasuryId,
    );
    if (!treasury) throw new Error('no treasury found');
    const valueDifference =
      Number(currentValue) - Number(existingAsset.currentValue);
    const newTotalBalance = Number(treasury.totalBalance) + valueDifference;
    await this.treasuryRepository.update(treasury.id, {
      totalBalance: newTotalBalance,
    });

    // Log the update action
    await this.auditLogService.logAction({
      treasuryId: existingAsset.treasuryId,
      entityType: EntityType.ASSET,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingAsset,
      newState: updatedAsset,
    });

    return updatedAsset;
  }
}
