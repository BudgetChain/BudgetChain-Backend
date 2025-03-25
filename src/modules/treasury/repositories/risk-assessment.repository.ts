import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAssessment } from '../entities/risk-assessment.entity';

@Injectable()
export class RiskAssessmentRepository {
  constructor(
    @InjectRepository(RiskAssessment)
    private riskAssessmentRepository: Repository<RiskAssessment>,
  ) {}

  async findAll(): Promise<RiskAssessment[]> {
    return this.riskAssessmentRepository.find();
  }

  async findById(id: string): Promise<RiskAssessment | null> {
    return this.riskAssessmentRepository.findOne({ where: { id } });
  }

  async findByTreasuryId(treasuryId: string): Promise<RiskAssessment[]> {
    return this.riskAssessmentRepository.find({
      where: { treasuryId },
      order: { timestamp: 'DESC' },
    });
  }

  async findLatestByTreasuryId(
    treasuryId: string,
  ): Promise<RiskAssessment | null> {
    return this.riskAssessmentRepository.findOne({
      where: { treasuryId },
      order: { timestamp: 'DESC' },
    });
  }

  async create(
    riskAssessment: Partial<RiskAssessment>,
  ): Promise<RiskAssessment> {
    const newRiskAssessment =
      this.riskAssessmentRepository.create(riskAssessment);
    return this.riskAssessmentRepository.save(newRiskAssessment);
  }

  async update(
    id: string,
    riskAssessment: Partial<RiskAssessment>,
  ): Promise<RiskAssessment | null> {
    await this.riskAssessmentRepository.update(id, riskAssessment);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.riskAssessmentRepository.delete(id);
  }
}
