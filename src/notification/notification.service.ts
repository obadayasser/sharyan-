import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FirebaseService } from '../firebase/firebase.service.js';
import { NotificationType } from '@prisma/client';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async create(data: {
    donorId?: string;
    patientId?: string;
    type: NotificationType;
    title: string;
    titleAr?: string;
    body: string;
    bodyAr?: string;
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({ data });

    await this.sendPushToUser(data.donorId, data.patientId, {
      title: data.title,
      body: data.body,
      data: {
        type: data.type,
        notificationId: notification.id,
        ...(data.data ? this.stringifyData(data.data) : {}),
      },
    });

    return notification;
  }

  async createBulk(
    notifications: {
      donorId?: string;
      patientId?: string;
      type: NotificationType;
      title: string;
      titleAr?: string;
      body: string;
      bodyAr?: string;
      data?: any;
    }[],
  ) {
    const result = await this.prisma.notification.createMany({
      data: notifications,
    });

    const donorIds = notifications
      .filter((n) => n.donorId)
      .map((n) => n.donorId!);
    const patientIds = notifications
      .filter((n) => n.patientId)
      .map((n) => n.patientId!);

    if (donorIds.length > 0) {
      const donors = await this.prisma.donor.findMany({
        where: { id: { in: donorIds }, fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      const tokens = donors
        .map((d) => d.fcmToken)
        .filter((t): t is string => !!t);

      if (tokens.length > 0) {
        const sample = notifications[0];
        await this.firebase.sendToMultipleDevices(
          tokens,
          { title: sample.title, body: sample.body },
          {
            type: sample.type,
            ...(sample.data ? this.stringifyData(sample.data) : {}),
          },
        );
      }
    }

    if (patientIds.length > 0) {
      const patients = await this.prisma.patient.findMany({
        where: { id: { in: patientIds }, fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      const tokens = patients
        .map((p) => p.fcmToken)
        .filter((t): t is string => !!t);

      if (tokens.length > 0) {
        const sample = notifications[0];
        await this.firebase.sendToMultipleDevices(
          tokens,
          { title: sample.title, body: sample.body },
          {
            type: sample.type,
            ...(sample.data ? this.stringifyData(sample.data) : {}),
          },
        );
      }
    }

    return result;
  }

  async sendPushOnly(
    fcmTokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ) {
    return this.firebase.sendToMultipleDevices(fcmTokens, notification, data);
  }

  async broadcastPush(
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ) {
    return this.firebase.sendToTopic('all_users', notification, data);
  }

  async findByDonor(donorId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { donorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { donorId } }),
    ]);
    return paginate(notifications, total, page, limit);
  }

  async findByPatient(
    patientId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { patientId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { patientId } }),
    ]);
    return paginate(notifications, total, page, limit);
  }

  async getUnreadCount(userId: string, userType: string) {
    const where: any = { isRead: false };
    if (userType === 'DONOR') where.donorId = userId;
    else where.patientId = userId;
    return this.prisma.notification.count({ where });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string, userType: string) {
    const where: any = { isRead: false };
    if (userType === 'DONOR') where.donorId = userId;
    else where.patientId = userId;
    return this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });
  }

  private async sendPushToUser(
    donorId?: string,
    patientId?: string,
    push?: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ) {
    if (!push) return;

    let fcmToken: string | null = null;

    if (donorId) {
      const donor = await this.prisma.donor.findUnique({
        where: { id: donorId },
        select: { fcmToken: true },
      });
      fcmToken = donor?.fcmToken || null;
    } else if (patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { fcmToken: true },
      });
      fcmToken = patient?.fcmToken || null;
    }

    if (fcmToken) {
      await this.firebase.sendToDevice(
        fcmToken,
        { title: push.title, body: push.body },
        push.data,
      );
    }
  }

  private stringifyData(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }
}
