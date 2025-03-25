import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';

@Injectable()
export class AssetRepository {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  async findAll(): Promise<Asset[]> {
    return this.assetRepository.find();
  }

  async findById(id: string): Promise<Asset | null> {
    return this.assetRepository.findOne({ where: { id } });
  }

  async findByTreasuryId(treasuryId: string): Promise<Asset[]> {
    return this.assetRepository.find({ where: { treasuryId } });
  }

  async create(asset: Partial<Asset>): Promise<Asset> {
    const newAsset = this.assetRepository.create(asset);
    return this.assetRepository.save(newAsset);
  }

  async update(id: string, asset: Partial<Asset>): Promise<Asset | null> {
    await this.assetRepository.update(id, asset);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.assetRepository.delete(id);
  }
}
