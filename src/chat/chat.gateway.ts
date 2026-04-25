import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import { ChatService } from './chat.service.js';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    const deviceId =
      client.handshake.auth?.deviceId ||
      (client.handshake.headers['x-device-id'] as string | undefined);
    const rawUserType =
      client.handshake.auth?.userType ||
      (client.handshake.headers['x-user-type'] as string | undefined);
    const userType = (rawUserType || '').toUpperCase();

    if (!deviceId || !userType) {
      client.disconnect();
      return;
    }

    let user: any = null;
    if (userType === 'DONOR') {
      user = await this.prisma.donor.findUnique({ where: { deviceId } });
    } else if (userType === 'PATIENT') {
      user = await this.prisma.patient.findUnique({ where: { deviceId } });
    }

    if (!user) {
      client.disconnect();
      return;
    }

    client.data.userId = user.id;
    client.data.userType = userType;
    client.data.userName = user.name;
  }

  handleDisconnect(client: Socket) {
    // Cleanup
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(`room:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`room:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: string },
  ) {
    return this.dispatchMessage(client, data);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: string },
  ) {
    return this.dispatchMessage(client, data);
  }

  private async dispatchMessage(
    client: Socket,
    data: { roomId: string; content: string; type?: string },
  ) {
    if (!client.data?.userId) {
      return { error: 'Not authenticated' };
    }
    if (!data?.roomId || !data?.content) {
      return { error: 'roomId and content are required' };
    }

    const saved = await this.chatService.sendMessage(
      data.roomId,
      client.data.userId,
      client.data.userType,
      data.content,
      data.type || 'TEXT',
    );

    const payload = { ...saved, senderName: client.data.userName };
    this.server.to(`room:${data.roomId}`).emit('message', payload);
    this.server.to(`room:${data.roomId}`).emit('newMessage', payload);

    return saved;
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.to(`room:${data.roomId}`).emit('userTyping', {
      roomId: data.roomId,
      userId: client.data.userId,
      userType: client.data.userType,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    await this.chatService.markRead(
      data.roomId,
      client.data.userId,
      client.data.userType,
    );
    this.server.to(`room:${data.roomId}`).emit('messagesRead', {
      roomId: data.roomId,
      userId: client.data.userId,
    });
  }
}
