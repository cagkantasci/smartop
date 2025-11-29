import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DashboardScreen,
  MachineListScreen,
  ChecklistScreen,
  ProfileScreen,
} from '../screens';
import { MainTabParamList } from './types';

// Dark tema renkleri (Frontend slate-900 temasına uygun)
const COLORS = {
  primary: '#F59E0B', // smart-yellow - aktif renk
  background: '#111827', // slate-900
  inactive: '#6B7280', // gray-500
  border: 'rgba(255, 255, 255, 0.1)',
  activeBackground: 'rgba(245, 158, 11, 0.15)', // yellow tint
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  const insets = useSafeAreaInsets();

  // Android için bottom inset hesapla - navigation bar üstünde kalması için
  const bottomPadding = Platform.OS === 'ios'
    ? insets.bottom
    : Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Machines':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'Checklist':
              iconName = focused ? 'clipboard' : 'clipboard-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomPadding,
            height: 60 + bottomPadding,
          },
        ],
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="Machines"
        component={MachineListScreen}
        options={{ tabBarLabel: 'Makineler' }}
      />
      <Tab.Screen
        name="Checklist"
        component={ChecklistScreen}
        options={{ tabBarLabel: 'Kontrol' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconContainer: {
    backgroundColor: COLORS.activeBackground,
    padding: 8,
    borderRadius: 14,
  },
});
