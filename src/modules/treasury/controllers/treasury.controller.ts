import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TreasuryService } from '../services/treasury.service';
import { AssetService } from '../services/asset.service';
import { Treasury } from '../entities/treasury.entity';
import { Asset } from '../entities/asset.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('treasuries')
@UseGuards(JwtAuthGuard)
export class TreasuryController {
  constructor(
    private treasuryService: TreasuryService,
    private assetService: AssetService,
  ) {}

  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
  ): Promise<Treasury[]> {
    if (organizationId) {
      return this.treasuryService.findByOrganizationId(organizationId);
    }
    return this.treasuryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Treasury> {
    return this.treasuryService.findById(id);
  }

  @Post()
  async create(
    @Body() treasury: Partial<Treasury>,
    @CurrentUser() user: any,
  ): Promise<Treasury> {
    return this.treasuryService.create(treasury, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() treasury: Partial<Treasury>,
    @CurrentUser() user: any,
  ): Promise<Treasury> {
    return this.treasuryService.update(id, treasury, user.id);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.treasuryService.delete(id, user.id);
  }

  @Get(':id/balance')
  async getTotalBalance(
    @Param('id') id: string,
  ): Promise<{ totalBalance: number }> {
    const totalBalance = await this.treasuryService.calculateTotalBalance(id);
    return { totalBalance };
  }

  @Get(':id/assets')
  async getAssets(@Param('id') treasuryId: string): Promise<Asset[]> {
    return this.assetService.findByTreasuryId(treasuryId);
  }

  @Post(':id/assets')
  async createAsset(
    @Param('id') treasuryId: string,
    @Body() asset: Partial<Asset>,
    @CurrentUser() user: any,
  ): Promise<Asset> {
    asset.treasuryId = treasuryId;
    return this.assetService.create(asset, user.id);
  }
}
