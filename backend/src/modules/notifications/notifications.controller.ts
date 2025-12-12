import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { NotificationsService, NotificationType } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

class RegisterDeviceDto {
  @ApiProperty({ description: 'FCM or Expo push token' })
  @IsString()
  token: string;

  @ApiProperty({ enum: ['ios', 'android', 'web'] })
  @IsEnum(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;
}

class UnregisterDeviceDto {
  @ApiProperty({ description: 'FCM or Expo push token to unregister' })
  @IsString()
  token: string;
}

class SendTestNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  body: string;
}

class BroadcastNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body/message' })
  @IsString()
  body: string;

  @ApiProperty({
    enum: ['broadcast', 'payment', 'subscription', 'info', 'system'],
    description: 'Type of notification'
  })
  @IsEnum(['broadcast', 'payment', 'subscription', 'info', 'system'])
  type: 'broadcast' | 'payment' | 'subscription' | 'info' | 'system';

  @ApiProperty({
    required: false,
    enum: ['admin', 'manager', 'operator'],
    isArray: true,
    description: 'Target user roles (empty = all users)'
  })
  @IsOptional()
  @IsArray()
  targetRoles?: ('admin' | 'manager' | 'operator')[];

  @ApiProperty({
    required: false,
    isArray: true,
    description: 'Specific user IDs to target (overrides targetRoles)'
  })
  @IsOptional()
  @IsArray()
  targetUserIds?: string[];

  @ApiProperty({ required: false, description: 'Also send via email' })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiProperty({ required: false, default: true, description: 'Send push notification' })
  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;
}

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private pushService: PushNotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notifications retrieved' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      limit || 50,
      offset || 0,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationsService.markAsRead(notificationId, userId);
    return { success: true };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }

  // ============================================
  // DEVICE TOKEN MANAGEMENT
  // ============================================

  @Post('device')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register device for push notifications' })
  @ApiResponse({ status: 200, description: 'Device registered successfully' })
  async registerDevice(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    const device = await this.pushService.registerDevice(userId, dto);

    // Subscribe to organization topic for broadcasts
    await this.pushService.subscribeUserToOrgTopic(userId, organizationId);

    return {
      success: true,
      deviceId: device.id,
      message: 'Device registered for push notifications',
    };
  }

  @Delete('device')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unregister device from push notifications' })
  @ApiResponse({ status: 200, description: 'Device unregistered successfully' })
  async unregisterDevice(
    @CurrentUser('id') userId: string,
    @Body() dto: UnregisterDeviceDto,
  ) {
    await this.pushService.unregisterDevice(userId, dto.token);
    return {
      success: true,
      message: 'Device unregistered from push notifications',
    };
  }

  @Get('device/status')
  @ApiOperation({ summary: 'Get push notification status' })
  @ApiResponse({ status: 200, description: 'Push notification status' })
  async getPushStatus(@CurrentUser('id') userId: string) {
    const tokens = await this.pushService.getUserTokens(userId);
    return {
      firebaseInitialized: this.pushService.isInitialized(),
      registeredDevices: tokens.length,
      hasActiveDevices: tokens.length > 0,
    };
  }

  // ============================================
  // TEST NOTIFICATIONS (Admin only in production)
  // ============================================

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test push notification to yourself' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  async sendTestNotification(
    @CurrentUser('id') userId: string,
    @Body() dto: SendTestNotificationDto,
  ) {
    const result = await this.pushService.sendToUser(userId, {
      title: dto.title,
      body: dto.body,
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: result.success > 0,
      sent: result.success,
      failed: result.failed,
      message: result.success > 0
        ? 'Test notification sent successfully'
        : 'No registered devices found or notification failed',
    };
  }

  // ============================================
  // BROADCAST NOTIFICATIONS (Admin/Manager only)
  // ============================================

  @Post('broadcast')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send broadcast notification to users' })
  @ApiResponse({ status: 200, description: 'Broadcast notification sent' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async broadcastNotification(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: BroadcastNotificationDto,
  ) {
    const result = await this.notificationsService.broadcastNotification({
      organizationId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      targetRoles: dto.targetRoles,
      targetUserIds: dto.targetUserIds,
      sendEmail: dto.sendEmail,
      sendPush: dto.sendPush,
    });

    return {
      success: true,
      ...result,
    };
  }

  @Get('users')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get organization users for notification targeting' })
  @ApiResponse({ status: 200, description: 'List of users in organization' })
  async getOrganizationUsers(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.notificationsService.getOrganizationUsers(organizationId);
  }

  @Get('history')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get broadcast notification history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notification history retrieved' })
  async getNotificationHistory(
    @CurrentUser('organizationId') organizationId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Get unique broadcast notifications sent in this organization
    const notifications = await this.notificationsService.getBroadcastHistory(
      organizationId,
      limit || 50,
      offset || 0,
    );
    return notifications;
  }
}
