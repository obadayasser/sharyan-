import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@sharyan.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}
