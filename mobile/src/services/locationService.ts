import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { usersApi } from './api';

const LOCATION_TASK_NAME = 'smartop-location-tracking';

// Location tracking interval (in milliseconds)
const LOCATION_UPDATE_INTERVAL = 60000; // 1 minute

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  address?: string;
}

// Define background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const location = locations[0];
      try {
        // Send location to backend
        await usersApi.updateLocation(
          location.coords.latitude,
          location.coords.longitude
        );
        console.log('Background location updated:', location.coords);
      } catch (err) {
        console.error('Failed to send background location:', err);
      }
    }
  }
});

export const locationService = {
  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      // Request background permission for continuous tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied (optional)');
        // Continue with foreground only
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  },

  // Get current location once
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates (reverse geocoding)
      let address: string | undefined;
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          address = [addr.district, addr.city, addr.region].filter(Boolean).join(', ');
        }
      } catch (err) {
        console.log('Reverse geocoding failed:', err);
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
        address,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },

  // Send current location to backend
  async sendLocationUpdate(): Promise<boolean> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        return false;
      }

      await usersApi.updateLocation(
        location.latitude,
        location.longitude,
        location.address
      );

      console.log('Location sent to server:', location);
      return true;
    } catch (error) {
      console.error('Error sending location update:', error);
      return false;
    }
  },

  // Start background location tracking
  async startBackgroundTracking(): Promise<boolean> {
    try {
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        console.log('Background location not permitted, using foreground only');
        return false;
      }

      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

      if (!isTracking) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 100, // Update if moved 100 meters
          deferredUpdatesInterval: LOCATION_UPDATE_INTERVAL,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Smartop Konum Takibi',
            notificationBody: 'Konumunuz takip ediliyor',
            notificationColor: '#F59E0B',
          },
        });
        console.log('Background location tracking started');
      }

      return true;
    } catch (error) {
      console.error('Error starting background tracking:', error);
      return false;
    }
  },

  // Stop background location tracking
  async stopBackgroundTracking(): Promise<void> {
    try {
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

      if (isTracking) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('Background location tracking stopped');
      }
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  },

  // Check if background tracking is active
  async isBackgroundTrackingActive(): Promise<boolean> {
    try {
      return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (error) {
      return false;
    }
  },
};

export default locationService;
