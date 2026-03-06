import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) return;

    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not configured. Push notifications will be disabled.',
      );
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    this.logger.log('Firebase Admin SDK initialized');
  }

  private get isInitialized(): boolean {
    return admin.apps.length > 0;
  }

  async sendToDevice(
    fcmToken: string,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification,
        data: data || {},
        android: {
          priority: 'high',
          notification: { channelId: 'sharyan_notifications' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });
      return true;
    } catch (error: any) {
      if (
        error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token'
      ) {
        this.logger.warn(`Invalid FCM token: ${fcmToken.substring(0, 20)}...`);
      } else {
        this.logger.error(`FCM send failed: ${error.message}`);
      }
      return false;
    }
  }

  async sendToMultipleDevices(
    fcmTokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.isInitialized || fcmTokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification,
        data: data || {},
        android: {
          priority: 'high',
          notification: { channelId: 'sharyan_notifications' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });

      if (response.failureCount > 0) {
        this.logger.warn(
          `FCM multicast: ${response.successCount} success, ${response.failureCount} failed`,
        );
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error: any) {
      this.logger.error(`FCM multicast failed: ${error.message}`);
      return { successCount: 0, failureCount: fcmTokens.length };
    }
  }

  async sendToTopic(
    topic: string,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      await admin.messaging().send({
        topic,
        notification,
        data: data || {},
      });
      return true;
    } catch (error: any) {
      this.logger.error(`FCM topic send failed: ${error.message}`);
      return false;
    }
  }
}
