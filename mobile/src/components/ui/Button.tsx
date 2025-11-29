import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Dark tema renkleri
const COLORS = {
  primary: '#111827', // slate-900
  secondary: '#F59E0B', // smart-yellow
  card: '#1E293B', // slate-800
  border: 'rgba(255, 255, 255, 0.2)',
  text: '#FFFFFF',
};

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: COLORS.secondary },
  secondary: { backgroundColor: COLORS.card },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: '#EF4444' },
};

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 8 },
  md: { paddingHorizontal: 16, paddingVertical: 14 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
};

const textVariantColors: Record<string, string> = {
  primary: COLORS.primary,
  secondary: COLORS.text,
  outline: COLORS.text,
  ghost: COLORS.secondary,
  danger: '#FFFFFF',
};

const textSizes: Record<string, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? styles.fullWidth : undefined,
        isDisabled ? styles.disabled : undefined,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.primary : COLORS.text}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.text,
              { color: textVariantColors[variant], fontSize: textSizes[size] },
              icon ? styles.textWithIcon : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
