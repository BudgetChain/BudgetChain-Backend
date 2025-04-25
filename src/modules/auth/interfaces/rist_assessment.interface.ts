import { Repository } from 'typeorm';
import { RiskAssessment } from '../../user/entities/risk_assessment.entity';

export interface RiskAssessmentRepository extends Repository<RiskAssessment> {
  findByTreasuryId(treasuryId: string): Promise<RiskAssessment[]>;
  findByRiskType(
    treasuryId: string,
    riskType: string
  ): Promise<RiskAssessment[]>;
}
