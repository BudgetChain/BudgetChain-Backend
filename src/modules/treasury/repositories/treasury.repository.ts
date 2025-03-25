import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treasury } from '../entities/treasury.entity';

@Injectable()
export class TreasuryRepository {
  constructor(
    @InjectRepository(Treasury)
    private treasuryRepository: Repository<Treasury>,
  ) {}

  async findAll(): Promise<Treasury[]> {
    return this.treasuryRepository.find();
  }

  async findById(id: string): Promise<Treasury | null> {
    return this.treasuryRepository.findOne({ where: { id } });
  }

  async findByOrganizationId(organizationId: string): Promise<Treasury[]> {
    return this.treasuryRepository.find({ where: { organizationId } });
  }

  async create(treasury: Partial<Treasury>): Promise<Treasury> {
    const newTreasury = this.treasuryRepository.create(treasury);
    return this.treasuryRepository.save(newTreasury);
  }

  async update(
    id: string,
    treasury: Partial<Treasury>,
  ): Promise<Treasury | null> {
    await this.treasuryRepository.update(id, treasury);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.treasuryRepository.delete(id);
  }
}
