import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import { useAuth } from '@/src/login/hooks/useAuth';

export default function ExploreMoreSection() {
  const { currentTheme } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLoginPress = () => {
    router.push('/login' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Khám phá nhiều hơn</Text>
      <View style={[styles.card, { 
        backgroundColor: currentTheme.card, 
        borderColor: currentTheme.border 
      }]}>
        <Text style={[styles.body, { color: currentTheme.textSecondary }]}>
          Khách sạn dành riêng cho bạn.
        </Text>
        {!isAuthenticated && (
          <Pressable style={styles.btn} onPress={handleLoginPress}>
            <Text style={styles.btnText}>Đăng nhập</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, paddingHorizontal: 16 },
  card: {
    marginHorizontal: 16, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
    shadowRadius: 8, elevation: 2, borderWidth: 1,
  },
  body: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  btn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 99,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
