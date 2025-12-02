import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
  Linking,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useLanguage, Language, interpolate } from '../../context/LanguageContext';
import { Card, Button, Input } from '../../components/ui';
import { usersApi } from '../../services/api';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  colors: any;
}

function MenuItem({ icon, label, subtitle, onPress, danger, colors }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuItem, { borderBottomColor: colors.cardBorder }]}>
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: danger ? 'rgba(239, 68, 68, 0.2)' : `${colors.textSecondary}20` },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#EF4444' : colors.textSecondary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: danger ? '#EF4444' : colors.text }]}>
          {label}
        </Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const colors = theme.colors;

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
  });

  // Settings states
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    checklistReminder: true,
    jobUpdates: true,
    maintenanceAlerts: true,
  });
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    wifiOnly: false,
    syncInterval: 15,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t.profile.logout.title,
      t.profile.logout.message,
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.profile.logout.title, style: 'destructive', onPress: logout },
      ]
    );
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return t.profile.role.admin;
      case 'manager':
        return t.profile.role.manager;
      case 'operator':
        return t.profile.role.operator;
      default:
        return t.profile.role.user;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'dark':
        return t.profile.theme.dark;
      case 'light':
        return t.profile.theme.light;
      case 'system':
        return t.profile.theme.system;
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.firstName || !profileForm.lastName) {
      Alert.alert(t.common.error, t.profile.messages.nameRequired);
      return;
    }
    setIsSubmitting(true);
    try {
      await usersApi.updateProfile(profileForm);
      if (updateUser) {
        updateUser({ ...user, ...profileForm });
      }
      Alert.alert(t.common.success, t.profile.messages.profileUpdated);
      setShowProfileModal(false);
    } catch (error) {
      Alert.alert(t.common.error, t.profile.messages.profileError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert(t.common.error, t.profile.messages.requiredFields);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert(t.common.error, t.profile.messages.passwordMismatch);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert(t.common.error, t.profile.messages.passwordTooShort);
      return;
    }
    setIsSubmitting(true);
    try {
      await usersApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      Alert.alert(t.common.success, t.profile.messages.passwordChanged);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Alert.alert(t.common.error, t.profile.messages.passwordError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSubmitting(true);
    try {
      await usersApi.updateNotificationSettings(notifications);
      Alert.alert(t.common.success, t.profile.messages.notificationsSaved);
      setShowNotificationsModal(false);
    } catch (error) {
      Alert.alert(t.common.error, t.profile.messages.settingsError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSupport = async () => {
    if (!supportForm.subject || !supportForm.message) {
      Alert.alert(t.common.error, t.profile.messages.requiredFields);
      return;
    }
    setIsSubmitting(true);
    try {
      Alert.alert(t.common.success, t.profile.messages.supportSent);
      setShowSupportModal(false);
      setSupportForm({ subject: '', message: '' });
    } catch (error) {
      Alert.alert(t.common.error, t.profile.messages.supportError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t.common.error, t.profile.messages.pageError);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
              {user?.lastName?.[0]?.toUpperCase() || ''}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleTag, { backgroundColor: `${colors.primary}30` }]}>
            <Text style={[styles.roleText, { color: colors.primary }]}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        {/* Account Section */}
        <Card style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>{t.profile.sections.account}</Text>
          <MenuItem
            icon="person-outline"
            label={t.profile.menu.profileInfo}
            subtitle={t.profile.menu.profileInfoSub}
            colors={colors}
            onPress={() => {
              setProfileForm({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                phone: user?.phone || '',
              });
              setShowProfileModal(true);
            }}
          />
          <MenuItem
            icon="lock-closed-outline"
            label={t.profile.menu.changePassword}
            subtitle={t.profile.menu.changePasswordSub}
            colors={colors}
            onPress={() => setShowPasswordModal(true)}
          />
          <MenuItem
            icon="notifications-outline"
            label={t.profile.menu.notifications}
            subtitle={t.profile.menu.notificationsSub}
            colors={colors}
            onPress={() => setShowNotificationsModal(true)}
          />
        </Card>

        {/* App Section */}
        <Card style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>{t.profile.sections.app}</Text>
          <MenuItem
            icon="moon-outline"
            label={t.profile.menu.appearance}
            subtitle={getThemeLabel()}
            colors={colors}
            onPress={() => setShowThemeModal(true)}
          />
          <MenuItem
            icon="language-outline"
            label={t.profile.menu.language}
            subtitle={language === 'tr' ? 'Türkçe' : 'English'}
            colors={colors}
            onPress={() => setShowLanguageModal(true)}
          />
          <MenuItem
            icon="sync-outline"
            label={t.profile.menu.sync}
            subtitle={syncSettings.autoSync ? t.profile.sync.auto : 'Manuel'}
            colors={colors}
            onPress={() => setShowSyncModal(true)}
          />
        </Card>

        {/* Support Section */}
        <Card style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>{t.profile.sections.support}</Text>
          <MenuItem
            icon="help-circle-outline"
            label={t.profile.menu.helpCenter}
            colors={colors}
            onPress={() => openURL('https://smartop.com/help')}
          />
          <MenuItem
            icon="chatbubble-outline"
            label={t.profile.menu.createTicket}
            colors={colors}
            onPress={() => setShowSupportModal(true)}
          />
          <MenuItem
            icon="document-text-outline"
            label={t.profile.menu.terms}
            colors={colors}
            onPress={() => openURL('https://smartop.com/terms')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label={t.profile.menu.privacy}
            colors={colors}
            onPress={() => openURL('https://smartop.com/privacy')}
          />
        </Card>

        {/* Logout */}
        <Card style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MenuItem
            icon="log-out-outline"
            label={t.profile.menu.logout}
            colors={colors}
            onPress={handleLogout}
            danger
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>{t.profile.appInfo.version}</Text>
          <Text style={[styles.appCopyright, { color: colors.textMuted }]}>{t.profile.appInfo.copyright}</Text>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.profileTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Input
              label={t.profile.fields.firstName}
              value={profileForm.firstName}
              onChangeText={(text) => setProfileForm((prev) => ({ ...prev, firstName: text }))}
              placeholder={t.profile.placeholders.firstName}
            />
            <Input
              label={t.profile.fields.lastName}
              value={profileForm.lastName}
              onChangeText={(text) => setProfileForm((prev) => ({ ...prev, lastName: text }))}
              placeholder={t.profile.placeholders.lastName}
            />
            <Input
              label={t.profile.fields.phone}
              value={profileForm.phone}
              onChangeText={(text) => setProfileForm((prev) => ({ ...prev, phone: text }))}
              placeholder={t.profile.placeholders.phone}
              keyboardType="phone-pad"
            />
            <View style={[styles.readOnlyField, { backgroundColor: `${colors.text}05`, borderColor: colors.cardBorder }]}>
              <Text style={[styles.readOnlyLabel, { color: colors.textSecondary }]}>{t.profile.fields.email}</Text>
              <Text style={[styles.readOnlyValue, { color: colors.text }]}>{user?.email}</Text>
            </View>
          </ScrollView>
          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <Button title={t.common.save} onPress={handleUpdateProfile} loading={isSubmitting} fullWidth />
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.passwordTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Input
              label={t.profile.fields.currentPassword}
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, currentPassword: text }))}
              placeholder={t.profile.placeholders.currentPassword}
              secureTextEntry
            />
            <Input
              label={t.profile.fields.newPassword}
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, newPassword: text }))}
              placeholder={t.profile.placeholders.newPassword}
              secureTextEntry
            />
            <Input
              label={t.profile.fields.confirmPassword}
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, confirmPassword: text }))}
              placeholder={t.profile.placeholders.confirmPassword}
              secureTextEntry
            />
          </ScrollView>
          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <Button title={t.profile.menu.changePassword} onPress={handleChangePassword} loading={isSubmitting} fullWidth />
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.notificationsTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.profile.notifications.channels}</Text>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.notifications.push}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.notifications.pushSub}</Text>
              </View>
              <Switch
                value={notifications.push}
                onValueChange={(value) => setNotifications((prev) => ({ ...prev, push: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.notifications.emailNotif}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.notifications.emailSub}</Text>
              </View>
              <Switch
                value={notifications.email}
                onValueChange={(value) => setNotifications((prev) => ({ ...prev, email: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.notifications.sms}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.notifications.smsSub}</Text>
              </View>
              <Switch
                value={notifications.sms}
                onValueChange={(value) => setNotifications((prev) => ({ ...prev, sms: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>{t.profile.notifications.types}</Text>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.notifications.checklistReminder}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.notifications.checklistReminderSub}</Text>
              </View>
              <Switch
                value={notifications.checklistReminder}
                onValueChange={(value) => setNotifications((prev) => ({ ...prev, checklistReminder: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.notifications.jobUpdates}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.notifications.jobUpdatesSub}</Text>
              </View>
              <Switch
                value={notifications.jobUpdates}
                onValueChange={(value) => setNotifications((prev) => ({ ...prev, jobUpdates: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.notifications.maintenanceAlerts}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.notifications.maintenanceAlertsSub}</Text>
              </View>
              <Switch
                value={notifications.maintenanceAlerts}
                onValueChange={(value) => setNotifications((prev) => ({ ...prev, maintenanceAlerts: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <Button title={t.common.save} onPress={handleSaveNotifications} loading={isSubmitting} fullWidth />
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowThemeModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.appearanceTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: `${colors.text}05` }, themeMode === 'dark' && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: colors.primary }]}
              onPress={() => setThemeMode('dark')}
            >
              <Ionicons name="moon" size={24} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: themeMode === 'dark' ? colors.primary : colors.text }]}>
                  {t.profile.theme.dark}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>{t.profile.theme.darkSub}</Text>
              </View>
              {themeMode === 'dark' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: `${colors.text}05` }, themeMode === 'light' && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: colors.primary }]}
              onPress={() => setThemeMode('light')}
            >
              <Ionicons name="sunny" size={24} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: themeMode === 'light' ? colors.primary : colors.text }]}>
                  {t.profile.theme.light}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>{t.profile.theme.lightSub}</Text>
              </View>
              {themeMode === 'light' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: `${colors.text}05` }, themeMode === 'system' && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: colors.primary }]}
              onPress={() => setThemeMode('system')}
            >
              <Ionicons name="phone-portrait" size={24} color={themeMode === 'system' ? colors.primary : colors.textSecondary} />
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: themeMode === 'system' ? colors.primary : colors.text }]}>
                  {t.profile.theme.system}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>{t.profile.theme.systemSub}</Text>
              </View>
              {themeMode === 'system' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.languageTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: `${colors.text}05` }, language === 'tr' && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: colors.primary }]}
              onPress={() => {
                setLanguage('tr');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.flagEmoji}>🇹🇷</Text>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: language === 'tr' ? colors.primary : colors.text }]}>
                  Türkçe
                </Text>
              </View>
              {language === 'tr' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: `${colors.text}05` }, language === 'en' && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: colors.primary }]}
              onPress={() => {
                setLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.flagEmoji}>🇬🇧</Text>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: language === 'en' ? colors.primary : colors.text }]}>
                  English
                </Text>
              </View>
              {language === 'en' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Sync Settings Modal */}
      <Modal
        visible={showSyncModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowSyncModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.syncTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.sync.auto}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.sync.autoSub}</Text>
              </View>
              <Switch
                value={syncSettings.autoSync}
                onValueChange={(value) => setSyncSettings((prev) => ({ ...prev, autoSync: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{t.profile.sync.wifiOnly}</Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>{t.profile.sync.wifiOnlySub}</Text>
              </View>
              <Switch
                value={syncSettings.wifiOnly}
                onValueChange={(value) => setSyncSettings((prev) => ({ ...prev, wifiOnly: value }))}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>{t.profile.sync.interval}</Text>
            {[5, 15, 30, 60].map((interval) => (
              <TouchableOpacity
                key={interval}
                style={[styles.optionRow, { backgroundColor: `${colors.text}05` }, syncSettings.syncInterval === interval && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: colors.primary }]}
                onPress={() => setSyncSettings((prev) => ({ ...prev, syncInterval: interval }))}
              >
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, { color: syncSettings.syncInterval === interval ? colors.primary : colors.text }]}>
                    {interpolate(t.profile.sync.minutes, { count: interval })}
                  </Text>
                </View>
                {syncSettings.syncInterval === interval && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.syncNowButton, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
              <Ionicons name="sync" size={20} color={colors.primary} />
              <Text style={[styles.syncNowText, { color: colors.primary }]}>{t.profile.sync.syncNow}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Support Modal */}
      <Modal
        visible={showSupportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowSupportModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.profile.modals.supportTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Input
              label={t.profile.support.subject}
              value={supportForm.subject}
              onChangeText={(text) => setSupportForm((prev) => ({ ...prev, subject: text }))}
              placeholder={t.profile.support.subjectPlaceholder}
            />
            <Input
              label={t.profile.support.message}
              value={supportForm.message}
              onChangeText={(text) => setSupportForm((prev) => ({ ...prev, message: text }))}
              placeholder={t.profile.support.messagePlaceholder}
              multiline
              numberOfLines={6}
              style={{ height: 150, textAlignVertical: 'top' }}
            />
            <View style={[styles.contactInfo, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.contactTitle, { color: colors.textSecondary }]}>{t.profile.support.alternativeContact}</Text>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL('mailto:destek@smartop.com')}
              >
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.contactText, { color: colors.text }]}>destek@smartop.com</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL('tel:+902121234567')}
              >
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.contactText, { color: colors.text }]}>+90 212 123 45 67</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <Button title={t.profile.support.send} onPress={handleSubmitSupport} loading={isSubmitting} fullWidth />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 13,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  readOnlyField: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  readOnlyLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  readOnlyValue: {
    fontSize: 16,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  flagEmoji: {
    fontSize: 24,
  },
  syncNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  syncNowText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactInfo: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    marginLeft: 12,
  },
});
