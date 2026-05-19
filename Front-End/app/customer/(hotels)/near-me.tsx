import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Modal, FlatList, Platform, useWindowDimensions, PanResponder,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import {
  ChevronLeft, SlidersHorizontal, ArrowDownUp,
  ChevronDown, Star, Tag, X,
} from 'lucide-react-native';
import { hotelsApi, Hotel } from '@/src/customer/features/hotels/api/hotels.api';
import ImageWithFallback from '@/src/customer/shared/ui/ImageWithFallback';
import {
  applyHotelListFilters,
  HOTEL_AMENITY_FILTERS,
  HOTEL_FILTER_TYPES,
} from '@/src/customer/features/hotels/utils/hotelListFilters';

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

const BOOKING_TYPES = ['Theo giờ', 'Qua đêm', 'Theo ngày'];
const DEFAULT_MIN_PRICE = '20000';
const DEFAULT_MAX_PRICE = '10000000';
const PRICE_MIN_LIMIT = Number(DEFAULT_MIN_PRICE);
const PRICE_MAX_LIMIT = Number(DEFAULT_MAX_PRICE);
const PRICE_KNOB_SIZE = 34;
const PRICE_TRACK_ACTIVE = '#85c2a4';
const PRICE_TRACK_INACTIVE = '#414647';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const normalizePrice = (value: number) => Math.round(clamp(value, PRICE_MIN_LIMIT, PRICE_MAX_LIMIT));

const getPriceNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, PRICE_MIN_LIMIT, PRICE_MAX_LIMIT) : fallback;
};

const sanitizePriceInput = (value: string) => value.replace(/\D/g, '');
const formatPriceInput = (value: string) => {
  const parsed = Number(sanitizePriceInput(value));
  return Number.isFinite(parsed) && parsed > 0 ? `${parsed.toLocaleString('vi-VN')}đ` : '';
};

export default function NearMeScreen() {
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{ bookingType: string; title: string; lock: string }>();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [priceTrackWidth, setPriceTrackWidth] = useState(0);

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
    if (type === 'Tất cả') {
      setSelectedHotelTypes([]);
      return;
    }

    setSelectedHotelTypes(prev => prev.includes(type) ? [] : [type]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity]
    );
  };

  const selectedSortLabel = SORT_OPTIONS.find(option => option.id === selectedSort)?.label || 'Phù hợp nhất';
  const activeFilterCount = selectedHotelTypes.length + selectedAmenities.length + (minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE ? 1 : 0);
  const visibleAmenities = showAllAmenities ? HOTEL_AMENITY_FILTERS : HOTEL_AMENITY_FILTERS.slice(0, 10);
  const typedMinPrice = getPriceNumber(minPrice, PRICE_MIN_LIMIT);
  const typedMaxPrice = getPriceNumber(maxPrice, PRICE_MAX_LIMIT);
  const currentMinPrice = Math.min(typedMinPrice, typedMaxPrice);
  const currentMaxPrice = Math.max(typedMinPrice, typedMaxPrice);
  const priceRange = PRICE_MAX_LIMIT - PRICE_MIN_LIMIT;
  const minPricePercent = (currentMinPrice - PRICE_MIN_LIMIT) / priceRange;
  const maxPricePercent = (currentMaxPrice - PRICE_MIN_LIMIT) / priceRange;
  const minKnobLeft = priceTrackWidth > 0
    ? clamp(minPricePercent * priceTrackWidth - PRICE_KNOB_SIZE / 2, -PRICE_KNOB_SIZE / 2, priceTrackWidth - PRICE_KNOB_SIZE / 2)
    : 0;
  const maxKnobLeft = priceTrackWidth > 0
    ? clamp(maxPricePercent * priceTrackWidth - PRICE_KNOB_SIZE / 2, -PRICE_KNOB_SIZE / 2, priceTrackWidth - PRICE_KNOB_SIZE / 2)
    : 0;
  const activeTrackLeft = priceTrackWidth * minPricePercent;
  const activeTrackWidth = priceTrackWidth * (maxPricePercent - minPricePercent);
  const minDragStart = React.useRef(currentMinPrice);
  const maxDragStart = React.useRef(currentMaxPrice);

  const minPriceResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => { minDragStart.current = currentMinPrice; },
    onPanResponderMove: (_, gestureState) => {
      if (priceTrackWidth <= 0) return;
      const next = normalizePrice(minDragStart.current + (gestureState.dx / priceTrackWidth) * priceRange);
      setMinPrice(String(Math.min(next, currentMaxPrice)));
    },
  }), [currentMinPrice, currentMaxPrice, priceRange, priceTrackWidth]);

  const maxPriceResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => { maxDragStart.current = currentMaxPrice; },
    onPanResponderMove: (_, gestureState) => {
      if (priceTrackWidth <= 0) return;
      const next = normalizePrice(maxDragStart.current + (gestureState.dx / priceTrackWidth) * priceRange);
      setMaxPrice(String(Math.max(next, currentMinPrice)));
    },
  }), [currentMinPrice, currentMaxPrice, priceRange, priceTrackWidth]);

  const filteredHotels = useMemo(() => applyHotelListFilters(hotels, {
    maxPrice: Number(maxPrice) > 0 ? Number(maxPrice) : undefined,
    minPrice: Number(minPrice) > 0 ? Number(minPrice) : undefined,
    selectedAmenities,
    selectedHotelTypes,
    sort: selectedSort === 'distance' ? 'relevant' : selectedSort,
  }), [hotels, maxPrice, minPrice, selectedAmenities, selectedHotelTypes, selectedSort]);

  const renderFilterControls = (isSidebar = false) => (
    <>
      {!lockBookingType && (
        <View style={styles.webFilterSectionBlock}>
          <Text style={[styles.filterSection, isSidebar && styles.webSidebarSectionTitle, { color: currentTheme.text }]}>Loại đặt</Text>
          <View style={styles.chipRow}>
            {BOOKING_TYPES.map(type => (
              <Pressable
                key={type}
                style={[
                  styles.chip,
                  isSidebar && styles.webSidebarChip,
                  { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
                  selectedBookingType === type && styles.chipActive,
                ]}
                onPress={() => setSelectedBookingType(type)}
              >
                <Text style={[styles.chipText, isSidebar && styles.webSidebarChipText, { color: currentTheme.textSecondary }, selectedBookingType === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.webFilterSectionBlock}>
        <Text style={[styles.filterSection, isSidebar && styles.webSidebarSectionTitle, { color: currentTheme.text }]}>Khoảng giá</Text>
        <View style={[styles.priceRangeCard, isSidebar && styles.webSidebarPriceCard, isSidebar && { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <View
            style={[styles.priceSlider, isSidebar && styles.webSidebarPriceTrackRow]}
            onLayout={(event) => setPriceTrackWidth(event.nativeEvent.layout.width)}
          >
            <View pointerEvents="none" style={styles.priceTrack} />
            <View pointerEvents="none" style={[styles.priceTrackActive, { left: activeTrackLeft, width: activeTrackWidth }]} />
            <View
              style={[styles.priceKnob, styles.priceKnobFloating, { left: minKnobLeft }]}
              hitSlop={18}
              {...minPriceResponder.panHandlers}
            >
              <Text style={styles.priceKnobText}>≡</Text>
            </View>
            <View
              style={[styles.priceKnob, styles.priceKnobFloating, styles.priceKnobMax, { left: maxKnobLeft }]}
              hitSlop={18}
              {...maxPriceResponder.panHandlers}
            >
              <Text style={styles.priceKnobText}>≡</Text>
            </View>
          </View>
          <View style={[styles.priceRow, isSidebar && styles.webSidebarPriceRow]}>
            <View style={[styles.priceInput, isSidebar && styles.webSidebarPriceInput, isSidebar && { borderColor: currentTheme.border }]}>
              <Text style={styles.priceLabel}>Giá tối thiểu</Text>
              <TextInput
                style={[styles.priceField, isSidebar && styles.webSidebarPriceField, { color: currentTheme.text }]}
                value={formatPriceInput(minPrice)}
                onChangeText={(value) => setMinPrice(sanitizePriceInput(value))}
                keyboardType="numeric"
                placeholderTextColor={currentTheme.iconInactive}
              />
            </View>
            <View style={[styles.priceInput, isSidebar && styles.webSidebarPriceInput, isSidebar && { borderColor: currentTheme.border }]}>
              <Text style={styles.priceLabel}>Giá tối đa</Text>
              <TextInput
                style={[styles.priceField, isSidebar && styles.webSidebarPriceField, { color: currentTheme.text }]}
                value={formatPriceInput(maxPrice)}
                onChangeText={(value) => setMaxPrice(sanitizePriceInput(value))}
                keyboardType="numeric"
                placeholderTextColor={currentTheme.iconInactive}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.webFilterSectionBlock}>
        <Text style={[styles.filterSection, isSidebar && styles.webSidebarSectionTitle, { color: currentTheme.text }]}>Loại khách sạn</Text>
        <View style={styles.chipRow}>
          {HOTEL_FILTER_TYPES.map(type => {
            const active = type === 'Tất cả' ? selectedHotelTypes.length === 0 : selectedHotelTypes.includes(type);
            return (
              <Pressable
                key={type}
                style={[styles.chip, isSidebar && styles.webSidebarChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }, active && styles.chipActive]}
                onPress={() => toggleHotelType(type)}
              >
                <Text style={[styles.chipText, isSidebar && styles.webSidebarChipText, { color: currentTheme.textSecondary }, active && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.webFilterSectionBlock}>
        <Text style={[styles.filterSection, isSidebar && styles.webSidebarSectionTitle, { color: currentTheme.text }]}>Tiện ích</Text>
        <View style={styles.amenityList}>
          {visibleAmenities.map((amenity) => {
            const active = selectedAmenities.includes(amenity);
            return (
              <Pressable key={amenity} style={styles.amenityRow} onPress={() => toggleAmenity(amenity)}>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={[styles.amenityText, isSidebar && styles.webSidebarAmenityText, { color: currentTheme.text }]}>{amenity}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.toggleAmenitiesBtn} onPress={() => setShowAllAmenities(value => !value)}>
          <Text style={styles.toggleAmenitiesText}>{showAllAmenities ? '^ Thu gọn' : 'Xem tất cả'}</Text>
        </Pressable>
      </View>

      {activeFilterCount > 0 && (
        <Pressable
          style={[styles.webResetFiltersBtn, { borderColor: currentTheme.border }]}
          onPress={() => { setSelectedHotelTypes([]); setSelectedAmenities([]); setMinPrice(DEFAULT_MIN_PRICE); setMaxPrice(DEFAULT_MAX_PRICE); }}
        >
          <Text style={[styles.resetBtnText, { color: currentTheme.text }]}>Đặt lại bộ lọc</Text>
        </Pressable>
      )}
    </>
  );

  const renderHotelList = () => (
    <FlatList
      style={isWebLayout && styles.webListWrap}
      data={loading ? Array(3).fill(null) : filteredHotels}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={[styles.list, isWebLayout && styles.webList]}
      showsVerticalScrollIndicator={isWebLayout}
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
  );

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      {/* Gradient BG */}
      <View style={[styles.gradientBg, isWebLayout && styles.webGradientBg]} />

      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={26} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>{params.title || 'Gần tôi'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Bar */}
      {isWebLayout ? (
        <View style={styles.webResultsLayout}>
          <View style={styles.webResultsColumn}>
            <View style={styles.webResultsTopBar}>
              <Text style={[styles.webCollectionTitle, { color: currentTheme.text }]}>
                {params.title || `Bộ sưu tập ${selectedBookingType}`}
              </Text>
              <Text style={styles.webResultCount}>{loading ? '...' : `${filteredHotels.length} khách sạn`}</Text>
              <View style={styles.webSortWrap}>
                <Pressable
                  style={[styles.webSortButton, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                  onPress={() => setShowSortModal(value => !value)}
                >
                  <Text style={[styles.webSortText, { color: currentTheme.text }]}>Sắp xếp: {selectedSortLabel}</Text>
                  <ChevronDown size={16} color={currentTheme.text} />
                </Pressable>
                {showSortModal && (
                  <View style={[styles.webSortMenu, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
                    {SORT_OPTIONS.map(opt => (
                      <Pressable
                        key={opt.id}
                        style={styles.webSortMenuRow}
                        onPress={() => { setSelectedSort(opt.id); setShowSortModal(false); }}
                      >
                        <Text style={[styles.webSortMenuText, { color: currentTheme.textSecondary }, selectedSort === opt.id && styles.webSortMenuTextActive]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {renderHotelList()}
          </View>

          <ScrollView
            style={[styles.webFilterSidebar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.webFilterSidebarContent}
          >
            <Text style={[styles.webSidebarTitle, { color: currentTheme.text }]}>Bộ lọc</Text>
            {renderFilterControls(true)}
          </ScrollView>
        </View>
      ) : (
        <>
          <View style={styles.filterPanel}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterBar}
              contentContainerStyle={styles.filterBarContent}
            >
              <Pressable style={[styles.filterChip, styles.filterChipPrimary, { backgroundColor: currentTheme.card }]} onPress={() => setShowSortModal(true)}>
                <View style={styles.filterIconBadge}>
                  <ArrowDownUp size={16} color={PRIMARY_DARK} />
                </View>
                <View style={styles.filterTextWrap}>
                  <Text style={styles.filterChipLabel}>Sắp xếp</Text>
                  <Text style={[styles.filterChipValue, { color: currentTheme.text }]} numberOfLines={1}>{selectedSortLabel}</Text>
                </View>
              </Pressable>
              <Pressable style={[styles.filterChip, styles.filterChipPrimary, activeFilterCount > 0 && styles.filterChipActive, { backgroundColor: currentTheme.card }]} onPress={() => setShowFilterModal(true)}>
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
            </ScrollView>
          </View>
          {renderHotelList()}
        </>
      )}

      {/* Sort Modal */}
      <Modal visible={!isWebLayout && showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
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
            {renderFilterControls()}
          </ScrollView>

          <View style={[styles.filterFooter, { borderTopColor: currentTheme.border, paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={[styles.resetBtn, { borderColor: currentTheme.border }]}
              onPress={() => { setSelectedHotelTypes([]); setSelectedAmenities([]); setMinPrice(DEFAULT_MIN_PRICE); setMaxPrice(DEFAULT_MAX_PRICE); }}
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
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

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
      <ImageWithFallback
        uri={hotel.image}
        style={[styles.hotelImage, isWebLayout && styles.webHotelImage]}
      />
      <View style={styles.hotelInfo}>
        <Text style={[styles.hotelName, isWebLayout && styles.webHotelName, { color: currentTheme.text }]} numberOfLines={1}>{hotel.name}</Text>
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
          <Text style={[styles.hotelPrice, isWebLayout && styles.webHotelPrice]}>{hotel.price}</Text>
          <Text style={styles.hotelUnit}>{hotel.unit}</Text>
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
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    backgroundColor: 'rgba(133,194,164,0.32)',
  },
  webGradientBg: {
    height: 170,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 10,
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
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
  filterPanel: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
    paddingTop: 12,
  },
  webFilterPanel: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginHorizontal: 0,
    marginTop: 10,
    marginBottom: 16,
  },
  webResultsLayout: {
    flex: 1,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 18,
    paddingLeft: 32,
    paddingRight: 38,
    paddingTop: 10,
    paddingBottom: 24,
  },
  webFilterSidebar: {
    width: '6cm' as any,
    flexShrink: 0,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'stretch',
    maxHeight: '100%',
  },
  webFilterSidebarContent: {
    padding: 8,
    paddingBottom: 14,
  },
  webSidebarTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  webSidebarSectionTitle: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  webFilterSectionBlock: {
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.18)',
  },
  webResetFiltersBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  webResultsColumn: {
    flex: 1,
    minWidth: 0,
  },
  webResultsTopBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    zIndex: 20,
  },
  webCollectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  webResultCount: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_DARK,
  },
  webSortWrap: {
    position: 'relative',
    zIndex: 30,
  },
  webSortButton: {
    minWidth: 300,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  webSortText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  webSortMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 300,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },
  webSortMenuRow: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  webSortMenuText: {
    fontSize: 15,
    fontWeight: '800',
  },
  webSortMenuTextActive: {
    color: '#f97316',
  },
  webSidebarPriceRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 6,
  },
  webSidebarPriceCard: {
    padding: 8,
    borderRadius: 12,
  },
  webSidebarPriceTrackRow: {
    marginBottom: 10,
  },
  webSidebarPriceInput: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  webSidebarPriceField: {
    fontSize: 12,
    lineHeight: 16,
  },
  webSidebarChip: {
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  webSidebarChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  webSidebarAmenityText: {
    fontSize: 12,
    lineHeight: 16,
  },
  filterPanelTitle: {
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  filterBar: { maxHeight: 72 },
  filterBarContent: { paddingHorizontal: 12, gap: 10, paddingBottom: 12 },
  filterChip: {
    minHeight: 48,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(133,194,164,0.45)',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 8, elevation: 2,
  },
  filterChipPrimary: { minWidth: 154 },
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
  filterChipValue: { fontSize: 13, fontWeight: '800', maxWidth: 120 },
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
  list: { padding: 16, gap: 12 },
  webListWrap: {
    flex: 1,
  },
  webList: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 52,
  },
  skeleton: {
    height: 100, backgroundColor: '#f3f4f6', borderRadius: 16,
    marginBottom: 12,
  },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 24 },
  hotelCard: {
    flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, marginBottom: 12, borderWidth: 1,
  },
  webHotelCard: {
    minHeight: 150,
    borderRadius: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  hotelImage: { width: 100, height: 100 },
  webHotelImage: { width: 190, height: 150 },
  hotelInfo: { flex: 1, padding: 12 },
  hotelName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  webHotelName: { fontSize: 17, marginBottom: 8 },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  hotelRating: { fontSize: 12, fontWeight: '700' },
  hotelReviews: { fontSize: 11, color: '#6b7280', flex: 1 },
  hotelTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(133,194,164,0.18)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(133,194,164,0.35)',
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6,
  },
  hotelTagText: { fontSize: 10, fontWeight: '700', color: '#599373' },
  hotelPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hotelPrice: { fontSize: 16, fontWeight: '700', color: PRIMARY_DARK },
  webHotelPrice: { fontSize: 20 },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  amenityList: { gap: 10, marginBottom: 8 },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 30 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: 'rgba(133,194,164,0.55)', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkboxMark: { color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  amenityText: { fontSize: 14, fontWeight: '500', flex: 1 },
  toggleAmenitiesBtn: { alignSelf: 'flex-start', marginBottom: 18, paddingVertical: 4 },
  toggleAmenitiesText: { color: PRIMARY_DARK, fontSize: 13, fontWeight: '800' },
  priceRangeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
    padding: 14,
    backgroundColor: '#fff',
  },
  priceTrackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  priceSlider: {
    height: PRICE_KNOB_SIZE,
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
    marginHorizontal: PRICE_KNOB_SIZE / 2,
  },
  priceTrack: {
    height: 4,
    width: '100%',
    backgroundColor: PRICE_TRACK_INACTIVE,
    borderRadius: 2,
  },
  priceTrackActive: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: PRICE_TRACK_ACTIVE,
  },
  priceKnob: {
    width: PRICE_KNOB_SIZE, height: PRICE_KNOB_SIZE, borderRadius: PRICE_KNOB_SIZE / 2, borderWidth: 2,
    borderColor: PRICE_TRACK_ACTIVE, backgroundColor: '#222728', alignItems: 'center', justifyContent: 'center',
  },
  priceKnobFloating: {
    position: 'absolute',
    top: 0,
    cursor: 'grab' as any,
    zIndex: 4,
  },
  priceKnobMax: { zIndex: 5 },
  priceKnobText: { color: '#f3efe8', fontSize: 20, lineHeight: 22, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceInput: {
    flex: 1, borderWidth: 1, borderRadius: 12, borderColor: '#d1d5db',
    padding: 12,
  },
  priceLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  priceField: { fontSize: 15, fontWeight: '700', padding: 0 },
  priceDash: { color: '#374151', fontSize: 18, fontWeight: '800' },
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
