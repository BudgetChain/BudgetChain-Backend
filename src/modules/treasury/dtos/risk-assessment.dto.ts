import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRiskAssessmentDto {
  @IsString()
  treasuryId: string;

  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @IsOptional()
  @IsObject()
  marketRisk?: {
    score: number;
    factors: Record<string, any>;
  };

  @IsOptional()
  @IsObject()
  counterpartyRisk?: {
    score: number;
    assessment: Record<string, any>;
  };

  @IsOptional()
  @IsObject()
  liquidityRisk?: {
    score: number;
    evaluation: Record<string, any>;
  };

  @IsOptional()
  @IsObject()
  volatilityMetrics?: Record<string, any>;

  @IsOptional()
  @IsString({ each: true })
  recommendations?: string[];
}

export class RiskAssessmentResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  treasuryId: string;

  @IsNumber()
  overallScore: number;

  @IsObject()
  marketRisk: {
    score: number;
    factors: Record<string, any>;
  };

  @IsObject()
  counterpartyRisk: {
    score: number;
    assessment: Record<string, any>;
  };

  @IsObject()
  liquidityRisk: {
    score: number;
    evaluation: Record<string, any>;
  };

  @IsObject()
  volatilityMetrics: Record<string, any>;

  @IsString({ each: true })
  recommendations: string[];

  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}
