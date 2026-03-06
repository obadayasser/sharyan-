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

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const deviceId = client.handshake.auth?.deviceId;
    const userType = client.handshake.auth?.userType;

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
    client.join(`user:${userType.toLowerCase()}:${user.id}`);
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed
  }

  @SubscribeMessage('markNotificationRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    await this.prisma.notification.update({
      where: { id: data.notificationId },
      data: { isRead: true },
    });
    return { success: true };
  }

  sendToUser(userType: string, userId: string, event: string, data: any) {
    this.server
      .to(`user:${userType.toLowerCase()}:${userId}`)
      .emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
