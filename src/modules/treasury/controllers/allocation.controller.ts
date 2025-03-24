import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AllocationService } from '../services/allocation.service';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('allocations')
@UseGuards(JwtAuthGuard)
export class AllocationController {
  constructor(private allocationService: AllocationService) {}

  @Get()
  async findAll(@Query('budgetId') budgetId?: string, @Query('status') status?: AllocationStatus): Promise<Allocation[]> {
    if (budgetId) {
      return this.allocationService.findByBudgetId(budgetId);
    }
    if (status) {
      return this.allocationService.findByStatus(status);
    }
    return this.allocationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Allocation> {
    return this.allocationService.findById(id);
  }

  @Post()
  async create(@Body() allocation: Partial<Allocation>, @CurrentUser() user: any): Promise<Allocation> {
    return this.allocationService.create(allocation, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() allocation: Partial<Allocation>,
    @CurrentUser() user: any,
  ): Promise<Allocation> {
    return this.allocationService.update(id, allocation, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    return this.allocationService.delete(id, user.id);
  }

  @Post(':id/approve')
  async approveAllocation(@Param('id') id: string, @CurrentUser() user: any): Promise<Allocation> {
    return this.allocationService.approveAllocation(id, user.id);
  }

  @Post(':id/release')
  async releaseAllocation(@Param('id') id: string, @CurrentUser() user: any): Promise<Allocation> {
    return this.allocationService.releaseAllocation(id, user.id);
  }
}