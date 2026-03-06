import { Module } from '@nestjs/common';
import { DonorController } from './donor.controller.js';
import { DonorService } from './donor.service.js';

@Module({
  controllers: [DonorController],
  providers: [DonorService],
  exports: [DonorService],
})
export class DonorModule {}
