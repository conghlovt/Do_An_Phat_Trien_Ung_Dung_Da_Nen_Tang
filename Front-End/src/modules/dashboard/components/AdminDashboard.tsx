import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';

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
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💻</Text>
          </View>
          <Text style={styles.title}>Yêu cầu truy cập trên Web</Text>
          <Text style={styles.message}>
            Bảng điều khiển quản trị chỉ có thể truy cập được thông qua trình duyệt web để đảm bảo bảo mật và cung cấp các công cụ quản lý tốt hơn.
          </Text>
          <Text style={styles.hint}>
            Vui lòng đăng nhập từ máy tính của bạn để quản lý hệ thống.
          </Text>

          <TouchableOpacity style={styles.backButton} onPress={onLogout}>
            <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
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
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...platformShadow('0 10px 25px rgba(0, 0, 0, 0.08)', {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 25,
      elevation: 10,
    }),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 16, textAlign: 'center' },
  message: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  hint: { fontSize: 13, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic', marginBottom: 30 },
  backButton: {
    backgroundColor: '#008080',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    ...platformShadow('0 4px 12px rgba(0, 128, 128, 0.2)', {
      shadowColor: '#008080',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    }),
  },
  backButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

