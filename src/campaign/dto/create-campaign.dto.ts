import { IsString, IsOptional, IsNumber, IsInt, IsDateString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType } from '@prisma/client';

export class CreateCampaignDto {
  @ApiProperty({ example: 'World Blood Donor Day Drive' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({ example: 24.7136 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 46.6753 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  targetBags?: number;

  @ApiPropertyOptional({ enum: BloodType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BloodType, { each: true })
  bloodTypes?: BloodType[];
}
