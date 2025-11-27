import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ReviewSubmissionDto {
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  notes?: string;
}
