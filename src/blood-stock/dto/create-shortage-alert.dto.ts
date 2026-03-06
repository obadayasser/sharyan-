import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType } from '@prisma/client';

export class CreateShortageAlertDto {
  @ApiProperty({ enum: BloodType })
  @IsEnum(BloodType)
  bloodType: BloodType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
