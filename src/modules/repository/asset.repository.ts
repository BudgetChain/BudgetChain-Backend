import { Repository } from 'typeorm';
import { Asset } from '../user/entities/asset.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface AssetRepository extends Repository<Asset> {
  findByTreasuryId(treasuryId: string): Promise<Asset[]>;
  findByType(treasuryId: string, type: string): Promise<Asset[]>;
}

@Injectable()
export class AssetRepositoryImpl
  extends Repository<Asset>
  implements AssetRepository
{
  constructor(
    @InjectRepository(Asset) private readonly repo: Repository<Asset>
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    const newAsset = this.repo.create(asset);
    return this.repo.save(newAsset);
  }

  async findById(id: string): Promise<Asset | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Asset[]> {
    return this.repo.find();
  }

  async findByTreasuryId(treasuryId: string): Promise<Asset[]> {
    return this.repo.find({ where: { treasuryId } });
  }

  async findByType(treasuryId: string, type: string): Promise<Asset[]> {
    return this.repo.find({ where: { treasuryId, type } });
  }

  async updateAsset(
    id: string,
    updateData: Partial<Asset>
  ): Promise<Asset | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async deleteAsset(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
