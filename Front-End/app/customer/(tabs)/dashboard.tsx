import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/src/customer/components/mobile/Header';
import CategoryNav from '@/src/customer/components/mobile/CategoryNav';
import BookingGrid from '@/src/customer/components/mobile/BookingGrid';
import Banners from '@/src/customer/components/mobile/Banners';
import HotelSection from '@/src/customer/components/mobile/HotelSection';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
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
        onOpenNotifications={() => router.push('/customer/notifications')}
        isScrolled={isScrolled}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 30)}
        scrollEventThrottle={16}
      >
        {/* White card area */}
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <CategoryNav onCategoryClick={(name) => openNearMe('Theo giờ', name)} />

          <View style={styles.section}>
            <BookingGrid
              onNearMeClick={() => openNearMe('Theo giờ', 'Gần tôi')}
              onBookingTypeClick={(type, title) => openNearMe(type, title, true)}
            />
          </View>

          <View style={styles.section}>
            <Banners />
          </View>

          <View style={[styles.section, { marginTop: 24 }]}>
            <HotelSection title="Flash Sale" tabs={['Theo giờ', 'Qua đêm']} hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, { borderTopColor: currentTheme.border, backgroundColor: currentTheme.background }]}>
            <HotelSection title="Ưu đãi đặc biệt" hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, { borderTopColor: currentTheme.border, backgroundColor: currentTheme.background }]}>
            <HotelSection title="StayHub gợi ý" hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, { borderTopColor: currentTheme.border, backgroundColor: currentTheme.background }]}>
            <HotelSection title="Top được bình chọn" hasMore />
          </View>

          <View style={[styles.section, styles.dividerSection, { borderTopColor: currentTheme.border, backgroundColor: currentTheme.background }]}>
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
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  section: { paddingHorizontal: 16, marginTop: 24 },
  dividerSection: {
    borderTopWidth: 1,
    paddingTop: 24,
    marginTop: 0,
  },
});
