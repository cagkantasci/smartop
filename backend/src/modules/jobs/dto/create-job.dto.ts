import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationName?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  machineIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  operatorIds?: string[];
}
