import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput, Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import {
  ChevronLeft, SlidersHorizontal, ArrowDownUp,
  ChevronDown, Star, Tag, Zap, X,
} from 'lucide-react-native';
import { hotelsApi, Hotel } from '@/src/customer/api/hotels.api';
import ImageWithFallback from '@/src/customer/components/figma/ImageWithFallback';

const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#599373';

// Section-to-tag mapping
const SECTION_TAG_MAP: Record<string, string> = {
  'Flash Sale': 'Flash Sale',
  'Ưu đãi đặc biệt': 'Ưu đãi',
  'StayHub gợi ý': 'Gợi ý',
  'Top được bình chọn': 'Nổi bật',
  'Khách sạn mới': 'Mới',
};

type SortOption = 'relevant' | 'rating' | 'price-asc' | 'price-desc';
const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'relevant', label: 'Phù hợp nhất' },
  { id: 'rating', label: 'Điểm đánh giá từ cao đến thấp' },
  { id: 'price-asc', label: 'Giá từ thấp đến cao' },
  { id: 'price-desc', label: 'Giá từ cao đến thấp' },
];

const HOTEL_TYPES = ['Flash Sale', 'Giảm giá', 'Ưu đãi', 'Nổi bật', 'Mới', 'Gợi ý'];

// Flash Sale sub-tabs
const FLASH_TABS = ['Theo giờ', 'Qua đêm'];

export default function SeeAllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const params = useLocalSearchParams<{ section: string; tab?: string }>();
  const sectionTitle = params.section || 'Khách sạn';
  const isFlashSale = sectionTitle === 'Flash Sale';

  const [activeTab, setActiveTab] = useState(params.tab || (isFlashSale ? 'Theo giờ' : undefined));
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevant');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('20000');
  const [maxPrice, setMaxPrice] = useState('10000000');
  // Applied filter values (chỉ gửi API sau khi bấm "Áp dụng")
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);

  // Countdown state for Flash Sale
  const [countdown, setCountdown] = useState({ h: 2, m: 37, s: 14 });

  useEffect(() => {
    if (!isFlashSale) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlashSale]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const tag = isFlashSale ? activeTab : SECTION_TAG_MAP[sectionTitle];
    hotelsApi.getAll({
      tag,
      sort: selectedSort,
      limit: 30,
      minPrice: appliedMinPrice,
      maxPrice: appliedMaxPrice,
    })
      .then(({ data }: any) => { if (!cancelled) setHotels(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, selectedSort, sectionTitle, appliedMinPrice, appliedMaxPrice]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const toggleHotelType = (type: string) => {
    setSelectedHotelTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      {/* Green gradient bg */}
      <View style={styles.gradientBg} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={26} color={currentTheme.text} />
        </Pressable>
        <View style={styles.titleWrap}>
          {isFlashSale && <Zap size={20} color="#eab308" fill="#eab308" />}
          <Text style={[styles.title, { color: currentTheme.text }]}>{sectionTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Flash Sale countdown */}
      {isFlashSale && (
        <View style={styles.countdownBar}>
          <Text style={styles.countdownLabel}>Kết thúc sau</Text>
          <View style={styles.countdownTimer}>
            <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.h)}</Text></View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.m)}</Text></View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.s)}</Text></View>
          </View>
        </View>
      )}

      {/* Flash Sale tabs */}
      {isFlashSale && (
        <View style={styles.tabBar}>
          {FLASH_TABS.map(tab => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Pressable style={[styles.filterChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => setShowSortModal(true)}>
          <ArrowDownUp size={14} color={currentTheme.text} />
          <Text style={[styles.filterChipText, { color: currentTheme.text }]}>Sắp xếp</Text>
        </Pressable>
        <Pressable style={[styles.filterChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={() => setShowFilterModal(true)}>
          <SlidersHorizontal size={14} color={currentTheme.text} />
          <Text style={[styles.filterChipText, { color: currentTheme.text }]}>Lọc</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Text style={styles.countText}>{loading ? '...' : `${hotels.length} khách sạn`}</Text>
      </View>

      {/* Hotel List */}
      <FlatList
        data={loading ? Array(5).fill(null) : hotels}
        keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          loading ? (
            <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
          ) : (
            <HotelListCard hotel={item} isFlashSale={isFlashSale} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Không tìm thấy khách sạn phù hợp.</Text>
            </View>
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

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={[styles.filterModal, { backgroundColor: currentTheme.background }]}>
          <View style={[styles.filterHeader, { paddingTop: insets.top + 8, backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.filterTitle, { color: currentTheme.text }]}>Lọc khách sạn</Text>
            <Pressable onPress={() => setShowFilterModal(false)}>
              <X size={24} color={currentTheme.text} />
            </Pressable>
          </View>
          <View style={{ padding: 16, flex: 1 }}>
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
                <TextInput style={[styles.priceField, { color: currentTheme.text }]} value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholderTextColor={currentTheme.iconInactive} />
              </View>
              <Text style={{ color: currentTheme.iconInactive }}>—</Text>
              <View style={[styles.priceInput, { borderColor: currentTheme.border }]}>
                <Text style={styles.priceLabel}>Đến</Text>
                <TextInput style={[styles.priceField, { color: currentTheme.text }]} value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholderTextColor={currentTheme.iconInactive} />
              </View>
            </View>
          </View>
          <View style={[styles.filterFooter, { borderTopColor: currentTheme.border, paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={[styles.resetBtn, { borderColor: currentTheme.border }]}
              onPress={() => {
                setSelectedHotelTypes([]);
                setMinPrice('20000');
                setMaxPrice('10000000');
                setAppliedMinPrice(undefined);
                setAppliedMaxPrice(undefined);
              }}
            >
              <Text style={[styles.resetBtnText, { color: currentTheme.text }]}>Đặt lại</Text>
            </Pressable>
            <Pressable
              style={styles.applyBtn}
              onPress={() => {
                const min = Number(minPrice);
                const max = Number(maxPrice);
                setAppliedMinPrice(min > 0 ? min : undefined);
                setAppliedMaxPrice(max > 0 ? max : undefined);
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HotelListCard({ hotel, isFlashSale }: { hotel: Hotel; isFlashSale: boolean }) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  return (
    <Pressable
      style={[styles.hotelCard, { backgroundColor: currentTheme.card }]}
      onPress={() => router.push({ pathname: '/customer/hotel-detail' as any, params: { id: String(hotel.id) } })}
    >
      <View style={styles.hotelImageWrap}>
        <ImageWithFallback uri={hotel.image} style={styles.hotelImage} />
        {isFlashSale && (
          <View style={styles.flashBadge}>
            <Zap size={10} color="#fff" fill="#fff" />
            <Text style={styles.flashBadgeText}>Flash</Text>
          </View>
        )}
        {!!hotel.badge && !isFlashSale && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>{hotel.badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.hotelInfo}>
        <Text style={[styles.hotelName, { color: currentTheme.text }]} numberOfLines={2}>{hotel.name}</Text>
        <View style={styles.hotelMeta}>
          <Star size={12} color="#facc15" fill="#facc15" />
          <Text style={[styles.hotelRating, { color: currentTheme.textSecondary }]}>{hotel.rating}</Text>
          <Text style={styles.hotelReviews}>({hotel.reviews}) • {hotel.location}</Text>
        </View>
        <View style={styles.hotelTag}>
          <Tag size={10} color="#599373" />
          <Text style={styles.hotelTagText}>{hotel.discount}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.hotelPriceBlock}>
          {!!hotel.oldPrice && (
            <Text style={styles.oldPrice}>{hotel.oldPrice}</Text>
          )}
          <View style={styles.hotelPriceRow}>
            <Text style={[styles.hotelPrice, { color: currentTheme.text }]}>{hotel.price}</Text>
            <Text style={styles.hotelUnit}>{hotel.unit}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
    backgroundColor: 'rgba(133,194,164,0.18)',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  // Countdown
  countdownBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#fff8e1', marginHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#fde68a', marginBottom: 8,
  },
  countdownLabel: { fontSize: 13, fontWeight: '600', color: '#92400e', flex: 1 },
  countdownTimer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeUnit: {
    backgroundColor: '#111827', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, minWidth: 32, alignItems: 'center',
  },
  timeNum: { color: '#fff', fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timeSep: { color: '#111827', fontSize: 18, fontWeight: '800' },
  // Tab bar
  tabBar: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8,
  },
  tabBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1,
  },
  tabBtnActive: {
    backgroundColor: PRIMARY, borderColor: PRIMARY,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  // Filter bar
  filterBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03,
    shadowRadius: 2, elevation: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: '500' },
  countText: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  // List
  list: { padding: 16, paddingTop: 8, gap: 12, paddingBottom: 32 },
  skeleton: { height: 110, borderRadius: 16 },
  emptyWrap: { paddingTop: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  // Hotel card
  hotelCard: {
    flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2,
  },
  hotelImageWrap: { width: 110, height: 110, position: 'relative' },
  hotelImage: { width: '100%', height: '100%' },
  flashBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: '#eab308', flexDirection: 'row', alignItems: 'center',
    gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  flashBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  hotBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: '#ff5a5f', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  hotBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  hotelInfo: { flex: 1, padding: 12, justifyContent: 'flex-start' },
  hotelName: { fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  hotelRating: { fontSize: 12, fontWeight: '700' },
  hotelReviews: { fontSize: 11, color: '#6b7280', flex: 1 },
  hotelTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(133,194,164,0.1)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6,
  },
  hotelTagText: { fontSize: 10, fontWeight: '700', color: '#599373' },
  hotelPriceBlock: {},
  oldPrice: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through', marginBottom: 2 },
  hotelPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hotelPrice: { fontSize: 16, fontWeight: '700' },
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
  sheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb',
  },
  sheetRowText: { fontSize: 15 },
  radioFilled: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: PRIMARY,
    borderWidth: 5, borderColor: 'rgba(133,194,164,0.3)',
  },
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
  priceInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
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
