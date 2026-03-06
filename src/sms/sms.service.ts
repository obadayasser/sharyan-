import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async sendSms(phone: string, message: string, referenceId?: string) {
    this.logger.log(`Sending SMS to ${phone}: ${message}`);

    // TODO: Integrate with actual SMS provider (Twilio, etc.)
    // For now, just log and record
    const log = await this.prisma.smsLog.create({
      data: {
        recipientPhone: phone,
        message,
        status: 'sent',
        provider: this.configService.get('SMS_PROVIDER') || 'mock',
        referenceId,
      },
    });

    return log;
  }

  async sendEmergencySms(
    phone: string,
    hospitalName: string,
    bloodType: string,
    contactPhone: string,
  ) {
    const message = `URGENT: A patient needs ${bloodType} blood at ${hospitalName}. If you can donate, please contact ${contactPhone}. - Sharyan شريان`;
    return this.sendSms(phone, message);
  }

  async sendBulkSms(
    recipients: { phone: string; message: string }[],
    referenceId?: string,
  ) {
    const results: any[] = [];
    for (const r of recipients) {
      const result = await this.sendSms(r.phone, r.message, referenceId);
      results.push(result);
    }
    return results;
  }
}
