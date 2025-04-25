import { Repository } from 'typeorm';
import { Asset } from '../../user/entities/asset.entity';

export interface AssetRepository extends Repository<Asset> {
  findByTreasuryId(treasuryId: string): Promise<Asset[]>;
  findByType(treasuryId: string, type: string): Promise<Asset[]>;
}
