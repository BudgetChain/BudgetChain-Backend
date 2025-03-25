import { Injectable } from '@nestjs/common';
import { RiskAssessmentRepository } from '../repositories/risk-assessment.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { TreasuryRepository } from '../repositories/treasury.repository';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { AuditLogService } from './audit-log.service';
import { EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class RiskAssessmentService {
  constructor(
    private riskAssessmentRepository: RiskAssessmentRepository,
    private assetRepository: AssetRepository,
    private treasuryRepository: TreasuryRepository,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<RiskAssessment[]> {
    return this.riskAssessmentRepository.findAll();
  }

  async findById(id: string): Promise<RiskAssessment | null> {
    return this.riskAssessmentRepository.findById(id);
  }

  async findByTreasuryId(treasuryId: string): Promise<RiskAssessment[]> {
    return this.riskAssessmentRepository.findByTreasuryId(treasuryId);
  }

  async findLatestByTreasuryId(
    treasuryId: string,
  ): Promise<RiskAssessment | null> {
    return this.riskAssessmentRepository.findLatestByTreasuryId(treasuryId);
  }

  async create(
    riskAssessment: Partial<RiskAssessment>,
    userId: string,
  ): Promise<RiskAssessment> {
    const newRiskAssessment = await this.riskAssessmentRepository.create({
      ...riskAssessment,
      timestamp: new Date(),
    });

    // Update the treasury's risk score
    await this.treasuryRepository.update(newRiskAssessment.treasuryId, {
      riskScore: newRiskAssessment.overallScore,
    });

    // Log the creation action
    await this.auditLogService.logAction({
      treasuryId: newRiskAssessment.treasuryId,
      entityType: EntityType.RISK_ASSESSMENT,
      entityId: newRiskAssessment.id,
      action: ActionType.CREATE,
      userId,
      previousState: null,
      newState: newRiskAssessment,
    });

    return newRiskAssessment;
  }

  async generateRiskAssessment(
    treasuryId: string,
    userId: string,
  ): Promise<RiskAssessment> {
    // Get all assets for the treasury
    const assets = await this.assetRepository.findByTreasuryId(treasuryId);

    // Calculate risk metrics based on assets
    // This is a simplified example - in a real implementation, you would use more sophisticated risk models
    const assetVolatility = {};
    let totalValue = 0;
    let weightedVolatility = 0;

    assets.forEach((asset) => {
      const volatility = asset.riskMetrics?.volatility || 0.1; // Default volatility if not set
      assetVolatility[asset.id] = volatility;

      const value = Number(asset.currentValue);
      totalValue += value;
      weightedVolatility += volatility * value;
    });

    const portfolioVolatility =
      totalValue > 0 ? weightedVolatility / totalValue : 0;

    // Calculate overall risk score (simplified)
    const marketRiskScore = portfolioVolatility * 5; // Scale to 0-5
    const counterpartyRiskScore = 2; // Example fixed value
    const liquidityRiskScore = 1.5; // Example fixed value

    const overallScore =
      (marketRiskScore + counterpartyRiskScore + liquidityRiskScore) / 3;

    // Create risk assessment
    const riskAssessment: Partial<RiskAssessment> = {
      treasuryId,
      overallScore,
      marketRisk: {
        score: marketRiskScore,
        factors: {
          portfolioVolatility,
          assetConcentration: assets.length > 0 ? 1 / assets.length : 1,
        },
      },
      counterpartyRisk: {
        score: counterpartyRiskScore,
        assessment: {
          exchangeRisk: 2,
          protocolRisk: 2.5,
        },
      },
      liquidityRisk: {
        score: liquidityRiskScore,
        evaluation: {
          assetLiquidity: 1.5,
          withdrawalRisk: 1.2,
        },
      },
      volatilityMetrics: {
        portfolioVolatility,
        assetVolatility,
      },
      recommendations: this.generateRecommendations(
        assets,
        portfolioVolatility,
      ),
    };

    return this.create(riskAssessment, userId);
  }

  private generateRecommendations(
    assets: any[],
    portfolioVolatility: number,
  ): string[] {
    const recommendations: string[] = [];

    // Example recommendations based on portfolio composition and volatility

    
    if (assets.length < 3) {
      recommendations.push(
        'Consider diversifying your portfolio with more assets to reduce concentration risk.'
      );
    }

    if (portfolioVolatility > 0.2) {
      recommendations.push(
        'Your portfolio has high volatility. Consider adding stable assets to balance risk.'
      );
    }

    if (
      assets.some(asset => asset.type === 'crypto' && asset.currentValue > 0)
    ) {
      recommendations.push(
        'Cryptocurrency assets can be highly volatile. Monitor market conditions regularly.',
      );
    }

    // Add default recommendation if none were generated
    if (recommendations.length === 0) {
      recommendations.push(
        'Your treasury appears to be well-balanced. Continue monitoring market conditions.',
      );
    }

    return recommendations;
  }

  async update(
    id: string,
    riskAssessment: Partial<RiskAssessment>,
    userId: string,
  ): Promise<RiskAssessment> {
    const existingRiskAssessment =
      await this.riskAssessmentRepository.findById(id);
    const updatedRiskAssessment = await this.riskAssessmentRepository.update(
      id,
      riskAssessment,
    );

    // Update the treasury's risk score if overall score changed
    if (
      riskAssessment.overallScore &&
      existingRiskAssessment.overallScore !== riskAssessment.overallScore
    ) {
      await this.treasuryRepository.update(existingRiskAssessment.treasuryId, {
        riskScore: riskAssessment.overallScore,
      });
    }

    // Log the update action
    await this.auditLogService.logAction({
      treasuryId: existingRiskAssessment.treasuryId,
      entityType: EntityType.RISK_ASSESSMENT,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingRiskAssessment,
      newState: updatedRiskAssessment,
    });

    return updatedRiskAssessment;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingRiskAssessment =
      await this.riskAssessmentRepository.findById(id);
    await this.riskAssessmentRepository.delete(id);

    // Log the delete action
    await this.auditLogService.logAction({
      treasuryId: existingRiskAssessment.treasuryId,
      entityType: EntityType.RISK_ASSESSMENT,
      entityId: id,
      action: ActionType.DELETE,
      userId,
      previousState: existingRiskAssessment,
      newState: null,
    });
  }
}
