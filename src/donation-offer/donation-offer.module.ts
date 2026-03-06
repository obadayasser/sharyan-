import { Module } from '@nestjs/common';
import { DonationOfferController } from './donation-offer.controller.js';
import { DonationOfferService } from './donation-offer.service.js';

@Module({
  controllers: [DonationOfferController],
  providers: [DonationOfferService],
  exports: [DonationOfferService],
})
export class DonationOfferModule {}
