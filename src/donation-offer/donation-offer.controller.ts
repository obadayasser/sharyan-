import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { DonationOfferService } from './donation-offer.service.js';
import { CreateDonationOfferDto } from './dto/create-donation-offer.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';

@ApiTags('Donation Offers')
@Controller('donation-offers')
export class DonationOfferController {
  constructor(private readonly donationOfferService: DonationOfferService) {}

  @Post()
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Offer to donate for a blood request' })
  async create(@CurrentDevice() donor: any, @Body() dto: CreateDonationOfferDto) {
    return this.donationOfferService.create(donor.id, dto);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'List offers for a blood request' })
  async findByRequest(@Param('requestId') requestId: string) {
    return this.donationOfferService.findByRequest(requestId);
  }

  @Patch(':id/accept')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Accept a donation offer' })
  async accept(@Param('id') id: string, @CurrentDevice() patient: any) {
    return this.donationOfferService.accept(id, patient.id);
  }

  @Patch(':id/reject')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Reject a donation offer' })
  async reject(@Param('id') id: string, @CurrentDevice() patient: any) {
    return this.donationOfferService.reject(id, patient.id);
  }

  @Patch(':id/complete')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Mark offer as completed (triggers donation record)' })
  async complete(@Param('id') id: string) {
    return this.donationOfferService.complete(id);
  }

  @Patch(':id/cancel')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Cancel own offer' })
  async cancel(@Param('id') id: string, @CurrentDevice() donor: any) {
    return this.donationOfferService.cancel(id, donor.id);
  }
}
