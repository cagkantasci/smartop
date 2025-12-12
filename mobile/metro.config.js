// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Native-only modules that need to be mocked on web
const nativeOnlyModules = {
  'react-native-maps': 'react-native-maps.web.js',
  'expo-local-authentication': 'expo-local-authentication.web.js',
  'expo-secure-store': 'expo-secure-store.web.js',
};

// Resolve native-only modules to mocks on web platform
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && nativeOnlyModules[moduleName]) {
    return {
      filePath: path.resolve(__dirname, nativeOnlyModules[moduleName]),
      type: 'sourceFile',
    };
  }
  // Let Metro handle all other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
