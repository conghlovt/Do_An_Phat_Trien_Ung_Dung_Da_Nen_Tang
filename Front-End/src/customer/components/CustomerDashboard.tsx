import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

const platformShadow = (boxShadow: string, nativeShadow: object) =>
  Platform.OS === 'web' ? ({ boxShadow } as any) : nativeShadow;

interface CustomerDashboardProps {
  user: any;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user }) => {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: '#0369A1' }]}>
        <Text style={styles.cardTitle}>Hoạt động của tôi</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Lượt đặt phòng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Khám phá chỗ nghỉ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Địa điểm đã lưu</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Lịch sử giao dịch</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, padding: 24 },
  roleBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 1 },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    ...platformShadow('0 2px 8px rgba(0, 0, 0, 0.12)', { elevation: 4 }),
  },
  cardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 20 },
  statBox: { flex: 1 },
  statNumber: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  actionItem: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...platformShadow('0 2px 5px rgba(0, 0, 0, 0.05)', {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    }),
  },
  actionText: { fontSize: 15, fontWeight: '600', color: '#334155' },
});
