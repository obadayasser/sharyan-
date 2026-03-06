import { Module } from '@nestjs/common';
import { BloodStockController } from './blood-stock.controller.js';
import { BloodStockService } from './blood-stock.service.js';

@Module({
  controllers: [BloodStockController],
  providers: [BloodStockService],
  exports: [BloodStockService],
})
export class BloodStockModule {}
