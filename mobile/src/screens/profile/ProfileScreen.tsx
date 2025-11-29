import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, subtitle, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)' },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#EF4444' : '#9CA3AF'}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger ? styles.menuLabelDanger : undefined]}>
          {label}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Yönetici';
      case 'manager':
        return 'Saha Yöneticisi';
      case 'operator':
        return 'Operatör';
      default:
        return 'Kullanıcı';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
              {user?.lastName?.[0]?.toUpperCase() || ''}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        {/* Account Section */}
        <Card style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>Hesap</Text>
          <MenuItem
            icon="person-outline"
            label="Profil Bilgileri"
            subtitle="Kişisel bilgilerinizi düzenleyin"
            onPress={() => {}}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Şifre Değiştir"
            subtitle="Hesap güvenliğinizi yönetin"
            onPress={() => {}}
          />
          <MenuItem
            icon="notifications-outline"
            label="Bildirimler"
            subtitle="Bildirim tercihlerinizi ayarlayın"
            onPress={() => {}}
          />
        </Card>

        {/* App Section */}
        <Card style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>Uygulama</Text>
          <MenuItem
            icon="moon-outline"
            label="Görünüm"
            subtitle="Açık / Koyu tema"
            onPress={() => {}}
          />
          <MenuItem
            icon="language-outline"
            label="Dil"
            subtitle="Türkçe"
            onPress={() => {}}
          />
          <MenuItem
            icon="sync-outline"
            label="Veri Senkronizasyonu"
            subtitle="Çevrimdışı veri ayarları"
            onPress={() => {}}
          />
        </Card>

        {/* Support Section */}
        <Card style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>Destek</Text>
          <MenuItem
            icon="help-circle-outline"
            label="Yardım Merkezi"
            onPress={() => {}}
          />
          <MenuItem
            icon="chatbubble-outline"
            label="Destek Talebi Oluştur"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            label="Kullanım Koşulları"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Gizlilik Politikası"
            onPress={() => {}}
          />
        </Card>

        {/* Logout */}
        <Card style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label="Çıkış Yap"
            onPress={handleLogout}
            danger
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Smartop v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 Smartop Filo Yönetimi</Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  menuCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
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
    color: COLORS.text,
  },
  menuLabelDanger: {
    color: '#EF4444',
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#6B7280',
  },
});
