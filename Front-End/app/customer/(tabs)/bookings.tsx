import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const [showNotification, setShowNotification] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Phòng đã đặt</Text>
        <Pressable style={styles.headerBtn}>
          <Search size={22} color={currentTheme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView>
        {/* Notification Banner */}
        {showNotification && (
          <View style={[styles.notification, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Image source={require('@/assets/images/image-19.png')} style={styles.notifImg} />
            <View style={styles.notifContent}>
              <Text style={[styles.notifText, { color: currentTheme.textSecondary }]}>
                Theo dõi đặt phòng dễ dàng hơn. Đừng bỏ lỡ bất kỳ thông tin nào
              </Text>
              <Pressable style={styles.notifBtn}>
                <Text style={styles.notifBtnText}>Bật thông báo thôi</Text>
              </Pressable>
            </View>
            <Pressable style={styles.notifClose} onPress={() => setShowNotification(false)}>
              <X size={18} color={currentTheme.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Empty State */}
        <View style={[styles.emptyState, { backgroundColor: currentTheme.card }]}>
          <Image source={require('@/assets/images/image-14.png')} style={styles.emptyImg} />
          <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>Không có phòng nào!</Text>
          <Text style={[styles.emptySubtitle, { color: currentTheme.textSecondary }]}>Bắt đầu khám phá ngay.</Text>
          <Pressable
            style={styles.exploreBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreBtnText}>Khám phá phòng ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04,
    shadowRadius: 2, elevation: 2,
  },
  headerSpacer: { width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerBtn: { padding: 4 },
  notification: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, padding: 16, borderRadius: 12, borderWidth: 1,
    gap: 12,
  },
  notifImg: { width: 56, height: 56, resizeMode: 'contain' },
  notifContent: { flex: 1 },
  notifText: { fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 12 },
  notifBtn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  notifBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  notifClose: { position: 'absolute', top: 12, right: 12 },
  emptyState: { alignItems: 'center', paddingTop: 48, padding: 24, marginTop: 8 },
  emptyImg: { width: 220, height: 220, resizeMode: 'contain', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, fontWeight: '500', marginBottom: 24 },
  exploreBtn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 32, paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
