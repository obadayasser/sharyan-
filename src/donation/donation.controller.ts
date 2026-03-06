import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DonationService } from './donation.service.js';
import { RecordDonationDto } from './dto/record-donation.dto.js';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard.js';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Donations')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@Controller('donations')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post()
  @ApiOperation({ summary: 'Manually record a donation' })
  async record(@Body() dto: RecordDonationDto, @CurrentAdmin() admin: any) {
    return this.donationService.record(dto, admin.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all donations' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.donationService.findAll(query.page, query.limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get donation statistics' })
  async getStats() {
    return this.donationService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single donation detail' })
  async findOne(@Param('id') id: string) {
    return this.donationService.findOne(id);
  }
}
