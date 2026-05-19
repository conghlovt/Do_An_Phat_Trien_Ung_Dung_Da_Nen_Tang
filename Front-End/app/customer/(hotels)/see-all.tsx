import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput, Modal,
  Platform, useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import {
  ChevronLeft, SlidersHorizontal, ArrowDownUp,
  Star, Tag, Zap, X,
} from 'lucide-react-native';
import { hotelsApi, Hotel } from '@/src/customer/features/hotels/api/hotels.api';
import ImageWithFallback from '@/src/customer/shared/ui/ImageWithFallback';
import { viewedHotelsStorage } from '@/src/customer/features/hotels/utils/viewedHotels';
import { toHotelFromViewed } from '@/src/customer/features/hotels/utils/viewedHotelMapper';
import {
  applyHotelListFilters,
  HOTEL_FILTER_TYPES,
  SORT_OPTIONS,
  type SortOption,
} from '@/src/customer/features/hotels/utils/hotelListFilters';
import { FLASH_SALE_TABS, SECTION_TAG_MAP } from '@/src/customer/features/hotels/utils/hotelSections';

const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#599373';
const VIEWED_SECTION = 'Khách sạn đã xem';
const DEFAULT_MIN_PRICE = '20000';
const DEFAULT_MAX_PRICE = '10000000';

export default function SeeAllScreen() {
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{ section: string; tab?: string }>();
  const sectionTitle = params.section || 'Khách sạn';
  const isFlashSale = sectionTitle === 'Flash Sale';
  const isViewedSection = sectionTitle === VIEWED_SECTION;
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const [activeTab, setActiveTab] = useState(params.tab || (isFlashSale ? 'Theo giờ' : undefined));
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevant');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
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

    if (isViewedSection) {
      viewedHotelsStorage.getAll()
        .then(async (viewedHotels) => {
          const hotelDetails = await Promise.all(
            viewedHotels.map(async (hotel) => {
              try {
                const { data } = await hotelsApi.getById(hotel.id);
                return data;
              } catch {
                return toHotelFromViewed(hotel);
              }
            }),
          );

          if (!cancelled) {
            setHotels(applyHotelListFilters(hotelDetails, {
              maxPrice: appliedMaxPrice,
              minPrice: appliedMinPrice,
              selectedHotelTypes,
              sort: selectedSort,
            }));
          }
        })
        .finally(() => { if (!cancelled) setLoading(false); });

      return () => { cancelled = true; };
    }

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
  }, [activeTab, selectedSort, sectionTitle, appliedMinPrice, appliedMaxPrice, isViewedSection, isFlashSale, selectedHotelTypes]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const toggleHotelType = (type: string) => {
    if (type === 'Tất cả') {
      setSelectedHotelTypes([]);
      return;
    }

    setSelectedHotelTypes(prev => prev.includes(type) ? [] : [type]);
  };

  const selectedSortLabel = SORT_OPTIONS.find(option => option.id === selectedSort)?.label || 'Phù hợp nhất';
  const activeFilterCount = selectedHotelTypes.length + (appliedMinPrice !== undefined || appliedMaxPrice !== undefined ? 1 : 0);

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      {/* Green gradient bg */}
      <View style={styles.gradientBg} />

      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
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
        <View style={[styles.countdownBar, isWebLayout && styles.webSection]}>
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
        <View style={[styles.tabBar, isWebLayout && styles.webSection]}>
          {FLASH_SALE_TABS.map(tab => (
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
      <View style={[styles.filterBar, isWebLayout && styles.webFilterBar]}>
        {isWebLayout && (
          <View style={styles.filterTitleWrap}>
            <Text style={[styles.filterPanelTitle, { color: currentTheme.text }]}>Bộ lọc & sắp xếp</Text>
            <Text style={styles.filterPanelSubtitle}>Tinh chỉnh kết quả khách sạn</Text>
          </View>
        )}
        <Pressable style={[styles.filterChip, !isWebLayout && styles.mobileFilterChip, { backgroundColor: currentTheme.card }]} onPress={() => setShowSortModal(true)}>
          <View style={styles.filterIconBadge}>
            <ArrowDownUp size={16} color={PRIMARY_DARK} />
          </View>
          <View style={styles.filterTextWrap}>
            <Text style={styles.filterChipLabel}>Sắp xếp</Text>
            <Text style={[styles.filterChipValue, { color: currentTheme.text }]} numberOfLines={1}>{selectedSortLabel}</Text>
          </View>
        </Pressable>
        <Pressable style={[styles.filterChip, !isWebLayout && styles.mobileFilterChip, activeFilterCount > 0 && styles.filterChipActive, { backgroundColor: currentTheme.card }]} onPress={() => setShowFilterModal(true)}>
          <View style={styles.filterIconBadge}>
            <SlidersHorizontal size={16} color={PRIMARY_DARK} />
          </View>
          <View style={styles.filterTextWrap}>
            <Text style={styles.filterChipLabel}>Bộ lọc</Text>
            <Text style={[styles.filterChipValue, { color: currentTheme.text }]}>{activeFilterCount > 0 ? `${activeFilterCount} đang chọn` : 'Chưa áp dụng'}</Text>
          </View>
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
        {isWebLayout && (
          <>
            <View style={{ flex: 1 }} />
            <Text style={styles.countText}>{loading ? '...' : `${hotels.length} khách sạn`}</Text>
          </>
        )}
      </View>

      {/* Hotel List */}
      <FlatList
        data={loading ? Array(5).fill(null) : hotels}
        keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
        contentContainerStyle={[styles.list, isWebLayout && styles.webList]}
        showsVerticalScrollIndicator={isWebLayout}
        renderItem={({ item }) =>
          loading ? (
            <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
          ) : (
            <HotelListCard hotel={item} isFlashSale={isFlashSale} isWebLayout={isWebLayout} />
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
              {HOTEL_FILTER_TYPES.map(type => {
                const active = type === 'Tất cả' ? selectedHotelTypes.length === 0 : selectedHotelTypes.includes(type);
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
                setMinPrice(DEFAULT_MIN_PRICE);
                setMaxPrice(DEFAULT_MAX_PRICE);
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

function HotelListCard({ hotel, isFlashSale, isWebLayout }: { hotel: Hotel; isFlashSale: boolean; isWebLayout: boolean }) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  return (
    <Pressable
      style={[styles.hotelCard, isWebLayout && styles.webHotelCard, { backgroundColor: currentTheme.card, borderColor: 'rgba(133,194,164,0.28)' }]}
      onPress={() => router.push({
        pathname: '/customer/hotel-detail' as any,
        params: {
          id: String(hotel.id),
          name: hotel.name,
          rating: String(hotel.rating),
          reviews: String(hotel.reviews),
          location: hotel.location,
          discount: hotel.discount,
          price: hotel.price,
          unit: hotel.unit,
          oldPrice: hotel.oldPrice || '',
          image: hotel.image,
          badge: hotel.badge || '',
        },
      })}
    >
      <View style={[styles.hotelImageWrap, isWebLayout && styles.webHotelImageWrap]}>
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
            <Text style={styles.hotelPrice}>{hotel.price}</Text>
            <Text style={styles.hotelUnit}>{hotel.unit}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: {
    overflow: 'hidden',
  },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
    backgroundColor: 'rgba(133,194,164,0.3)',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  webHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 18,
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
  webSection: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 32,
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
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  webFilterBar: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 32,
  },
  filterTitleWrap: {
    minWidth: 150,
  },
  filterPanelTitle: { fontSize: 14, fontWeight: '800' },
  filterPanelSubtitle: { fontSize: 11, color: PRIMARY_DARK, fontWeight: '600', marginTop: 2 },
  filterChip: {
    minWidth: 154,
    minHeight: 50,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(133,194,164,0.45)',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 8, elevation: 2,
  },
  mobileFilterChip: {
    flex: 1,
    minWidth: 0,
  },
  filterChipActive: { backgroundColor: 'rgba(133,194,164,0.18)' },
  filterIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(133,194,164,0.18)',
  },
  filterTextWrap: { minWidth: 0, flex: 1 },
  filterChipLabel: { fontSize: 11, fontWeight: '700', color: PRIMARY_DARK, marginBottom: 2 },
  filterChipValue: { fontSize: 13, fontWeight: '800', maxWidth: 118 },
  filterCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  filterCountText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  countText: { fontSize: 13, color: PRIMARY_DARK, fontWeight: '700' },
  // List
  list: { padding: 16, paddingTop: 8, gap: 12, paddingBottom: 32 },
  webList: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 52,
  },
  skeleton: { height: 110, borderRadius: 16 },
  emptyWrap: { paddingTop: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  // Hotel card
  hotelCard: {
    flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, borderWidth: 1,
  },
  webHotelCard: {
    minHeight: 132,
  },
  hotelImageWrap: { width: 110, height: 110, position: 'relative' },
  webHotelImageWrap: { width: 156, height: 132 },
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
    backgroundColor: 'rgba(133,194,164,0.18)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(133,194,164,0.35)',
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6,
  },
  hotelTagText: { fontSize: 10, fontWeight: '700', color: '#599373' },
  hotelPriceBlock: {},
  oldPrice: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through', marginBottom: 2 },
  hotelPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hotelPrice: { fontSize: 16, fontWeight: '700', color: PRIMARY_DARK },
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
