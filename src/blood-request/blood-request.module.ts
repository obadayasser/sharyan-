import { Module } from '@nestjs/common';
import { BloodRequestController } from './blood-request.controller.js';
import { BloodRequestService } from './blood-request.service.js';

@Module({
  controllers: [BloodRequestController],
  providers: [BloodRequestService],
  exports: [BloodRequestService],
})
export class BloodRequestModule {}
