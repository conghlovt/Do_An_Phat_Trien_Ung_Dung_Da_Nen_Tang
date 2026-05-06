import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';

const platformShadow = (boxShadow: string, nativeShadow: object) =>
  Platform.OS === 'web' ? ({ boxShadow } as any) : nativeShadow;

interface AdminDashboardProps {
  user: any;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <Text style={styles.icon}>💻</Text>
          <Text style={styles.title}>Yêu cầu truy cập trên Web</Text>
          <Text style={styles.message}>
            Bảng điều khiển quản trị chỉ có thể truy cập được thông qua trình duyệt web để đảm bảo bảo mật và cung cấp các công cụ quản lý tốt hơn.
          </Text>
          <Text style={styles.hint}>
            Vui lòng đăng nhập từ máy tính của bạn để quản lý hệ thống.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  warningCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    ...platformShadow('0 4px 12px rgba(0, 0, 0, 0.1)', {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    }),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  hint: { fontSize: 14, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' },
});
