import { Module } from '@nestjs/common';
import { BloodBankController } from './blood-bank.controller.js';
import { BloodBankService } from './blood-bank.service.js';

@Module({
  controllers: [BloodBankController],
  providers: [BloodBankService],
  exports: [BloodBankService],
})
export class BloodBankModule {}
