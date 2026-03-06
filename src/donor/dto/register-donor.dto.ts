import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType, Gender } from '@prisma/client';

export class RegisterDonorDto {
  @ApiProperty({ example: 'Ahmed Ali' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '+966501234567' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ enum: BloodType, example: 'O_POSITIVE' })
  @IsEnum(BloodType)
  bloodType: BloodType;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 24.7136 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 46.6753 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastDonationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
