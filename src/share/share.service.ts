import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async generateShareLink(requestId: string) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Blood request not found');

    if (request.shareToken) {
      return {
        shareToken: request.shareToken,
        shareUrl: `https://sharyan.app/share/${request.shareToken}`,
        whatsappUrl: `https://wa.me/?text=${encodeURIComponent(`A patient needs ${request.bloodType} blood. Help save a life! https://sharyan.app/share/${request.shareToken}`)}`,
        telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(`https://sharyan.app/share/${request.shareToken}`)}&text=${encodeURIComponent(`A patient needs ${request.bloodType} blood. Help save a life!`)}`,
      };
    }

    const shareToken = uuidv4();
    await this.prisma.bloodRequest.update({
      where: { id: requestId },
      data: { shareToken },
    });

    return {
      shareToken,
      shareUrl: `https://sharyan.app/share/${shareToken}`,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(`A patient needs ${request.bloodType} blood. Help save a life! https://sharyan.app/share/${shareToken}`)}`,
      telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(`https://sharyan.app/share/${shareToken}`)}&text=${encodeURIComponent(`A patient needs ${request.bloodType} blood. Help save a life!`)}`,
    };
  }

  async resolveShareToken(token: string) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { shareToken: token },
      include: {
        patient: { select: { name: true, mobile: true } },
        bloodBank: { select: { name: true, phone: true, address: true } },
      },
    });
    if (!request) throw new NotFoundException('Shared request not found');
    return request;
  }
}
