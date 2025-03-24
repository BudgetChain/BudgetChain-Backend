import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { CreateRiskAssessmentDto, RiskAssessmentResponseDto } from '../dtos/risk-assessment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('risk-assessments')
@UseGuards(JwtAuthGuard)
export class RiskAssessmentController {
  constructor(private riskAssessmentService: RiskAssessmentService) {}

  @Get()
  async findAll(@Query('treasuryId') treasuryId?: string): Promise<RiskAssessment[]> {
    if (treasuryId) {
      return this.riskAssessmentService.findByTreasuryId(treasuryId);
    }
    return this.riskAssessmentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<RiskAssessment> {
    return this.riskAssessmentService.findById(id);
  }

  @Post()
  async create(
    @Body() createRiskAssessmentDto: CreateRiskAssessmentDto,
    @CurrentUser() user: any,
  ): Promise<RiskAssessment> {
    return this.riskAssessmentService.create(createRiskAssessmentDto, user.id);
  }

  @Post('generate/:treasuryId')
  async generateRiskAssessment(
    @Param('treasuryId') treasuryId: string,
    @CurrentUser() user: any,
  ): Promise<RiskAssessment> {
    return this.riskAssessmentService.generateRiskAssessment(treasuryId, user.id);
  }

  @Get('latest/:treasuryId')
  async getLatestRiskAssessment(@Param('treasuryId') treasuryId: string): Promise<RiskAssessment> {
    return this.riskAssessmentService.findLatestByTreasuryId(treasuryId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    return this.riskAssessmentService.delete(id, user.id);
  }
}