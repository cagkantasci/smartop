import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type StatusType =
  | 'active' | 'idle' | 'maintenance' | 'out_of_service'  // Machine status
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled' | 'delayed' // Job/checklist status
  | 'approved' | 'rejected'                                // Review status
  | 'low' | 'medium' | 'high' | 'critical';               // Severity

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  // Machine statuses
  active: { bg: '#DCFCE7', text: '#166534', label: 'Aktif' },
  idle: { bg: '#FEF9C3', text: '#854D0E', label: 'Boşta' },
  maintenance: { bg: '#DBEAFE', text: '#1E40AF', label: 'Bakımda' },
  out_of_service: { bg: '#FEE2E2', text: '#991B1B', label: 'Servis Dışı' },

  // Job/checklist statuses
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Beklemede' },
  in_progress: { bg: '#DBEAFE', text: '#1E40AF', label: 'Devam Ediyor' },
  completed: { bg: '#DCFCE7', text: '#166534', label: 'Tamamlandı' },
  cancelled: { bg: '#F3F4F6', text: '#4B5563', label: 'İptal Edildi' },
  scheduled: { bg: '#E0E7FF', text: '#3730A3', label: 'Planlandı' },
  delayed: { bg: '#FED7AA', text: '#C2410C', label: 'Gecikmiş' },

  // Review statuses
  approved: { bg: '#DCFCE7', text: '#166534', label: 'Onaylandı' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Reddedildi' },

  // Severity levels
  low: { bg: '#DBEAFE', text: '#1E40AF', label: 'Düşük' },
  medium: { bg: '#FEF3C7', text: '#92400E', label: 'Orta' },
  high: { bg: '#FED7AA', text: '#C2410C', label: 'Yüksek' },
  critical: { bg: '#FEE2E2', text: '#991B1B', label: 'Kritik' },
};

export function StatusBadge({ status, label, size = 'md', style }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: '#F3F4F6', text: '#4B5563', label: status };
  const displayLabel = label || config.label;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : undefined,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : undefined,
          { color: config.text },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
