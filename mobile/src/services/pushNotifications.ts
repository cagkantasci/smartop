import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const PUSH_TOKEN_KEY = 'pushToken';
const DEVICE_REGISTERED_KEY = 'deviceRegistered';

interface NotificationData {
  type: string;
  [key: string]: any;
}

type NotificationNavigationCallback = (screen: string, params?: Record<string, any>) => void;

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;
  private onNotificationReceived: ((notification: Notifications.Notification) => void) | null = null;
  private onNotificationResponse: ((response: Notifications.NotificationResponse) => void) | null = null;
  private navigationCallback: NotificationNavigationCallback | null = null;

  async init() {
    // Check if we already have a token
    const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (storedToken) {
      this.expoPushToken = storedToken;
    }

    // Request permissions and get token
    await this.registerForPushNotifications();

    // Set up listeners
    this.setupNotificationListeners();
  }

  setNavigationCallback(callback: NotificationNavigationCallback) {
    this.navigationCallback = callback;
  }

  private async registerForPushNotifications() {
    // On web, push notifications work differently
    if (Platform.OS === 'web') {
      console.log('Web push notifications require service worker setup');
      return;
    }

    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permissions denied');
        return;
      }

      // For development builds with Firebase, we need the FCM token directly
      // Expo Push Tokens only work with Expo's push notification service
      // Since we're using Firebase Admin SDK, we need the native FCM token

      try {
        // Always try to get FCM token first for development builds
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        this.expoPushToken = deviceToken.data;
        console.log('FCM Token obtained:', this.expoPushToken.substring(0, 50) + '...');
      } catch (deviceError) {
        console.log('FCM token failed, trying Expo token:', deviceError);
        // Fallback to Expo Push Token (works with Expo Go)
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId || process.env.EXPO_PUBLIC_PROJECT_ID;
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          this.expoPushToken = tokenData.data;
          console.log('Expo Push Token obtained:', this.expoPushToken);
        } catch (expoError) {
          console.error('Failed to get any push token:', expoError);
          return;
        }
      }

      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.expoPushToken);
      console.log('Push token:', this.expoPushToken);

      // Set up Android notification channels
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

  private async setupAndroidChannels() {
    // Default channel for general notifications
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Smartop Bildirimleri',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
    });

    // Checklist notifications
    await Notifications.setNotificationChannelAsync('checklist', {
      name: 'Checklist Bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
    });

    // Job notifications
    await Notifications.setNotificationChannelAsync('job', {
      name: 'İş Bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
    });

    // Maintenance alerts
    await Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Bakım Uyarıları',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 500, 500],
      lightColor: '#EF4444',
      sound: 'default',
    });

    // Urgent notifications
    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Acil Bildirimler',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#DC2626',
      sound: 'default',
    });
  }

  private setupNotificationListeners() {
    // Foreground notification listener
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (this.onNotificationReceived) {
          this.onNotificationReceived(notification);
        }
      }
    );

    // Notification response listener (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (this.onNotificationResponse) {
          this.onNotificationResponse(response);
        }
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as NotificationData;

    if (!this.navigationCallback) {
      console.log('Navigation callback not set, cannot navigate');
      return;
    }

    // Handle navigation based on notification type
    switch (data?.type) {
      case 'checklist_submitted':
        this.navigationCallback('Approvals', { checklistId: data.checklistId });
        break;
      case 'checklist_approved':
      case 'checklist_rejected':
        this.navigationCallback('Checklist', { checklistId: data.checklistId });
        break;
      case 'job_assigned':
      case 'job_started':
      case 'job_completed':
        this.navigationCallback('Jobs', { jobId: data.jobId });
        break;
      case 'maintenance_due':
      case 'machine_issue':
        this.navigationCallback('Machines', { machineId: data.machineId });
        break;
      case 'test':
        console.log('Test notification tapped');
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  async registerDeviceWithServer() {
    if (!this.expoPushToken) {
      console.log('No push token available');
      return false;
    }

    try {
      const deviceInfo = {
        token: this.expoPushToken,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        deviceName: Device.deviceName || undefined,
        deviceModel: Device.modelName || undefined,
        appVersion: Constants.expoConfig?.version || '1.0.0',
      };

      await api.post('/notifications/device', deviceInfo);
      await AsyncStorage.setItem(DEVICE_REGISTERED_KEY, 'true');
      console.log('Device registered with server:', deviceInfo.platform, deviceInfo.deviceName);
      return true;
    } catch (error) {
      console.error('Failed to register device with server:', error);
      return false;
    }
  }

  async unregisterDeviceFromServer() {
    if (!this.expoPushToken) {
      return;
    }

    try {
      await api.delete('/notifications/device', {
        data: { token: this.expoPushToken },
      });
      await AsyncStorage.removeItem(DEVICE_REGISTERED_KEY);
      console.log('Device unregistered from server');
    } catch (error) {
      console.error('Failed to unregister device from server:', error);
    }
  }

  async isDeviceRegistered(): Promise<boolean> {
    const registered = await AsyncStorage.getItem(DEVICE_REGISTERED_KEY);
    return registered === 'true';
  }

  setOnNotificationReceived(callback: (notification: Notifications.Notification) => void) {
    this.onNotificationReceived = callback;
  }

  setOnNotificationResponse(callback: (response: Notifications.NotificationResponse) => void) {
    this.onNotificationResponse = callback;
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput,
    channelId?: string
  ) {
    const content: Notifications.NotificationContentInput = {
      title,
      body,
      data,
      sound: 'default',
    };

    // Add Android-specific options
    if (Platform.OS === 'android' && channelId) {
      (content as any).channelId = channelId;
    }

    await Notifications.scheduleNotificationAsync({
      content,
      trigger: trigger || null, // null = immediate
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }

  hasToken(): boolean {
    return this.expoPushToken !== null;
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export const pushNotificationService = new PushNotificationService();

// React hook for push notifications
export function usePushNotifications() {
  const scheduleReminder = async (title: string, body: string, seconds: number) => {
    await pushNotificationService.scheduleLocalNotification(
      title,
      body,
      {},
      {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      }
    );
  };

  const scheduleChecklistReminder = async (machineName: string, hours: number = 1) => {
    await pushNotificationService.scheduleLocalNotification(
      'Checklist Hatırlatması',
      `${machineName} için günlük checklist doldurmayı unutmayın!`,
      { type: 'checklist_reminder' },
      {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: hours * 3600,
      },
      'checklist'
    );
  };

  const sendTestNotification = async () => {
    await pushNotificationService.scheduleLocalNotification(
      'Test Bildirimi',
      'Push bildirimleri çalışıyor!',
      { type: 'test', timestamp: new Date().toISOString() },
      null,
      'default'
    );
  };

  return {
    token: pushNotificationService.getExpoPushToken(),
    hasToken: pushNotificationService.hasToken(),
    registerDevice: () => pushNotificationService.registerDeviceWithServer(),
    unregisterDevice: () => pushNotificationService.unregisterDeviceFromServer(),
    isRegistered: () => pushNotificationService.isDeviceRegistered(),
    scheduleReminder,
    scheduleChecklistReminder,
    sendTestNotification,
    clearBadge: () => pushNotificationService.clearBadge(),
    setBadgeCount: (count: number) => pushNotificationService.setBadgeCount(count),
    setNavigationCallback: (cb: NotificationNavigationCallback) =>
      pushNotificationService.setNavigationCallback(cb),
  };
}
