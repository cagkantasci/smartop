import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistEntryDto {
  @IsString()
  itemId: string;

  @IsString()
  label: string;

  @IsBoolean()
  isOk: boolean;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class CreateSubmissionDto {
  @IsUUID()
  machineId: string;

  @IsUUID()
  templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistEntryDto)
  entries: ChecklistEntryDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsNumber()
  startHours?: number;

  @IsOptional()
  @IsNumber()
  endHours?: number;
}
