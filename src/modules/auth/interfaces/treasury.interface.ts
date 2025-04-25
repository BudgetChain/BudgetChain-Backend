import { Repository } from 'typeorm';
import { Treasury } from '../../user/entities/treasury.entity';

export interface TreasuryRepository extends Repository<Treasury> {
  findByName(name: string): Promise<Treasury | null>;
  findWithAssets(treasuryId: string): Promise<Treasury | null>;
}
