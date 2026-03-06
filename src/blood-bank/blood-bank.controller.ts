import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { BloodBankService } from './blood-bank.service.js';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto.js';
import { UpdateBloodBankDto } from './dto/update-blood-bank.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard.js';
import { AllowUnregistered } from '../common/decorators/allow-unregistered.decorator.js';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Blood Banks')
@Controller('blood-banks')
export class BloodBankController {
  constructor(private readonly bloodBankService: BloodBankService) {}

  @Post('register')
  @UseGuards(DeviceAuthGuard)
  @AllowUnregistered()
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Register blood bank (status=PENDING)' })
  async register(@Req() req: any, @Body() dto: RegisterBloodBankDto) {
    return this.bloodBankService.registerOrGet(req.deviceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List approved blood banks' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.bloodBankService.findAll(query.page, query.limit);
  }

  @Get('pending')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending blood bank applications' })
  async findPending(@Query() query: PaginationQueryDto) {
    return this.bloodBankService.findPending(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blood bank detail with stock' })
  async findOne(@Param('id') id: string) {
    return this.bloodBankService.findOne(id);
  }

  @Patch('me')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update own blood bank profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateBloodBankDto) {
    return this.bloodBankService.updateProfile(req.deviceId, dto);
  }

  @Get('me/stock')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own stock levels' })
  async getMyStock(@Req() req: any) {
    return this.bloodBankService.getMyStock(req.deviceId);
  }

  @Patch(':id/approve')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve blood bank' })
  async approve(@Param('id') id: string, @CurrentAdmin() admin: any) {
    return this.bloodBankService.approve(id, admin.id);
  }

  @Patch(':id/reject')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject blood bank' })
  async reject(@Param('id') id: string) {
    return this.bloodBankService.reject(id);
  }

  @Patch(':id/suspend')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend blood bank' })
  async suspend(@Param('id') id: string) {
    return this.bloodBankService.suspend(id);
  }
}
