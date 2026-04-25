import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGetRoom(bloodRequestId: string, currentUserId: string, currentUserType: string) {
    const bloodRequest = await this.prisma.bloodRequest.findUnique({
      where: { id: bloodRequestId },
      select: { id: true, patientId: true },
    });
    if (!bloodRequest) {
      throw new NotFoundException('Blood request not found');
    }

    const type = (currentUserType || '').toUpperCase();
    let donorId: string | null = null;
    let patientId: string | null = null;

    if (type === 'DONOR') {
      donorId = currentUserId;
      patientId = bloodRequest.patientId;
    } else if (type === 'PATIENT') {
      patientId = currentUserId;
      if (patientId !== bloodRequest.patientId) {
        throw new ForbiddenException('Patient does not own this blood request');
      }
    } else {
      throw new ForbiddenException('Unsupported user type for chat');
    }

    const existing = await this.prisma.chatRoom.findFirst({
      where: {
        bloodRequestId,
        AND: [
          ...(donorId ? [{ participants: { some: { donorId } } }] : []),
          ...(patientId ? [{ participants: { some: { patientId } } }] : []),
        ],
      },
      include: { participants: true },
    });

    if (existing) return existing;

    return this.prisma.chatRoom.create({
      data: {
        bloodRequestId,
        participants: {
          create: [
            ...(donorId ? [{ donorId }] : []),
            ...(patientId ? [{ patientId }] : []),
          ],
        },
      },
      include: { participants: true },
    });
  }

  async getUserRooms(userId: string, userType: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = {
      participants: {
        some: userType === 'DONOR' ? { donorId: userId } : { patientId: userId },
      },
    };

    const [rooms, total] = await Promise.all([
      this.prisma.chatRoom.findMany({
        where,
        skip,
        take: limit,
        include: {
          participants: {
            include: {
              donor: { select: { id: true, name: true } },
              patient: { select: { id: true, name: true } },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.chatRoom.count({ where }),
    ]);
    return paginate(rooms, total, page, limit);
  }

  async getRoomMessages(roomId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { chatRoomId: roomId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.chatMessage.count({ where: { chatRoomId: roomId } }),
    ]);
    return paginate(messages, total, page, limit);
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    senderType: string,
    content: string,
    type: string = 'TEXT',
  ) {
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          chatRoomId: roomId,
          senderId,
          senderType: senderType as any,
          content,
          type: type as any,
        },
      }),
      this.prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      }),
    ]);
    return message;
  }

  async markRead(roomId: string, userId: string, userType: string) {
    const where: any = { chatRoomId: roomId };
    if (userType === 'DONOR') where.donorId = userId;
    else where.patientId = userId;

    const participant = await this.prisma.chatParticipant.findFirst({ where });
    if (participant) {
      await this.prisma.chatParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      });
    }
  }
}
