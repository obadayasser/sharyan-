import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { BloodRequestService } from './blood-request.service.js';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto.js';
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto.js';
import { BloodRequestQueryDto } from './dto/blood-request-query.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';

@ApiTags('Blood Requests')
@Controller('blood-requests')
export class BloodRequestController {
  constructor(private readonly bloodRequestService: BloodRequestService) {}

  @Post()
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Create new blood request' })
  async create(@CurrentDevice() patient: any, @Body() dto: CreateBloodRequestDto) {
    return this.bloodRequestService.create(patient.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List open blood requests' })
  async findAll(@Query() query: BloodRequestQueryDto) {
    return this.bloodRequestService.findAll(query);
  }

  @Get('share/:shareToken')
  @ApiOperation({ summary: 'Get request by share token' })
  async findByShareToken(@Param('shareToken') shareToken: string) {
    return this.bloodRequestService.findByShareToken(shareToken);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single blood request' })
  async findOne(@Param('id') id: string) {
    return this.bloodRequestService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update blood request' })
  async update(
    @Param('id') id: string,
    @CurrentDevice() patient: any,
    @Body() dto: UpdateBloodRequestDto,
  ) {
    return this.bloodRequestService.update(id, patient.id, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Cancel blood request' })
  async cancel(@Param('id') id: string, @CurrentDevice() patient: any) {
    return this.bloodRequestService.cancel(id, patient.id);
  }

  @Post(':id/notify-donors')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Find and notify nearby compatible donors' })
  async notifyDonors(@Param('id') id: string) {
    return this.bloodRequestService.findNearbyDonorsForRequest(id);
  }
}
