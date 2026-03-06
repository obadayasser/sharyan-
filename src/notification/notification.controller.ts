import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service.js';
import { NotificationGateway } from './notification.gateway.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get()
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get own notifications' })
  async findAll(
    @CurrentDevice() user: any,
    @Query() query: PaginationQueryDto,
    @Query('userType') userType: string,
  ) {
    if (userType === 'DONOR') {
      return this.notificationService.findByDonor(user.id, query.page, query.limit);
    }
    return this.notificationService.findByPatient(user.id, query.page, query.limit);
  }

  @Get('unread-count')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentDevice() user: any, @Query('userType') userType: string) {
    const count = await this.notificationService.getUnreadCount(user.id, userType || 'DONOR');
    return { count };
  }

  @Patch(':id/read')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read-all')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentDevice() user: any, @Query('userType') userType: string) {
    return this.notificationService.markAllAsRead(user.id, userType || 'DONOR');
  }

  @Post('broadcast')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send broadcast notification' })
  async broadcast(
    @Body() body: { title: string; body: string; titleAr?: string; bodyAr?: string },
  ) {
    this.notificationGateway.broadcastToAll('notification', {
      type: 'SYSTEM',
      title: body.title,
      body: body.body,
      titleAr: body.titleAr,
      bodyAr: body.bodyAr,
    });

    await this.notificationService.broadcastPush(
      { title: body.title, body: body.body },
      { type: 'SYSTEM' },
    );

    return { message: 'Broadcast sent' };
  }
}
