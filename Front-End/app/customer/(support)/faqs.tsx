import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';

const FAQS = [
  {
    question: 'Tôi có cần đăng nhập để đặt phòng không?',
    answer: 'Bạn nên đăng nhập để lưu lịch sử đặt phòng và nhận ưu đãi dành riêng cho tài khoản.',
  },
  {
    question: 'Tôi có thể đổi thời gian nhận phòng không?',
    answer: 'Bạn có thể chọn lại thời gian trước bước xác nhận đặt phòng. Với đơn đã xác nhận, vui lòng liên hệ hỗ trợ.',
  },
  {
    question: 'Giá hiển thị đã bao gồm khuyến mãi chưa?',
    answer: 'Giá trên danh sách đã áp dụng ưu đãi nếu khách sạn đang có chương trình phù hợp.',
  },
];

export default function FaqsScreen() {
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
        <Text style={[styles.title, { color: currentTheme.text }]}>Hỏi đáp</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, isWebLayout && styles.webContent]}
        showsVerticalScrollIndicator={isWebLayout}
      >
        {FAQS.map((item) => (
          <View key={item.question} style={[styles.card, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.question, { color: currentTheme.text }]}>{item.question}</Text>
            <Text style={[styles.answer, { color: currentTheme.textSecondary }]}>{item.answer}</Text>
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
  question: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  answer: { fontSize: 14, lineHeight: 21 },
});
