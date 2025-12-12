// Mock module for expo-local-authentication on web
// Biometric authentication is not supported on web platform

const AuthenticationType = {
  FINGERPRINT: 1,
  FACIAL_RECOGNITION: 2,
  IRIS: 3,
};

const SecurityLevel = {
  NONE: 0,
  SECRET: 1,
  BIOMETRIC_WEAK: 2,
  BIOMETRIC_STRONG: 3,
};

module.exports = {
  AuthenticationType,
  SecurityLevel,

  async hasHardwareAsync() {
    return false;
  },

  async isEnrolledAsync() {
    return false;
  },

  async supportedAuthenticationTypesAsync() {
    return [];
  },

  async authenticateAsync(options) {
    return {
      success: false,
      error: 'Biometric authentication is not supported on web',
    };
  },

  async getEnrolledLevelAsync() {
    return SecurityLevel.NONE;
  },

  async cancelAuthenticate() {
    // No-op on web
  },
};
