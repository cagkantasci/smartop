import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Machines: undefined;
  Jobs: undefined;
  Checklist: undefined;
  Approvals: undefined;
  Profile: undefined;
};

// Stack navigators for detail screens
export type MachinesStackParamList = {
  MachineList: undefined;
  MachineDetail: { machineId: string };
};

export type ChecklistStackParamList = {
  ChecklistMain: undefined;
  ChecklistTemplates: undefined;
};

// Root Stack (combines Auth and Main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen Props Types
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export type DashboardScreenProps = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;
export type MachinesScreenProps = BottomTabScreenProps<MainTabParamList, 'Machines'>;
export type ChecklistScreenProps = BottomTabScreenProps<MainTabParamList, 'Checklist'>;
export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;

// Navigation type helper
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
