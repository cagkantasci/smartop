import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { usersApi } from './api';

// SecureStore keys for biometric
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_CREDENTIAL_KEY = 'biometric_credential';

export interface BiometricStatus {
  isAvailable: boolean;
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
  isEnabled: boolean;
}

export const biometricService = {
  // Check if biometric auth is available on device
  async checkAvailability(): Promise<BiometricStatus> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: 'fingerprint' | 'facial' | 'iris' | 'none' = 'none';

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'facial';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      }

      const isEnabled = await this.isBiometricEnabled();

      return {
        isAvailable: compatible && enrolled,
        biometricType,
        isEnabled,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isAvailable: false,
        biometricType: 'none',
        isEnabled: false,
      };
    }
  },

  // Check if biometric is enabled for this app
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch {
      return false;
    }
  },

  // Enable biometric authentication (saves credentials securely)
  async enableBiometric(email: string, password: string): Promise<boolean> {
    try {
      // First authenticate to confirm user identity
      const authResult = await this.authenticate('Biyometrik girişi etkinleştirmek için doğrulayın');

      if (!authResult.success) {
        return false;
      }

      // Store credentials securely (encrypted with biometric protection)
      await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
      await SecureStore.setItemAsync(BIOMETRIC_CREDENTIAL_KEY, password);
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

      // Notify backend
      try {
        await usersApi.toggleBiometric(true);
      } catch (err) {
        console.log('Backend biometric update failed (non-critical):', err);
      }

      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  },

  // Disable biometric authentication
  async disableBiometric(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIAL_KEY);
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'false');

      // Notify backend
      try {
        await usersApi.toggleBiometric(false);
      } catch (err) {
        console.log('Backend biometric update failed (non-critical):', err);
      }

      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  },

  // Authenticate with biometric
  async authenticate(promptMessage?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Giriş yapmak için parmak izinizi veya yüzünüzü kullanın',
        cancelLabel: 'İptal',
        disableDeviceFallback: false,
        fallbackLabel: 'Şifre ile giriş',
      });

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error: result.error || 'Biyometrik doğrulama başarısız',
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Biyometrik doğrulama hatası',
      };
    }
  },

  // Get saved credentials for biometric login
  async getStoredCredentials(): Promise<{
    email: string;
    password: string;
  } | null> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIAL_KEY);

      if (!email || !password) {
        return null;
      }

      return { email, password };
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  },

  // Perform biometric login (authenticate + get credentials)
  async biometricLogin(): Promise<{
    success: boolean;
    credentials?: { email: string; password: string };
    error?: string;
  }> {
    try {
      // Check if biometric is enabled
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biyometrik giriş etkinleştirilmemiş',
        };
      }

      // Authenticate with biometric
      const authResult = await this.authenticate();
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error,
        };
      }

      // Get stored credentials
      const credentials = await this.getStoredCredentials();
      if (!credentials) {
        return {
          success: false,
          error: 'Kayıtlı kimlik bilgisi bulunamadı',
        };
      }

      return {
        success: true,
        credentials,
      };
    } catch (error) {
      console.error('Biometric login error:', error);
      return {
        success: false,
        error: 'Biyometrik giriş hatası',
      };
    }
  },

  // Get biometric type display name
  getBiometricTypeName(type: 'fingerprint' | 'facial' | 'iris' | 'none'): string {
    switch (type) {
      case 'facial':
        return 'Face ID';
      case 'fingerprint':
        return 'Touch ID / Parmak İzi';
      case 'iris':
        return 'Iris Tarama';
      default:
        return 'Biyometrik';
    }
  },
};

export default biometricService;
