import { Repository } from 'typeorm';
import { RiskAssessment } from '../user/entities/risk_assessment.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface RiskAssessmentRepository extends Repository<RiskAssessment> {
  findByTreasuryId(treasuryId: string): Promise<RiskAssessment[]>;
  findByRiskType(
    treasuryId: string,
    riskType: string
  ): Promise<RiskAssessment[]>;
}

@Injectable()
export class RiskAssessmentRepositoryImpl
  extends Repository<RiskAssessment>
  implements RiskAssessmentRepository
{
  constructor(
    @InjectRepository(RiskAssessment)
    private readonly repo: Repository<RiskAssessment>
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  // Create
  async createRiskAssessment(
    riskAssessment: Partial<RiskAssessment>
  ): Promise<RiskAssessment> {
    const newRiskAssessment = this.repo.create(riskAssessment);
    return this.repo.save(newRiskAssessment);
  }

  // Read (Single)
  async findById(id: string): Promise<RiskAssessment | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Read (Multiple)
  async findAll(): Promise<RiskAssessment[]> {
    return this.repo.find();
  }

  // Read (Custom)
  async findByTreasuryId(treasuryId: string): Promise<RiskAssessment[]> {
    return this.repo.find({ where: { treasuryId } });
  }

  async findByRiskType(
    treasuryId: string,
    riskType: string
  ): Promise<RiskAssessment[]> {
    return this.repo.find({ where: { treasuryId, riskType } });
  }

  // Update
  async updateRiskAssessment(
    id: string,
    updateData: Partial<RiskAssessment>
  ): Promise<RiskAssessment | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  // Delete
  async deleteRiskAssessment(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
