import { IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType } from '@prisma/client';

export class DonorSearchQueryDto {
  @ApiPropertyOptional({ enum: BloodType })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiPropertyOptional({ description: 'Latitude for distance search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for distance search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Search radius in km', default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  radiusKm?: number = 5;

  @ApiPropertyOptional({ description: 'Only available donors', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableOnly?: boolean = true;

  @ApiPropertyOptional({ description: 'Include blood compatibility matching', default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeCompatible?: boolean = false;

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
