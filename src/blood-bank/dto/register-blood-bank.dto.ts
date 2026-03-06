import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterBloodBankDto {
  @ApiProperty({ example: 'King Fahad Blood Bank' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'بنك الدم بمستشفى الملك فهد' })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
