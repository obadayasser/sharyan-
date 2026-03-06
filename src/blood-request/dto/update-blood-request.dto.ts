import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodRequestStatus } from '@prisma/client';

export class UpdateBloodRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: BloodRequestStatus })
  @IsOptional()
  @IsEnum(BloodRequestStatus)
  status?: BloodRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bagsFulfilled?: number;
}
