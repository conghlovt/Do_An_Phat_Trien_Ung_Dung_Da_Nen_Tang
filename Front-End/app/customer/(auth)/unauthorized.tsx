import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/customer/features/auth/hooks/useAuth';

export default function UnauthorizedScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (!user) router.replace('/customer/profile' as any);
    else router.replace('/customer/dashboard' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔒</Text>
      </View>
      <Text style={styles.title}>Không có quyền truy cập</Text>
      <Text style={styles.message}>
        Bạn không có quyền xem trang này.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGoBack}>
        <Text style={styles.buttonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
  message: { fontSize: 16, color: '#4A5568', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  button: {
    backgroundColor: '#002B49',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
