import { Repository } from 'typeorm';
import { Treasury } from '../user/entities/treasury.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface TreasuryRepository extends Repository<Treasury> {
  findByName(name: string): Promise<Treasury | null>;
  findWithAssets(treasuryId: string): Promise<Treasury | null>;
}

@Injectable()
export class TreasuryRepositoryImpl
  extends Repository<Treasury>
  implements TreasuryRepository
{
  constructor(
    @InjectRepository(Treasury) private readonly repo: Repository<Treasury>
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createTreasury(treasury: Partial<Treasury>): Promise<Treasury> {
    const newTreasury = this.repo.create(treasury);
    return this.repo.save(newTreasury);
  }

  async findById(id: string): Promise<Treasury | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Treasury[]> {
    return this.repo.find();
  }

  async findByName(name: string): Promise<Treasury | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findWithAssets(treasuryId: string): Promise<Treasury | null> {
    return this.repo.findOne({
      where: { id: treasuryId },
      relations: ['assets'],
    });
  }

  async updateTreasury(
    id: string,
    updateData: Partial<Treasury>
  ): Promise<Treasury | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async deleteTreasury(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
