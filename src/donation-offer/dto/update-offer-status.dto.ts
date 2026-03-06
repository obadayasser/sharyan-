import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DonationOfferStatus } from '@prisma/client';

export class UpdateOfferStatusDto {
  @ApiProperty({ enum: DonationOfferStatus })
  @IsEnum(DonationOfferStatus)
  status: DonationOfferStatus;
}
