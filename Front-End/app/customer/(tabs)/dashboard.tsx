import React, { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/src/customer/features/home/components/Header';
import CategoryNav from '@/src/customer/features/home/components/CategoryNav';
import BookingGrid from '@/src/customer/features/booking/components/BookingGrid';
import Banners from '@/src/customer/features/home/components/Banners';
import HotelSection from '@/src/customer/features/hotels/components/HotelSection';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const openNearMe = (type: string, title: string, lock = false) => {
    router.push({
      pathname: '/customer/near-me',
      params: { bookingType: type, title, lock: lock ? '1' : '0' },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Header
        onOpenSearch={() => router.push('/customer/search')}
        onOpenMessages={() => router.push('/customer/messages')}
        onOpenNotifications={() => router.push('/customer/notifications')}
        isScrolled={isScrolled}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isWebLayout && styles.webScrollContent]}
        showsVerticalScrollIndicator={isWebLayout}
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 30)}
        scrollEventThrottle={16}
      >
        <View style={[styles.card, { backgroundColor: currentTheme.card }, isWebLayout && styles.webCard]}>
          <CategoryNav onCategoryClick={(name) => openNearMe('Theo giờ', name)} />

          <View style={[styles.section, isWebLayout && styles.webSection]}>
            <BookingGrid
              onNearMeClick={() => openNearMe('Theo giờ', 'Gần tôi')}
              onBookingTypeClick={(type, title) => openNearMe(type, title, true)}
            />
          </View>

          <View style={[styles.section, isWebLayout && styles.webSection]}>
            <Banners />
          </View>

          <View style={[styles.section, isWebLayout && styles.webHotelPanel, { marginTop: 24, borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}>
            <HotelSection title="Flash Sale" tabs={['Theo giờ', 'Qua đêm']} hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, isWebLayout && styles.webHotelPanel, { borderTopColor: currentTheme.border, borderColor: currentTheme.border, backgroundColor: isWebLayout ? currentTheme.card : currentTheme.background }]}>
            <HotelSection title="Ưu đãi đặc biệt" hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, isWebLayout && styles.webHotelPanel, { borderTopColor: currentTheme.border, borderColor: currentTheme.border, backgroundColor: isWebLayout ? currentTheme.card : currentTheme.background }]}>
            <HotelSection title="StayHub gợi ý" hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, isWebLayout && styles.webHotelPanel, { borderTopColor: currentTheme.border, borderColor: currentTheme.border, backgroundColor: isWebLayout ? currentTheme.card : currentTheme.background }]}>
            <HotelSection title="Top được bình chọn" hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, isWebLayout && styles.webHotelPanel, { borderTopColor: currentTheme.border, borderColor: currentTheme.border, backgroundColor: isWebLayout ? currentTheme.card : currentTheme.background }]}>
            <HotelSection title="Khách sạn mới" hasMore />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  webScrollContent: {
    paddingBottom: 52,
    paddingHorizontal: 32,
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  webCard: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 28,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  section: { paddingHorizontal: 16, marginTop: 24 },
  webSection: {
    paddingHorizontal: 0,
    marginTop: 26,
  },
  dividerSection: {
    borderTopWidth: 1,
    paddingTop: 24,
    marginTop: 0,
  },
  webHotelPanel: {
    borderTopWidth: 0,
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    marginTop: 24,
  },
});
