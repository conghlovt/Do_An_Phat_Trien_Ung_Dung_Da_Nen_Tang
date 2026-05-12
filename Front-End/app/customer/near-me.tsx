import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Modal, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import {
  ChevronLeft, SlidersHorizontal, ArrowDownUp,
  Search, ChevronDown, MapPin, Star, Tag, X,
} from 'lucide-react-native';
import { hotelsApi, Hotel } from '@/src/customer/api/hotels.api';
import ImageWithFallback from '@/src/customer/components/figma/ImageWithFallback';

const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#599373';

type SortOption = 'relevant' | 'distance' | 'rating' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'relevant', label: 'Phù hợp nhất' },
  { id: 'distance', label: 'Khoảng cách từ gần đến xa' },
  { id: 'rating', label: 'Điểm đánh giá từ cao đến thấp' },
  { id: 'price-asc', label: 'Giá từ thấp đến cao' },
  { id: 'price-desc', label: 'Giá từ cao đến thấp' },
];

const HOTEL_TYPES = ['Flash Sale', 'Giảm giá', 'Ưu đãi', 'Nổi bật', 'Mới', 'Gợi ý'];
const BOOKING_TYPES = ['Theo giờ', 'Qua đêm', 'Theo ngày'];

export default function NearMeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const params = useLocalSearchParams<{ bookingType: string; title: string; lock: string }>();

  const [selectedSort, setSelectedSort] = useState<SortOption>('relevant');
  const [selectedBookingType, setSelectedBookingType] = useState(params.bookingType || 'Theo giờ');
  const lockBookingType = params.lock === '1';

  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBookingTypeModal, setShowBookingTypeModal] = useState(false);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('20000');
  const [maxPrice, setMaxPrice] = useState('10000000');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const apiSort: 'relevant' | 'rating' | 'price-asc' | 'price-desc' =
      selectedSort === 'distance' ? 'relevant' : selectedSort;
    hotelsApi.getAll({ sort: apiSort, tag: selectedBookingType, limit: 20 })
      .then(({ data }: any) => { if (!cancelled) setHotels(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedSort, selectedBookingType]);

  const toggleHotelType = (type: string) => {
    setSelectedHotelTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      {/* Gradient BG */}
      <View style={styles.gradientBg} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={26} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>{params.title || 'Gần tôi'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {/* Booking Type */}
        {!lockBookingType && (
          <Pressable style={[styles.filterChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => setShowBookingTypeModal(true)}>
            <Text style={[styles.filterChipText, { color: currentTheme.text }]}>{selectedBookingType}</Text>
            <ChevronDown size={14} color={currentTheme.text} />
          </Pressable>
        )}
        {/* Sort */}
        <Pressable style={[styles.filterChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => setShowSortModal(true)}>
          <ArrowDownUp size={14} color={currentTheme.text} />
          <Text style={[styles.filterChipText, { color: currentTheme.text }]}>Sắp xếp</Text>
        </Pressable>
        {/* Filter */}
        <Pressable style={[styles.filterChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => setShowFilterModal(true)}>
          <SlidersHorizontal size={14} color={currentTheme.text} />
          <Text style={[styles.filterChipText, { color: currentTheme.text }]}>Lọc</Text>
        </Pressable>
      </ScrollView>

      {/* Hotel List */}
      <FlatList
        data={loading ? Array(3).fill(null) : hotels}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          loading ? (
            <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
          ) : (
            <HotelListCard hotel={item} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Không tìm thấy khách sạn phù hợp.</Text>
          ) : null
        }
      />

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowSortModal(false)} />
        <View style={[styles.sheet, { backgroundColor: currentTheme.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: currentTheme.border }]} />
          <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>Sắp xếp theo</Text>
          {SORT_OPTIONS.map(opt => (
            <Pressable
              key={opt.id}
              style={[styles.sheetRow, { borderBottomColor: currentTheme.border }]}
              onPress={() => { setSelectedSort(opt.id); setShowSortModal(false); }}
            >
              <Text style={[styles.sheetRowText, { color: currentTheme.textSecondary }, selectedSort === opt.id && { color: PRIMARY_DARK, fontWeight: '600' }]}>
                {opt.label}
              </Text>
              {selectedSort === opt.id && <View style={styles.radioFilled} />}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Booking Type Modal */}
      <Modal visible={showBookingTypeModal} transparent animationType="slide" onRequestClose={() => setShowBookingTypeModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowBookingTypeModal(false)} />
        <View style={[styles.sheet, { backgroundColor: currentTheme.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: currentTheme.border }]} />
          <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>Loại đặt phòng</Text>
          {BOOKING_TYPES.map(type => (
            <Pressable
              key={type}
              style={[styles.sheetRow, { borderBottomColor: currentTheme.border }]}
              onPress={() => { setSelectedBookingType(type); setShowBookingTypeModal(false); }}
            >
              <Text style={[styles.sheetRowText, { color: currentTheme.textSecondary }, selectedBookingType === type && { color: PRIMARY_DARK, fontWeight: '600' }]}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={[styles.filterModal, { backgroundColor: currentTheme.background }]}>
          <View style={[styles.filterHeader, { paddingTop: insets.top + 8, backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.filterTitle, { color: currentTheme.text }]}>Lọc khách sạn</Text>
            <Pressable onPress={() => setShowFilterModal(false)}>
              <X size={24} color={currentTheme.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Text style={[styles.filterSection, { color: currentTheme.text }]}>Loại khách sạn</Text>
            <View style={styles.chipRow}>
              {HOTEL_TYPES.map(type => {
                const active = selectedHotelTypes.includes(type);
                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }, active && styles.chipActive]}
                    onPress={() => toggleHotelType(type)}
                  >
                    <Text style={[styles.chipText, { color: currentTheme.textSecondary }, active && styles.chipTextActive]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.filterSection, { color: currentTheme.text }]}>Khoảng giá (VND)</Text>
            <View style={styles.priceRow}>
              <View style={[styles.priceInput, { borderColor: currentTheme.border }]}>
                <Text style={styles.priceLabel}>Từ</Text>
                <TextInput
                  style={[styles.priceField, { color: currentTheme.text }]}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                  placeholderTextColor={currentTheme.iconInactive}
                />
              </View>
              <Text style={{ color: currentTheme.iconInactive }}>—</Text>
              <View style={[styles.priceInput, { borderColor: currentTheme.border }]}>
                <Text style={styles.priceLabel}>Đến</Text>
                <TextInput
                  style={[styles.priceField, { color: currentTheme.text }]}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  placeholderTextColor={currentTheme.iconInactive}
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.filterFooter, { borderTopColor: currentTheme.border, paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={[styles.resetBtn, { borderColor: currentTheme.border }]}
              onPress={() => { setSelectedHotelTypes([]); setMinPrice('20000'); setMaxPrice('10000000'); }}
            >
              <Text style={[styles.resetBtnText, { color: currentTheme.text }]}>Đặt lại</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HotelListCard({ hotel }: { hotel: Hotel }) {
  const { currentTheme } = useThemeContext();
  return (
    <Pressable style={[styles.hotelCard, { backgroundColor: currentTheme.card }]}>
      <ImageWithFallback
        uri={hotel.image}
        style={styles.hotelImage}
      />
      <View style={styles.hotelInfo}>
        <Text style={[styles.hotelName, { color: currentTheme.text }]} numberOfLines={1}>{hotel.name}</Text>
        <View style={styles.hotelMeta}>
          <Star size={12} color="#facc15" fill="#facc15" />
          <Text style={[styles.hotelRating, { color: currentTheme.textSecondary }]}>{hotel.rating}</Text>
          <Text style={styles.hotelReviews}>({hotel.reviews}) • {hotel.location}</Text>
        </View>
        <View style={styles.hotelTag}>
          <Tag size={10} color="#599373" />
          <Text style={styles.hotelTagText}>{hotel.discount}</Text>
        </View>
        <View style={styles.hotelPriceRow}>
          <Text style={[styles.hotelPrice, { color: currentTheme.text }]}>{hotel.price}</Text>
          <Text style={styles.hotelUnit}>{hotel.unit}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    backgroundColor: 'rgba(133,194,164,0.25)',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
  filterBar: { maxHeight: 56 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03,
    shadowRadius: 2, elevation: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  list: { padding: 16, gap: 12 },
  skeleton: {
    height: 100, backgroundColor: '#f3f4f6', borderRadius: 16,
    marginBottom: 12,
  },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 24 },
  hotelCard: {
    flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, marginBottom: 12,
  },
  hotelImage: { width: 100, height: 100 },
  hotelInfo: { flex: 1, padding: 12 },
  hotelName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  hotelRating: { fontSize: 12, fontWeight: '700' },
  hotelReviews: { fontSize: 11, color: '#6b7280', flex: 1 },
  hotelTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(133,194,164,0.1)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6,
  },
  hotelTagText: { fontSize: 10, fontWeight: '700', color: '#599373' },
  hotelPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hotelPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
  hotelUnit: { fontSize: 11, color: '#6b7280' },
  // Modals
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 12,
  },
  sheetHandle: {
    width: 40, height: 6, borderRadius: 3,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb',
  },
  sheetRowText: { fontSize: 15, color: '#374151' },
  radioFilled: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: PRIMARY,
    borderWidth: 5, borderColor: 'rgba(133,194,164,0.3)',
  },
  // Filter Modal
  filterModal: { flex: 1 },
  filterHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  filterTitle: { fontSize: 17, fontWeight: '700' },
  filterSection: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput: {
    flex: 1, borderWidth: 1, borderRadius: 12,
    padding: 12,
  },
  priceLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  priceField: { fontSize: 15 },
  filterFooter: {
    flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1, borderWidth: 1, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600' },
  applyBtn: { flex: 2, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
