import { Global, Module } from '@nestjs/common';
import { BloodCompatibilityService } from './blood-compatibility.service.js';

@Global()
@Module({
  providers: [BloodCompatibilityService],
  exports: [BloodCompatibilityService],
})
export class BloodCompatibilityModule {}
