import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Ticket, CreditCard, Stamp, Gift, CircleDollarSign,
  Megaphone, Calendar, ChevronRight,
} from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import { useAuth } from '@/src/customer/hooks/useAuth';
import { useRouter } from 'expo-router';

const PRIMARY = '#85c2a4';

export default function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const { isAuthenticated } = useAuth();

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: currentTheme.card }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Ưu đãi độc quyền</Text>
      </View>

      {/* Top Cards */}
      <View style={styles.topCards}>
        {[
          { Icon: Ticket, label: 'Ưu đãi' },
          { Icon: CreditCard, label: 'Joy Xu' },
          { Icon: Stamp, label: 'Tem' },
        ].map(({ Icon, label }) => (
          <Pressable key={label} style={[styles.topCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Icon size={28} color={PRIMARY} strokeWidth={1.5} />
            <Text style={[styles.topCardLabel, { color: currentTheme.text }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Invite Banner */}
      <View style={[styles.inviteBanner, { backgroundColor: isDarkMode ? '#2d5c47' : '#eaf5ef' }]}>
        <View style={styles.inviteContent}>
          <Text style={[styles.inviteTitle, { color: currentTheme.text }]}>Nhận quà yêu 50K</Text>
          <Text style={[styles.inviteSubtitle, { color: currentTheme.textSecondary }]}>Mời bạn bè nhận ngay quà siêu chất cùng StayHub</Text>
          <Pressable style={styles.inviteBtn}>
            <Text style={styles.inviteBtnText}>Nhận quà ngay</Text>
          </Pressable>
        </View>
      </View>

      {/* Registration Benefits */}
      <View style={[styles.benefitsCard, { backgroundColor: isDarkMode ? '#2d5c47' : '#f0f8f4', borderColor: currentTheme.border }]}>
        <Text style={[styles.benefitsTitle, { color: currentTheme.text }]}>Đăng ký tài khoản & nhận các quyền lợi</Text>

        {[
          { Icon: Gift, text: 'Nhận và sử dụng ưu đãi từ StayHub và đối tác' },
          { Icon: CircleDollarSign, text: 'Tích Joy Xu và tham gia chương trình tem tại khách sạn để đổi những ưu đãi hấp dẫn' },
          { Icon: Ticket, text: 'Nhận ngay coupon giảm giá 55% với người dùng mới' },
        ].map(({ Icon, text }, i) => (
          <View key={i} style={styles.benefitRow}>
            <Icon size={20} color={PRIMARY} strokeWidth={1.5} />
            <Text style={[styles.benefitText, { color: currentTheme.text }]}>{text}</Text>
          </View>
        ))}

        <Pressable style={styles.registerBtn} onPress={() => !isAuthenticated && router.push('/login/register' as any)}>
          <Text style={styles.registerBtnText}>{isAuthenticated ? 'Xem ưu đãi của tôi' : 'Đăng ký & nhận ưu đãi'}</Text>
        </Pressable>
      </View>

      {/* Bottom Menu */}
      <View style={styles.menuSection}>
        {[
          { Icon: Megaphone, label: 'Chương trình' },
          { Icon: Calendar, label: 'Lịch ưu đãi' },
        ].map(({ Icon, label }) => (
          <Pressable key={label} style={[styles.menuRow, { borderBottomColor: currentTheme.border }]}>
            <Icon size={24} color={PRIMARY} strokeWidth={1.5} />
            <Text style={[styles.menuLabel, { color: currentTheme.text }]}>{label}</Text>
            <ChevronRight size={18} color={currentTheme.textSecondary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  topCards: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  topCard: {
    flex: 1, borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
    shadowRadius: 8, elevation: 3,
    borderWidth: 1,
  },
  topCardLabel: { fontSize: 14, fontWeight: '500' },
  inviteBanner: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 16, overflow: 'hidden',
  },
  inviteContent: { width: '60%' },
  inviteTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  inviteSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  inviteBtn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  inviteBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  benefitsCard: {
    marginHorizontal: 16, marginBottom: 24,
    borderRadius: 16, padding: 16, borderWidth: 1,
  },
  benefitsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 20 },
  registerBtn: {
    backgroundColor: '#85c2a4', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginTop: 4,
  },
  registerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  menuSection: { paddingHorizontal: 16 },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
