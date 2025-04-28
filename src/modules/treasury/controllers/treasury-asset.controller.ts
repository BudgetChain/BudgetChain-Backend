import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TreasuryAssetService } from '../services/treasury-asset.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { Asset } from '../entities/asset.entity';

@Controller('treasury/assets')
export class TreasuryAssetController {
  constructor(private readonly assetService: TreasuryAssetService) {}

  /**
   * Get all assets
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async findAll(@Query('includeInactive') includeInactive: boolean = false) {
    return this.assetService.findAll(includeInactive);
  }

  /**
   * Get an asset by ID
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async findById(@Param('id') id: string) {
    return this.assetService.findById(id);
  }

  /**
   * Create a new asset
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() assetData: Partial<Asset>) {
    return this.assetService.create(assetData);
  }

  /**
   * Update an asset
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async update(@Param('id') id: string, @Body() assetData: Partial<Asset>) {
    return this.assetService.update(id, assetData);
  }

  /**
   * Update asset balance
   */
  @Put(':id/balance')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async updateBalance(
    @Param('id') id: string,
    @Body() data: { balance: string }
  ) {
    return this.assetService.updateBalance(id, data.balance);
  }

  /**
   * Get asset available balance
   */
  @Get(':id/available-balance')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async getAvailableBalance(@Param('id') id: string) {
    const availableBalance = await this.assetService.getAvailableBalance(id);
    return { availableBalance };
  }

  /**
   * Delete (deactivate) an asset
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.assetService.delete(id);
  }

  /**
   * Calculate treasury value across all assets
   */
  @Get('treasury/value')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  async calculateTreasuryValue() {
    return this.assetService.calculateTreasuryValue();
  }
}
