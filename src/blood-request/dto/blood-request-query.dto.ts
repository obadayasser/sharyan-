import { IsOptional, IsEnum, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType, BloodRequestStatus, BloodRequestUrgency } from '@prisma/client';

export class BloodRequestQueryDto {
  @ApiPropertyOptional({ enum: BloodType })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiPropertyOptional({ enum: BloodRequestStatus })
  @IsOptional()
  @IsEnum(BloodRequestStatus)
  status?: BloodRequestStatus;

  @ApiPropertyOptional({ enum: BloodRequestUrgency })
  @IsOptional()
  @IsEnum(BloodRequestUrgency)
  urgency?: BloodRequestUrgency;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
