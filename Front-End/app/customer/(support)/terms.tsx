import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';

const SECTIONS = [
  {
    title: 'Điều khoản sử dụng',
    body: 'Người dùng cần cung cấp thông tin chính xác khi đăng ký, đặt phòng và thanh toán. StayBuddy có thể từ chối xử lý các yêu cầu có dấu hiệu gian lận hoặc vi phạm quy định.',
  },
  {
    title: 'Chính sách đặt phòng',
    body: 'Thông tin thời gian nhận phòng, trả phòng, giá và ưu đãi được hiển thị trước khi xác nhận. Một số chính sách hủy hoặc đặt cọc phụ thuộc vào từng khách sạn.',
  },
  {
    title: 'Bảo mật dữ liệu',
    body: 'Thông tin tài khoản và lịch sử giao dịch chỉ được dùng để cung cấp dịch vụ, hỗ trợ khách hàng và cải thiện trải nghiệm đặt phòng.',
  },
];

export default function TermsScreen() {
  const goBack = useCustomerBack('/customer/profile');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, isWebLayout && styles.webHeader, { paddingTop: isWebLayout ? 18 : insets.top + 12, backgroundColor: currentTheme.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <ChevronLeft size={22} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.text }]}>Điều khoản</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, isWebLayout && styles.webContent]}
        showsVerticalScrollIndicator={isWebLayout}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={[styles.card, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{section.title}</Text>
            <Text style={[styles.body, { color: currentTheme.textSecondary }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: {
    overflow: 'hidden',
  },
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },
  webHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingBottom: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', marginLeft: 8 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 52,
  },
  card: { borderRadius: 14, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 21 },
});
