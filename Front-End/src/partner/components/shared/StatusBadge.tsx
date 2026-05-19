import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Nháp', bg: '#F1F5F9', text: '#64748B' },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', text: '#D97706' },
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', text: '#16A34A' },
  rejected: { label: 'Từ chối', bg: '#FEE2E2', text: '#DC2626' },
  suspended: { label: 'Tạm ngưng', bg: '#F3E8FF', text: '#9333EA' },
  active: { label: 'Hoạt động', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: 'Không hoạt động', bg: '#F1F5F9', text: '#64748B' },
  maintenance: { label: 'Bảo trì', bg: '#FEF3C7', text: '#D97706' },
  blocked: { label: 'Đã khóa', bg: '#FEE2E2', text: '#DC2626' },
  available: { label: 'Trống', bg: '#DCFCE7', text: '#16A34A' },
  occupied: { label: 'Đã đặt', bg: '#DBEAFE', text: '#2563EB' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_MAP[status] || { label: status, bg: '#F1F5F9', text: '#64748B' };
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }, isSmall && styles.labelSm]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  labelSm: { fontSize: 10 },
});
