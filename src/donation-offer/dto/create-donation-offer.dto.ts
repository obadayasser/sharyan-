import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDonationOfferDto {
  @ApiProperty()
  @IsString()
  bloodRequestId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
