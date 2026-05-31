import React, { useState } from 'react';
import {
  Platform, View, Text, StyleSheet, Pressable, TextInput, ScrollView, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { X, Navigation, Calendar, Search } from 'lucide-react-native';
import BookingDateModal from '@/src/customer/features/booking/BookingDateModal';
import {
  BOOKING_TAB_TO_TYPE,
  BOOKING_TYPE_TITLES,
  BOOKING_TYPE_TO_TAB,
  formatShortDate,
  SEARCH_BOOKING_TABS,
  type BookingTabType,
} from '@/src/customer/utils/booking/booking';

const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#85c2a4';
const PRIMARY_SOFT = 'rgba(133,194,164,0.12)';
const PRIMARY_BORDER = 'rgba(133,194,164,0.35)';
const WEB_INPUT_RESET = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

export default function SearchScreen() {
  const router = useRouter();
  const goBack = useCustomerBack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<BookingTabType>('hourly');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    const bookingType = BOOKING_TAB_TO_TYPE[activeTab];

    router.push({
      pathname: '/customer/hotels/near-me',
      params: {
        bookingType,
        title: trimmedKeyword ? `Tìm kiếm: ${trimmedKeyword}` : BOOKING_TYPE_TITLES[bookingType],
        lock: '0',
        keyword: trimmedKeyword,
      },
    });
  };

  return (
    <>
      <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
        {/* Header */}
        <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card }]}>
          <Pressable onPress={goBack} style={styles.closeBtn}>
            <X size={24} color={currentTheme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Tìm kiếm khách sạn</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={isWebLayout}
          contentContainerStyle={[styles.scrollContent, isWebLayout && styles.webScrollContent]}
        >
          {/* Search Card */}
          <View style={[styles.card, isWebLayout && styles.webCard, { backgroundColor: currentTheme.card, borderColor: PRIMARY_BORDER }]}>
            {/* Tabs */}
            <View style={styles.tabs}>
              {SEARCH_BOOKING_TABS.map(({ id, label }) => (
                <Pressable
                  key={id}
                  onPress={() => setActiveTab(id)}
                  style={[styles.tab, activeTab === id && styles.tabActive]}
                >
                  <Text style={[styles.tabText, activeTab === id && styles.tabTextActive, { color: activeTab === id ? '#fff' : currentTheme.textSecondary }]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Inputs */}
            <View style={styles.inputRow}>
              <Search size={20} color={PRIMARY_DARK} />
              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Tìm địa điểm, khách sạn"
                placeholderTextColor={currentTheme.iconInactive}
                returnKeyType="search"
                selectionColor={PRIMARY}
                style={[styles.input, WEB_INPUT_RESET, { color: currentTheme.text }]}
                onSubmitEditing={handleSearch}
              />
              <Pressable>
                <Navigation size={18} color={currentTheme.iconInactive} />
              </Pressable>
            </View>

            <Pressable
              style={styles.inputRow}
              onPress={() => setCalendarVisible(true)}
            >
              <Calendar size={20} color={PRIMARY_DARK} />
              <Text style={[styles.input, { color: currentTheme.iconInactive, flex: 1 }]}>Nhận/ trả phòng</Text>
              <Text style={styles.anyText}>{selectedDate ? formatShortDate(selectedDate) : 'Bất kỳ'}</Text>
            </Pressable>

            <Pressable style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Tìm kiếm</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <BookingDateModal
        visible={calendarVisible}
        initialBookingType={BOOKING_TAB_TO_TYPE[activeTab]}
        onClose={() => setCalendarVisible(false)}
        onApply={(bookingType, date) => {
          setActiveTab(BOOKING_TYPE_TO_TAB[bookingType]);
          setSelectedDate(date);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  webHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 18,
  },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  scrollContent: {
    paddingBottom: 32,
  },
  webScrollContent: {
    paddingHorizontal: 32,
    paddingTop: 22,
    paddingBottom: 52,
  },
  card: {
    borderRadius: 20, margin: 16, padding: 16,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  webCard: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    margin: 0,
    padding: 22,
    borderRadius: 18,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 99, padding: 4, marginBottom: 16,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    backgroundColor: PRIMARY_SOFT,
  },
  tab: { flex: 1, borderRadius: 99, paddingVertical: 8, alignItems: 'center' },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderColor: PRIMARY_BORDER,
  },
  input: { flex: 1, fontSize: 15 },
  anyText: { fontSize: 15, fontWeight: '500', color: PRIMARY_DARK },
  searchBtn: {
    backgroundColor: PRIMARY, borderRadius: 99, paddingVertical: 14, alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
