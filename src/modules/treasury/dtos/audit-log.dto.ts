import { IsString, IsUUID, IsDate, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum EntityType {
  TREASURY = 'treasury',
  ASSET = 'asset',
  TRANSACTION = 'transaction',
  BUDGET = 'budget',
  ALLOCATION = 'allocation',
  RISK_ASSESSMENT = 'risk_assessment',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export class AuditLogResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  treasuryId: string;

  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  entityId: string;

  @IsEnum(ActionType)
  action: ActionType;

  @IsString()
  userId: string;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsObject()
  previousState: Record<string, any>;

  @IsObject()
  newState: Record<string, any>;

  @IsString()
  ipAddress: string;
}