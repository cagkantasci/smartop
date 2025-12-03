import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as admin from 'firebase-admin';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseInitialized = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

    if (!serviceAccountJson) {
      this.logger.warn('Firebase service account not configured. Push notifications disabled.');
      return;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJson);

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      this.firebaseInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  async registerDevice(userId: string, token: string, platform: 'ios' | 'android' | 'web') {
    // Store device token in user metadata or separate table
    // For now, we'll use the user's metadata field
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Store in a separate device_tokens table (we need to add this to schema)
    // For now, we'll log it
    this.logger.log(`Device registered for user ${userId}: ${platform}`);

    return { success: true };
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<boolean> {
    if (!this.firebaseInitialized) {
      this.logger.debug('Firebase not initialized. Skipping push notification.');
      return false;
    }

    try {
      // In production, you'd fetch the user's device tokens from the database
      // For now, we'll log the notification
      this.logger.log(`Push notification for user ${userId}: ${payload.title}`);

      // Example FCM message structure (when device tokens are available)
      /*
      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        token: deviceToken, // User's FCM token
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'smartop_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      await admin.messaging().send(message);
      */

      return true;
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}:`, error);
      return false;
    }
  }

  async sendToUsers(userIds: string[], payload: PushPayload): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };

    for (const userId of userIds) {
      const sent = await this.sendToUser(userId, payload);
      if (sent) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  async sendToTopic(topic: string, payload: PushPayload): Promise<boolean> {
    if (!this.firebaseInitialized) {
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        topic,
      };

      await admin.messaging().send(message);
      this.logger.log(`Push sent to topic ${topic}: ${payload.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push to topic ${topic}:`, error);
      return false;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.firebaseInitialized || tokens.length === 0) {
      return false;
    }

    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      return true;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.firebaseInitialized || tokens.length === 0) {
      return false;
    }

    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }
}
