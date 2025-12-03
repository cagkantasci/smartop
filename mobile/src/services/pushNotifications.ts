import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface NotificationData {
  type: string;
  [key: string]: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;
  private onNotificationReceived: ((notification: Notifications.Notification) => void) | null = null;
  private onNotificationResponse: ((response: Notifications.NotificationResponse) => void) | null = null;

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

  private async registerForPushNotifications() {
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

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.expoPushToken = tokenData.data;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.expoPushToken);

      console.log('Push token:', this.expoPushToken);

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Smartop Bildirimleri',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#F59E0B',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('checklist', {
          name: 'Checklist Bildirimleri',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
        });

        await Notifications.setNotificationChannelAsync('job', {
          name: 'İş Bildirimleri',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });

        await Notifications.setNotificationChannelAsync('maintenance', {
          name: 'Bakım Uyarıları',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 500, 500],
          lightColor: '#EF4444',
        });
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
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

    // Handle navigation based on notification type
    switch (data?.type) {
      case 'checklist_submitted':
      case 'checklist_approved':
      case 'checklist_rejected':
        // Navigate to approvals or checklist screen
        console.log('Navigate to checklist:', data);
        break;
      case 'job_assigned':
      case 'job_started':
      case 'job_completed':
        // Navigate to jobs screen
        console.log('Navigate to job:', data);
        break;
      case 'maintenance_due':
      case 'machine_issue':
        // Navigate to machine detail
        console.log('Navigate to machine:', data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  async registerDeviceWithServer() {
    if (!this.expoPushToken) {
      return;
    }

    try {
      await api.post('/notifications/device', {
        token: this.expoPushToken,
        platform: Platform.OS,
      });
      console.log('Device registered with server');
    } catch (error) {
      console.error('Failed to register device with server:', error);
    }
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
    trigger?: Notifications.NotificationTriggerInput
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
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
    await pushNotificationService.scheduleLocalNotification(title, body, {}, {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    });
  };

  const scheduleChecklistReminder = async (machineName: string, hours: number = 1) => {
    await scheduleReminder(
      'Checklist Hatırlatması',
      `${machineName} için günlük checklist doldurmayı unutmayın!`,
      hours * 3600
    );
  };

  return {
    token: pushNotificationService.getExpoPushToken(),
    scheduleReminder,
    scheduleChecklistReminder,
    clearBadge: () => pushNotificationService.clearBadge(),
    setBadgeCount: (count: number) => pushNotificationService.setBadgeCount(count),
  };
}
