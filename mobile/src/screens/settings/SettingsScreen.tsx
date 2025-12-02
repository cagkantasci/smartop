import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Input, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

type SettingsTab = 'profile' | 'notifications' | 'app' | 'about';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  checklistReminders: boolean;
  jobUpdates: boolean;
  maintenanceAlerts: boolean;
}

export function SettingsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    checklistReminders: true,
    jobUpdates: true,
    maintenanceAlerts: true,
  });
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState('dark');

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profil', icon: 'person-outline' },
    { key: 'notifications', label: 'Bildirimler', icon: 'notifications-outline' },
    { key: 'app', label: 'Uygulama', icon: 'settings-outline' },
    { key: 'about', label: 'Hakkinda', icon: 'information-circle-outline' },
  ];

  const handleSaveProfile = () => {
    Alert.alert('Basarili', 'Profil bilgileriniz kaydedildi');
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderProfileTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Kisisel Bilgiler</Text>
        <Input
          label="Ad"
          value={user?.firstName || ''}
          placeholder="Adinizi girin"
          containerStyle={styles.input}
        />
        <Input
          label="Soyad"
          value={user?.lastName || ''}
          placeholder="Soyadinizi girin"
          containerStyle={styles.input}
        />
        <Input
          label="E-posta"
          value={user?.email || ''}
          placeholder="E-posta adresinizi girin"
          keyboardType="email-address"
          containerStyle={styles.input}
        />
        <Input
          label="Telefon"
          value={user?.phone || ''}
          placeholder="Telefon numaranizi girin"
          keyboardType="phone-pad"
          containerStyle={styles.input}
        />
        <Button
          title="Kaydet"
          onPress={handleSaveProfile}
          style={styles.saveButton}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sifre Degistir</Text>
        <Input
          label="Mevcut Sifre"
          placeholder="Mevcut sifrenizi girin"
          secureTextEntry
          containerStyle={styles.input}
        />
        <Input
          label="Yeni Sifre"
          placeholder="Yeni sifrenizi girin"
          secureTextEntry
          containerStyle={styles.input}
        />
        <Input
          label="Yeni Sifre (Tekrar)"
          placeholder="Yeni sifrenizi tekrar girin"
          secureTextEntry
          containerStyle={styles.input}
        />
        <Button
          title="Sifreyi Degistir"
          variant="outline"
          onPress={() => Alert.alert('Bilgi', 'Sifre degistirme islemi')}
          style={styles.saveButton}
        />
      </Card>
    </ScrollView>
  );

  const renderNotificationsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Bildirim Kanallari</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Bildirimleri</Text>
            <Text style={styles.settingDescription}>
              Mobil bildirimleri al
            </Text>
          </View>
          <Switch
            value={notificationSettings.pushEnabled}
            onValueChange={() => toggleNotification('pushEnabled')}
            trackColor={{ false: '#3e3e3e', true: '#F59E0B' }}
            thumbColor={notificationSettings.pushEnabled ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
            <Text style={styles.settingDescription}>
              E-posta ile bildirim al
            </Text>
          </View>
          <Switch
            value={notificationSettings.emailEnabled}
            onValueChange={() => toggleNotification('emailEnabled')}
            trackColor={{ false: '#3e3e3e', true: '#F59E0B' }}
            thumbColor={notificationSettings.emailEnabled ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Bildirim Turleri</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Kontrol Listesi Hatirlaticilari</Text>
            <Text style={styles.settingDescription}>
              Gunluk kontrol hatirlaticilari
            </Text>
          </View>
          <Switch
            value={notificationSettings.checklistReminders}
            onValueChange={() => toggleNotification('checklistReminders')}
            trackColor={{ false: '#3e3e3e', true: '#F59E0B' }}
            thumbColor={notificationSettings.checklistReminders ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Is Guncellemeleri</Text>
            <Text style={styles.settingDescription}>
              Is atama ve durum degisiklikleri
            </Text>
          </View>
          <Switch
            value={notificationSettings.jobUpdates}
            onValueChange={() => toggleNotification('jobUpdates')}
            trackColor={{ false: '#3e3e3e', true: '#F59E0B' }}
            thumbColor={notificationSettings.jobUpdates ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Bakim Uyarilari</Text>
            <Text style={styles.settingDescription}>
              Makine bakim hatirlaticilari
            </Text>
          </View>
          <Switch
            value={notificationSettings.maintenanceAlerts}
            onValueChange={() => toggleNotification('maintenanceAlerts')}
            trackColor={{ false: '#3e3e3e', true: '#F59E0B' }}
            thumbColor={notificationSettings.maintenanceAlerts ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </Card>
    </ScrollView>
  );

  const renderAppTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Gorunum</Text>

        <View style={styles.optionGroup}>
          <Text style={styles.optionLabel}>Tema</Text>
          <View style={styles.optionButtons}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                theme === 'dark' && styles.optionButtonActive,
              ]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons
                name="moon"
                size={20}
                color={theme === 'dark' ? '#111827' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  theme === 'dark' && styles.optionButtonTextActive,
                ]}
              >
                Koyu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                theme === 'light' && styles.optionButtonActive,
              ]}
              onPress={() => setTheme('light')}
            >
              <Ionicons
                name="sunny"
                size={20}
                color={theme === 'light' ? '#111827' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  theme === 'light' && styles.optionButtonTextActive,
                ]}
              >
                Acik
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Dil</Text>

        <View style={styles.optionGroup}>
          <View style={styles.optionButtons}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                language === 'tr' && styles.optionButtonActive,
              ]}
              onPress={() => setLanguage('tr')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  language === 'tr' && styles.optionButtonTextActive,
                ]}
              >
                Turkce
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                language === 'en' && styles.optionButtonActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  language === 'en' && styles.optionButtonTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Veri Yonetimi</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="cloud-download-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Cevrimdisi Veri Indir</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </View>
          <Text style={[styles.menuLabel, { color: '#EF4444' }]}>
            Onbellek Temizle
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );

  const renderAboutTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <View style={styles.aboutHeader}>
          <View style={styles.appIcon}>
            <Ionicons name="construct" size={40} color="#F59E0B" />
          </View>
          <Text style={styles.appName}>Smartop</Text>
          <Text style={styles.appVersion}>Surum 1.0.0</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Yasal</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Kullanim Kosullari</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Gizlilik Politikasi</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="document-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Acik Kaynak Lisanslari</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Destek</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Yardim Merkezi</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Destek Talebi</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="star-outline" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.menuLabel}>Uygulamayi Degerlendir</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          2024 Smartop Filo Yonetimi
        </Text>
        <Text style={styles.footerText}>Tum haklari saklidir.</Text>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'app':
        return renderAppTab();
      case 'about':
        return renderAboutTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#F59E0B' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

// Dark tema renkleri
const COLORS = {
  primary: '#111827',
  secondary: '#F59E0B',
  card: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  optionGroup: {
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  optionButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  optionButtonTextActive: {
    color: COLORS.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 12,
  },
  aboutHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
});
