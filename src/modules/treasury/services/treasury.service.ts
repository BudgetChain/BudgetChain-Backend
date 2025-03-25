import { Injectable } from '@nestjs/common';
import { TreasuryRepository } from '../repositories/treasury.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { Treasury } from '../entities/treasury.entity';
import { AuditLogService } from './audit-log.service';
import { EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class TreasuryService {
  constructor(
    private treasuryRepository: TreasuryRepository,
    private assetRepository: AssetRepository,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<Treasury[]> {
    return this.treasuryRepository.findAll();
  }

  async findById(id: string): Promise<Treasury | null> {
    return this.treasuryRepository.findById(id);
  }

  async findByOrganizationId(organizationId: string): Promise<Treasury[]> {
    return this.treasuryRepository.findByOrganizationId(organizationId);
  }

  async create(treasury: Partial<Treasury>, userId: string): Promise<Treasury> {
    const newTreasury = await this.treasuryRepository.create(treasury);

    // Log the creation action
    await this.auditLogService.logAction({
      treasuryId: newTreasury.id,
      entityType: EntityType.TREASURY,
      entityId: newTreasury.id,
      action: ActionType.CREATE,
      userId,
      previousState: null,
      newState: newTreasury,
    });

    return newTreasury;
  }

  async update(
    id: string,
    treasury: Partial<Treasury>,
    userId: string,
  ): Promise<Treasury | null> {
    const existingTreasury = await this.treasuryRepository.findById(id);
    const updatedTreasury = await this.treasuryRepository.update(id, treasury);

    // Log the update action
    await this.auditLogService.logAction({
      treasuryId: id,
      entityType: EntityType.TREASURY,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingTreasury,
      newState: updatedTreasury,
    });

    return updatedTreasury;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingTreasury = await this.treasuryRepository.findById(id);
    await this.treasuryRepository.delete(id);

    // Log the delete action
    await this.auditLogService.logAction({
      treasuryId: id,
      entityType: EntityType.TREASURY,
      entityId: id,
      action: ActionType.DELETE,
      userId,
      previousState: existingTreasury,
      newState: null,
    });
  }

  async calculateTotalBalance(treasuryId: string): Promise<number> {
    const assets = await this.assetRepository.findByTreasuryId(treasuryId);

    // Calculate total balance from all assets
    const totalBalance = assets.reduce((sum, asset) => {
      return sum + Number(asset.currentValue);
    }, 0);

    // Update the treasury's total balance
    await this.treasuryRepository.update(treasuryId, { totalBalance });

    return totalBalance;
  }
}
