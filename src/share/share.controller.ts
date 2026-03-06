import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ShareService } from './share.service.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';

@ApiTags('Share')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post('blood-request/:id')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Generate share link for blood request' })
  async generateLink(@Param('id') id: string) {
    return this.shareService.generateShareLink(id);
  }

  @Get(':token')
  @ApiOperation({ summary: 'Resolve share token to request data' })
  async resolve(@Param('token') token: string) {
    return this.shareService.resolveShareToken(token);
  }
}
