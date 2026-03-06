import { IsString, IsOptional, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType } from '@prisma/client';

export class RecordDonationDto {
  @ApiProperty()
  @IsString()
  donorId: string;

  @ApiProperty({ enum: BloodType })
  @IsEnum(BloodType)
  bloodType: BloodType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  bagsCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  donatedAt?: string;
}
