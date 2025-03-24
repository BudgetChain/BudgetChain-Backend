import { IsString, IsOptional, IsNumber, IsUUID, IsDate, IsEnum, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum AllocationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RELEASED = 'released',
  SPENT = 'spent',
  CANCELLED = 'cancelled',
}

export class CreateAllocationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  budgetId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus = AllocationStatus.PENDING;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAllocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AllocationResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  budgetId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsEnum(AllocationStatus)
  status: AllocationStatus;

  @IsArray()
  tags: string[];

  @IsString()
  notes: string;

  @IsArray()
  @IsObject({ each: true })
  approvers: Array<{ userId: string; timestamp: Date }>;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releasedAt?: Date;
}