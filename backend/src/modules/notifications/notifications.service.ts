import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from './email.service';
import { PushNotificationService } from './push-notification.service';

export type NotificationType =
  | 'checklist_submitted'
  | 'checklist_approved'
  | 'checklist_rejected'
  | 'job_assigned'
  | 'job_started'
  | 'job_completed'
  | 'maintenance_due'
  | 'machine_issue'
  | 'system';

interface NotificationPayload {
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendPush?: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private pushService: PushNotificationService,
  ) {}

  async create(payload: NotificationPayload) {
    const { organizationId, userId, type, title, body, data, sendEmail, sendPush } = payload;

    // Create notification in database
    const notification = await this.prisma.notification.create({
      data: {
        organizationId,
        userId,
        type,
        title,
        body,
        data: data || {},
      },
      include: {
        user: true,
      },
    });

    // Send email notification if requested
    if (sendEmail && notification.user.email) {
      await this.emailService.sendNotificationEmail({
        to: notification.user.email,
        subject: title,
        template: 'notification',
        context: {
          userName: `${notification.user.firstName} ${notification.user.lastName}`,
          title,
          body,
          type,
          data,
        },
      });
    }

    // Send push notification if requested
    if (sendPush) {
      await this.pushService.sendToUser(userId, {
        title,
        body: body || '',
        data: {
          type,
          notificationId: notification.id,
          ...data,
        },
      });
    }

    return notification;
  }

  async createBulk(
    organizationId: string,
    userIds: string[],
    type: NotificationType,
    title: string,
    body?: string,
    data?: Record<string, any>,
  ) {
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        organizationId,
        userId,
        type,
        title,
        body,
        data: data || {},
      })),
    });

    // Send push notifications to all users
    await this.pushService.sendToUsers(userIds, {
      title,
      body: body || '',
      data: { type, ...data },
    });

    return notifications;
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // Specific notification helpers
  async notifyChecklistSubmitted(submission: {
    id: string;
    organizationId: string;
    operatorId: string;
    machineId: string;
    operator: { firstName: string; lastName: string };
    machine: { name: string };
  }) {
    // Find managers in the organization
    const managers = await this.prisma.user.findMany({
      where: {
        organizationId: submission.organizationId,
        role: 'manager',
        isActive: true,
      },
    });

    const operatorName = `${submission.operator.firstName} ${submission.operator.lastName}`;
    const machineName = submission.machine.name;

    for (const manager of managers) {
      await this.create({
        organizationId: submission.organizationId,
        userId: manager.id,
        type: 'checklist_submitted',
        title: 'Yeni Checklist Gönderildi',
        body: `${operatorName} tarafından ${machineName} için checklist gönderildi.`,
        data: {
          submissionId: submission.id,
          machineId: submission.machineId,
          operatorId: submission.operatorId,
        },
        sendEmail: true,
        sendPush: true,
      });
    }
  }

  async notifyChecklistReviewed(submission: {
    id: string;
    organizationId: string;
    operatorId: string;
    status: string;
    reviewerNotes?: string;
    machine: { name: string };
    reviewer: { firstName: string; lastName: string };
  }) {
    const isApproved = submission.status === 'approved';
    const reviewerName = `${submission.reviewer.firstName} ${submission.reviewer.lastName}`;

    await this.create({
      organizationId: submission.organizationId,
      userId: submission.operatorId,
      type: isApproved ? 'checklist_approved' : 'checklist_rejected',
      title: isApproved ? 'Checklist Onaylandı' : 'Checklist Reddedildi',
      body: `${submission.machine.name} için gönderdiğiniz checklist ${reviewerName} tarafından ${isApproved ? 'onaylandı' : 'reddedildi'}.${submission.reviewerNotes ? ` Not: ${submission.reviewerNotes}` : ''}`,
      data: {
        submissionId: submission.id,
        status: submission.status,
      },
      sendEmail: true,
      sendPush: true,
    });
  }

  async notifyJobAssigned(job: {
    id: string;
    organizationId: string;
    title: string;
    description?: string;
  }, operatorIds: string[]) {
    for (const operatorId of operatorIds) {
      await this.create({
        organizationId: job.organizationId,
        userId: operatorId,
        type: 'job_assigned',
        title: 'Yeni İş Atandı',
        body: `Size "${job.title}" işi atandı.`,
        data: {
          jobId: job.id,
        },
        sendEmail: true,
        sendPush: true,
      });
    }
  }

  async notifyMaintenanceDue(machine: {
    id: string;
    organizationId: string;
    name: string;
    assignedOperatorId?: string;
  }) {
    const users = await this.prisma.user.findMany({
      where: {
        organizationId: machine.organizationId,
        role: { in: ['manager', 'admin'] },
        isActive: true,
      },
    });

    const userIds = users.map((u) => u.id);
    if (machine.assignedOperatorId) {
      userIds.push(machine.assignedOperatorId);
    }

    await this.createBulk(
      machine.organizationId,
      [...new Set(userIds)],
      'maintenance_due',
      'Bakım Zamanı Geldi',
      `${machine.name} makinesi için planlı bakım zamanı geldi.`,
      { machineId: machine.id },
    );
  }
}
