import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DashboardScreen,
  MachineListScreen,
  MachineDetailScreen,
  ChecklistScreen,
  ChecklistTemplatesScreen,
  ProfileScreen,
  JobsScreen,
  ApprovalsScreen,
} from '../screens';
import { MainTabParamList, MachinesStackParamList, ChecklistStackParamList } from './types';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const MachinesStack = createNativeStackNavigator<MachinesStackParamList>();
const ChecklistStack = createNativeStackNavigator<ChecklistStackParamList>();

// Machines Stack Navigator
function MachinesNavigator() {
  return (
    <MachinesStack.Navigator screenOptions={{ headerShown: false }}>
      <MachinesStack.Screen name="MachineList" component={MachineListScreen} />
      <MachinesStack.Screen name="MachineDetail" component={MachineDetailScreen} />
    </MachinesStack.Navigator>
  );
}

// Checklist Stack Navigator
function ChecklistNavigator() {
  return (
    <ChecklistStack.Navigator screenOptions={{ headerShown: false }}>
      <ChecklistStack.Screen name="ChecklistMain" component={ChecklistScreen} />
      <ChecklistStack.Screen name="ChecklistTemplates" component={ChecklistTemplatesScreen} />
    </ChecklistStack.Navigator>
  );
}

// Badge component for tab icons
function TabBadge({ count, backgroundColor }: { count: number; backgroundColor: string }) {
  if (count <= 0) return null;

  return (
    <View style={[styles.badge, { borderColor: backgroundColor }]}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export function MainNavigator() {
  const insets = useSafeAreaInsets();
  const { counts } = useNotifications();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = theme.colors;

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
          let badgeCount = 0;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Machines':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Checklist':
              iconName = focused ? 'clipboard' : 'clipboard-outline';
              badgeCount = counts.pendingChecklists;
              break;
            case 'Approvals':
              iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
              badgeCount = counts.pendingApprovals;
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <View style={[focused ? [styles.activeIconContainer, { backgroundColor: colors.activeBackground }] : undefined, styles.iconWrapper]}>
              <Ionicons name={iconName} size={22} color={color} />
              <TabBadge count={badgeCount} backgroundColor={colors.tabBar} />
            </View>
          );
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
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
        options={{ tabBarLabel: t.tabs.dashboard }}
      />
      <Tab.Screen
        name="Machines"
        component={MachinesNavigator}
        options={{ tabBarLabel: t.tabs.machines }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ tabBarLabel: t.tabs.jobs }}
      />
      <Tab.Screen
        name="Checklist"
        component={ChecklistNavigator}
        options={{ tabBarLabel: t.tabs.checklist }}
      />
      <Tab.Screen
        name="Approvals"
        component={ApprovalsScreen}
        options={{ tabBarLabel: t.tabs.approvals }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t.tabs.profile }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
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
    padding: 8,
    borderRadius: 14,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
