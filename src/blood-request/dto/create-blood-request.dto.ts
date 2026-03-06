import { IsString, IsOptional, IsEnum, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType, BloodRequestUrgency } from '@prisma/client';

export class CreateBloodRequestDto {
  @ApiProperty({ enum: BloodType })
  @IsEnum(BloodType)
  bloodType: BloodType;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  bagsNeeded: number;

  @ApiPropertyOptional({ enum: BloodRequestUrgency, default: 'NORMAL' })
  @IsOptional()
  @IsEnum(BloodRequestUrgency)
  urgency?: BloodRequestUrgency;

  @ApiProperty({ example: 'Mohammed Ali' })
  @IsString()
  patientName: string;

  @ApiPropertyOptional({ example: 'King Fahad Hospital' })
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodBankId?: string;

  @ApiProperty({ example: 24.7136 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 46.6753 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: '+966501234567' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
