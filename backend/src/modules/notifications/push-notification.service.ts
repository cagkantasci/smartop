import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as admin from 'firebase-admin';
import { DevicePlatform } from '@prisma/client';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

interface RegisterDeviceDto {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
  deviceModel?: string;
  appVersion?: string;
}

interface SendResult {
  success: number;
  failed: number;
  invalidTokens: string[];
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

      // Fix escaped newlines in private_key
      // .env files don't process escape sequences, so \n is stored as literal backslash-n
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

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

  isInitialized(): boolean {
    return this.firebaseInitialized;
  }

  // ============================================
  // DEVICE TOKEN MANAGEMENT
  // ============================================

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const { token, platform, deviceName, deviceModel, appVersion } = dto;

    // Upsert device token
    const deviceToken = await this.prisma.deviceToken.upsert({
      where: {
        userId_token: { userId, token },
      },
      update: {
        platform: platform as DevicePlatform,
        deviceName,
        deviceModel,
        appVersion,
        isActive: true,
        lastUsedAt: new Date(),
      },
      create: {
        userId,
        token,
        platform: platform as DevicePlatform,
        deviceName,
        deviceModel,
        appVersion,
      },
    });

    this.logger.log(`Device registered for user ${userId}: ${platform} - ${deviceName || 'Unknown'}`);

    return deviceToken;
  }

  async unregisterDevice(userId: string, token: string) {
    await this.prisma.deviceToken.updateMany({
      where: { userId, token },
      data: { isActive: false },
    });

    this.logger.log(`Device unregistered for user ${userId}`);
  }

  async removeInvalidTokens(tokens: string[]) {
    if (tokens.length === 0) return;

    await this.prisma.deviceToken.updateMany({
      where: { token: { in: tokens } },
      data: { isActive: false },
    });

    this.logger.log(`Deactivated ${tokens.length} invalid tokens`);
  }

  async getUserTokens(userId: string): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });

    return tokens.map(t => t.token);
  }

  async getUsersTokens(userIds: string[]): Promise<Map<string, string[]>> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds }, isActive: true },
      select: { userId: true, token: true },
    });

    const tokenMap = new Map<string, string[]>();
    for (const t of tokens) {
      if (!tokenMap.has(t.userId)) {
        tokenMap.set(t.userId, []);
      }
      tokenMap.get(t.userId)!.push(t.token);
    }

    return tokenMap;
  }

  // ============================================
  // SEND NOTIFICATIONS
  // ============================================

  async sendToUser(userId: string, payload: PushPayload): Promise<SendResult> {
    const result: SendResult = { success: 0, failed: 0, invalidTokens: [] };

    if (!this.firebaseInitialized) {
      this.logger.debug('Firebase not initialized. Skipping push notification.');
      return result;
    }

    const tokens = await this.getUserTokens(userId);
    if (tokens.length === 0) {
      this.logger.debug(`No device tokens for user ${userId}`);
      return result;
    }

    return this.sendToTokens(tokens, payload);
  }

  async sendToUsers(userIds: string[], payload: PushPayload): Promise<SendResult> {
    const result: SendResult = { success: 0, failed: 0, invalidTokens: [] };

    if (!this.firebaseInitialized) {
      return result;
    }

    const tokenMap = await this.getUsersTokens(userIds);
    const allTokens = Array.from(tokenMap.values()).flat();

    if (allTokens.length === 0) {
      return result;
    }

    return this.sendToTokens(allTokens, payload);
  }

  async sendToTokens(tokens: string[], payload: PushPayload): Promise<SendResult> {
    const result: SendResult = { success: 0, failed: 0, invalidTokens: [] };

    if (!this.firebaseInitialized || tokens.length === 0) {
      return result;
    }

    try {
      // Firebase supports up to 500 tokens per multicast
      const batchSize = 500;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);

        const message: admin.messaging.MulticastMessage = {
          notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.imageUrl,
          },
          data: payload.data,
          tokens: batch,
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
          webpush: {
            notification: {
              icon: '/icon-192.png',
              badge: '/badge-72.png',
            },
          },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        result.success += response.successCount;
        result.failed += response.failureCount;

        // Collect invalid tokens
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              result.invalidTokens.push(batch[idx]);
            }
          }
        });
      }

      // Remove invalid tokens from database
      if (result.invalidTokens.length > 0) {
        await this.removeInvalidTokens(result.invalidTokens);
      }

      this.logger.log(
        `Push sent: ${result.success} success, ${result.failed} failed, ${result.invalidTokens.length} invalid`,
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to send push notifications:', error);
      return result;
    }
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
            },
          },
        },
      };

      await admin.messaging().send(message);
      this.logger.log(`Push sent to topic ${topic}: ${payload.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push to topic ${topic}:`, error);
      return false;
    }
  }

  // ============================================
  // TOPIC MANAGEMENT
  // ============================================

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.firebaseInitialized || tokens.length === 0) {
      return false;
    }

    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${tokens.length} tokens to topic ${topic}`);
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
      this.logger.log(`Unsubscribed ${tokens.length} tokens from topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }

  // Subscribe user to organization topic for broadcasts
  async subscribeUserToOrgTopic(userId: string, organizationId: string) {
    const tokens = await this.getUserTokens(userId);
    if (tokens.length > 0) {
      await this.subscribeToTopic(tokens, `org_${organizationId}`);
    }
  }

  // ============================================
  // NOTIFICATION HELPERS
  // ============================================

  async notifyJobAssigned(operatorId: string, jobTitle: string, jobId: string) {
    return this.sendToUser(operatorId, {
      title: 'Yeni İş Atandı',
      body: `"${jobTitle}" işi size atandı.`,
      data: {
        type: 'job_assigned',
        jobId,
      },
    });
  }

  async notifyJobStarted(managerIds: string[], jobTitle: string, jobId: string, operatorName: string) {
    return this.sendToUsers(managerIds, {
      title: 'İş Başladı',
      body: `"${jobTitle}" işi ${operatorName} tarafından başlatıldı.`,
      data: {
        type: 'job_started',
        jobId,
      },
    });
  }

  async notifyJobCompleted(managerIds: string[], jobTitle: string, jobId: string) {
    return this.sendToUsers(managerIds, {
      title: 'İş Tamamlandı',
      body: `"${jobTitle}" işi tamamlandı.`,
      data: {
        type: 'job_completed',
        jobId,
      },
    });
  }

  async notifyChecklistSubmitted(managerId: string, machineName: string, checklistId: string, operatorName: string) {
    return this.sendToUser(managerId, {
      title: 'Checklist Gönderildi',
      body: `${operatorName}, ${machineName} için checklist gönderdi.`,
      data: {
        type: 'checklist_submitted',
        checklistId,
      },
    });
  }

  async notifyChecklistApproved(operatorId: string, machineName: string, checklistId: string) {
    return this.sendToUser(operatorId, {
      title: 'Checklist Onaylandı',
      body: `${machineName} için gönderdiğiniz checklist onaylandı.`,
      data: {
        type: 'checklist_approved',
        checklistId,
      },
    });
  }

  async notifyChecklistRejected(operatorId: string, machineName: string, checklistId: string, reason?: string) {
    return this.sendToUser(operatorId, {
      title: 'Checklist Reddedildi',
      body: reason
        ? `${machineName} checklist reddedildi: ${reason}`
        : `${machineName} için gönderdiğiniz checklist reddedildi.`,
      data: {
        type: 'checklist_rejected',
        checklistId,
      },
    });
  }

  async notifyMaintenanceDue(operatorId: string, machineName: string, machineId: string) {
    return this.sendToUser(operatorId, {
      title: 'Bakım Zamanı',
      body: `${machineName} için planlı bakım zamanı geldi.`,
      data: {
        type: 'maintenance_due',
        machineId,
      },
    });
  }

  async notifyMachineIssue(managerIds: string[], machineName: string, machineId: string, issueDescription: string) {
    return this.sendToUsers(managerIds, {
      title: 'Makine Sorunu',
      body: `${machineName}: ${issueDescription}`,
      data: {
        type: 'machine_issue',
        machineId,
      },
    });
  }
}
