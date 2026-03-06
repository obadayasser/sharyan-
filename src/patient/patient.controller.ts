import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { PatientService } from './patient.service.js';
import { RegisterPatientDto } from './dto/register-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { AllowUnregistered } from '../common/decorators/allow-unregistered.decorator.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('register')
  @UseGuards(DeviceAuthGuard)
  @AllowUnregistered()
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Register or return existing patient' })
  async register(@Req() req: any, @Body() dto: RegisterPatientDto) {
    return this.patientService.registerOrGet(req.deviceId, dto);
  }

  @Get('me')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@Req() req: any) {
    return this.patientService.getProfile(req.deviceId);
  }

  @Patch('me')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdatePatientDto) {
    return this.patientService.updateProfile(req.deviceId, dto);
  }

  @Get('me/requests')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own blood requests' })
  async getMyRequests(
    @CurrentDevice() patient: any,
    @Query() query: PaginationQueryDto,
  ) {
    return this.patientService.getMyRequests(patient.id, query.page, query.limit);
  }

  @Patch('me/fcm-token')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update FCM token' })
  async updateFcmToken(@Req() req: any, @Body('fcmToken') fcmToken: string) {
    return this.patientService.updateFcmToken(req.deviceId, fcmToken);
  }
}
