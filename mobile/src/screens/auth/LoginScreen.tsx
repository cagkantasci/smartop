import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { biometricService, BiometricStatus } from '../../services/biometricService';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const status = await biometricService.checkAvailability();
    setBiometricStatus(status);
  };

  const handleBiometricLogin = async () => {
    if (!biometricStatus?.isAvailable || !biometricStatus?.isEnabled) return;

    setIsBiometricLoading(true);
    try {
      const result = await biometricService.biometricLogin();

      if (result.success && result.credentials) {
        await login(result.credentials.email, result.credentials.password);
      } else {
        Alert.alert('Biyometrik Giriş', result.error || 'Biyometrik doğrulama başarısız');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Biyometrik giriş başarısız');
    } finally {
      setIsBiometricLoading(false);
    }
  };

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
      console.log('Login error:', error);
      const message = error.response?.data?.message
        || error.message
        || 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      Alert.alert(
        'Giriş Başarısız',
        message,
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

  const handleGoogleLogin = () => {
    Alert.alert('Bilgi', 'Google ile giriş yakında aktif olacak.');
  };

  const handleRegister = () => {
    Alert.alert('Kayıt Ol', 'Kayıt olmak için lütfen web portalımızı ziyaret edin.');
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
          {/* Login Card */}
          <View style={styles.card}>
            {/* Header with Logo */}
            <View style={styles.cardHeader}>
              <Image
                source={require('../../../assets/smartop-white.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.cardTitle}>Portal Girişi</Text>
              <TouchableOpacity style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="ornek@firma.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color={COLORS.primary} />}
                  </View>
                  <Text style={styles.rememberMeText}>Beni hatırla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Button
                title={isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Login */}
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIconG}>G</Text>
                  <Text style={styles.googleIconO1}>o</Text>
                  <Text style={styles.googleIconO2}>o</Text>
                  <Text style={styles.googleIconG2}>g</Text>
                  <Text style={styles.googleIconL}>l</Text>
                  <Text style={styles.googleIconE}>e</Text>
                </View>
                <Text style={styles.googleButtonText}>ile Giriş Yap</Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Hesabınız yok mu? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>

              {/* Biometric Login Button */}
              {biometricStatus?.isAvailable && biometricStatus?.isEnabled && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={isBiometricLoading}
                >
                  <Ionicons
                    name={biometricStatus.biometricType === 'facial' ? 'scan' : 'finger-print'}
                    size={24}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.biometricButtonText}>
                    {isBiometricLoading
                      ? 'Doğrulanıyor...'
                      : biometricService.getBiometricTypeName(biometricStatus.biometricType) + ' ile Giriş'}
                  </Text>
                </TouchableOpacity>
              )}
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
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logoImage: {
    width: 120,
    height: 36,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
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
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  rememberMeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.text,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  googleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleIconO1: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA4335',
  },
  googleIconO2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FBBC05',
  },
  googleIconG2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleIconL: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34A853',
  },
  googleIconE: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA4335',
  },
  googleButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    marginTop: 16,
  },
  biometricButtonText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
