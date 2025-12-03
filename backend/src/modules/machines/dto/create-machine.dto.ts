import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNumber,
  Matches,
} from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsEnum(['excavator', 'dozer', 'crane', 'loader', 'truck', 'grader', 'roller', 'other'])
  machineType: 'excavator' | 'dozer' | 'crane' | 'loader' | 'truck' | 'grader' | 'roller' | 'other';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  fuelType?: string;

  @IsOptional()
  @IsNumber()
  fuelCapacity?: number;

  @IsOptional()
  @IsNumber()
  engineHours?: number;

  @IsOptional()
  @IsNumber()
  odometer?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'assignedOperatorId must be a valid UUID format',
  })
  assignedOperatorId?: string;

  @IsOptional()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'checklistTemplateId must be a valid UUID format',
  })
  checklistTemplateId?: string;
}
