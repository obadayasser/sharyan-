import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignService } from './campaign.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { CampaignQueryDto } from './dto/campaign-query.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Create campaign (blood bank only)' })
  async create(@CurrentDevice() bank: any, @Body() dto: CreateCampaignDto) {
    return this.campaignService.create(bank.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List campaigns' })
  async findAll(@Query() query: CampaignQueryDto) {
    return this.campaignService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign detail' })
  async findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update campaign' })
  async update(
    @Param('id') id: string,
    @CurrentDevice() bank: any,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, bank.id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel campaign' })
  async cancel(@Param('id') id: string) {
    return this.campaignService.cancel(id);
  }

  @Post(':id/register')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Register for campaign (donor)' })
  async register(@Param('id') id: string, @CurrentDevice() donor: any) {
    return this.campaignService.register(id, donor.id);
  }

  @Delete(':id/register')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Unregister from campaign' })
  async unregister(@Param('id') id: string, @CurrentDevice() donor: any) {
    return this.campaignService.unregister(id, donor.id);
  }

  @Patch(':id/attendance/:donorId')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Mark donor attendance' })
  async markAttendance(
    @Param('id') id: string,
    @Param('donorId') donorId: string,
  ) {
    return this.campaignService.markAttendance(id, donorId);
  }
}
