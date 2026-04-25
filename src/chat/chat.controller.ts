import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Create or get chat room for a blood request' })
  async createRoom(
    @Body() body: { bloodRequestId: string },
    @CurrentDevice() user: any,
    @Req() req: any,
  ) {
    return this.chatService.createOrGetRoom(
      body.bloodRequestId,
      user.id,
      req.deviceUserType,
    );
  }

  @Get('rooms')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'List own chat rooms' })
  async getRooms(
    @CurrentDevice() user: any,
    @Req() req: any,
    @Query() query: PaginationQueryDto,
  ) {
    return this.chatService.getUserRooms(
      user.id,
      req.deviceUserType,
      query.page,
      query.limit,
    );
  }

  @Get('rooms/:id/messages')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Get chat room messages' })
  async getMessages(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.chatService.getRoomMessages(id, query.page, query.limit);
  }
}
