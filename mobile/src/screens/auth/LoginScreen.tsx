import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

// Frontend dark temasına uygun renkler (slate-900 tema)
const COLORS = {
  primary: '#111827', // slate-900 - arka plan
  secondary: '#F59E0B', // smart-yellow - accent
  accent: '#3B82F6', // blue-500 - link rengi
  card: '#1E293B', // slate-800 - card arka plan
  cardBorder: 'rgba(255, 255, 255, 0.1)', // border
  text: '#FFFFFF',
  textSecondary: '#9CA3AF', // gray-400
  textMuted: '#6B7280', // gray-500
  inputBg: '#0F172A', // slate-950
  success: '#15803d',
  error: '#EF4444',
};

export function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!password) {
      newErrors.password = 'Şifre gerekli';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        'Giriş Başarısız',
        error.response?.data?.message || 'E-posta veya şifre hatalı',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Şifre Sıfırlama',
      'Şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Gönder', onPress: () => {
          if (email) {
            Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı gönderildi.');
          } else {
            Alert.alert('Hata', 'Lütfen önce e-posta adresinizi girin.');
          }
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="pulse" size={32} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.title}>Smartop</Text>
            <Text style={styles.subtitle}>
              Saha Operasyonlarını Dijitalleştirin
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Portal Girişi</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <Input
                    placeholder="ornek@firma.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email}
                    containerStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    error={errors.password}
                    containerStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <Button
                title={isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
              />
            </View>

            {/* Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Hesapları:</Text>
              <View style={styles.demoCredential}>
                <Text style={styles.demoLabel}>Admin:</Text>
                <Text style={styles.demoValue}>admin@demo-insaat.com / Admin123!</Text>
              </View>
              <View style={styles.demoCredential}>
                <Text style={styles.demoLabel}>Manager:</Text>
                <Text style={styles.demoValue}>manager@demo-insaat.com / Manager123!</Text>
              </View>
              <View style={styles.demoCredential}>
                <Text style={styles.demoLabel}>Operator:</Text>
                <Text style={styles.demoValue}>operator1@demo-insaat.com / Operator123!</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  loginButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  demoTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  demoCredential: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  demoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  demoValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
