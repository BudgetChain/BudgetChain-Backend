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
import { AssetService } from '../services/asset.service';
import { Asset } from '../entities/asset.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get()
  async findAll(@Query('treasuryId') treasuryId?: string): Promise<Asset[]> {
    if (treasuryId) {
      return this.assetService.findByTreasuryId(treasuryId);
    }
    return this.assetService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Asset> {
    return this.assetService.findById(id);
  }

  @Post()
  async create(
    @Body() asset: Partial<Asset>,
    @CurrentUser() user: any,
  ): Promise<Asset> {
    return this.assetService.create(asset, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() asset: Partial<Asset>,
    @CurrentUser() user: any,
  ): Promise<Asset> {
    return this.assetService.update(id, asset, user.id);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.assetService.delete(id, user.id);
  }

  @Put(':id/value')
  async updateValue(
    @Param('id') id: string,
    @Body('currentValue') currentValue: number,
    @CurrentUser() user: any,
  ): Promise<Asset> {
    return this.assetService.updateAssetValue(id, currentValue, user.id);
  }
}
