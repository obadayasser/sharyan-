import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller.js';
import { DonationService } from './donation.service.js';

@Module({
  controllers: [DonationController],
  providers: [DonationService],
  exports: [DonationService],
})
export class DonationModule {}
