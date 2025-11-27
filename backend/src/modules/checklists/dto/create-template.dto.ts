import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @IsString()
  id: string;

  @IsString()
  @MaxLength(255)
  label: string;

  @IsEnum(['boolean', 'text', 'number', 'photo'])
  type: 'boolean' | 'text' | 'number' | 'photo';

  @IsBoolean()
  required: boolean;
}

export class CreateTemplateDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  machineTypes?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];
}
