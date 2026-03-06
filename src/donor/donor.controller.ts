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
import { DonorService } from './donor.service.js';
import { RegisterDonorDto } from './dto/register-donor.dto.js';
import { UpdateDonorDto } from './dto/update-donor.dto.js';
import { DonorSearchQueryDto } from './dto/donor-search-query.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { AllowUnregistered } from '../common/decorators/allow-unregistered.decorator.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Donors')
@Controller('donors')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  @Post('register')
  @UseGuards(DeviceAuthGuard)
  @AllowUnregistered()
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Register or return existing donor' })
  async register(@Req() req: any, @Body() dto: RegisterDonorDto) {
    return this.donorService.registerOrGet(req.deviceId, dto);
  }

  @Get('me')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@Req() req: any) {
    return this.donorService.getProfile(req.deviceId);
  }

  @Patch('me')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateDonorDto) {
    return this.donorService.updateProfile(req.deviceId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search donors by blood type, distance, availability' })
  async search(@Query() query: DonorSearchQueryDto) {
    return this.donorService.search(query);
  }

  @Get('me/donations')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own donation history' })
  async getMyDonations(
    @CurrentDevice() donor: any,
    @Query() query: PaginationQueryDto,
  ) {
    return this.donorService.getDonorDonations(donor.id, query.page, query.limit);
  }

  @Get('me/offers')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own donation offers' })
  async getMyOffers(
    @CurrentDevice() donor: any,
    @Query() query: PaginationQueryDto,
  ) {
    return this.donorService.getDonorOffers(donor.id, query.page, query.limit);
  }

  @Get('me/badges')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own badges' })
  async getMyBadges(@CurrentDevice() donor: any) {
    return this.donorService.getDonorBadges(donor.id);
  }

  @Get('me/points')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own points and transaction history' })
  async getMyPoints(
    @CurrentDevice() donor: any,
    @Query() query: PaginationQueryDto,
  ) {
    return this.donorService.getDonorPoints(donor.id, query.page, query.limit);
  }

  @Patch('me/fcm-token')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update FCM token' })
  async updateFcmToken(@Req() req: any, @Body('fcmToken') fcmToken: string) {
    return this.donorService.updateFcmToken(req.deviceId, fcmToken);
  }

  @Patch('me/availability')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Toggle availability' })
  async toggleAvailability(@Req() req: any) {
    return this.donorService.toggleAvailability(req.deviceId);
  }
}
