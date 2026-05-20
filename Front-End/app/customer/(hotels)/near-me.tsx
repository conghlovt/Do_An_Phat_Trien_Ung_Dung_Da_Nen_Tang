import { styles } from '@/src/customer/components/hotels/nearMe.styles';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView,
  TextInput, Modal, FlatList, Platform, useWindowDimensions, PanResponder,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import {
  ChevronLeft, SlidersHorizontal, ArrowDownUp,
  ChevronDown, X,
} from 'lucide-react-native';
import HotelListCard from '@/src/customer/components/hotels/HotelListCard';
import { useCustomerHotelsStore } from '@/src/customer/store/hotels.store';
import {
  applyHotelListFilters,
  HOTEL_AMENITY_FILTERS,
  HOTEL_FILTER_TYPES,
} from '@/src/customer/utils/hotelListFilters';
import {
  CUSTOMER_PRIMARY_DARK as PRIMARY_DARK,
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  NEAR_ME_SORT_OPTIONS,
  type NearMeSortOption,
  PRICE_KNOB_SIZE,
  PRICE_MAX_LIMIT,
  PRICE_MIN_LIMIT,
} from '@/src/customer/constants/hotelFilters';
import { BOOKING_TYPES } from '@/src/customer/utils/booking';
import {
  clamp,
  formatPriceInput,
  getPriceNumber,
  normalizePrice,
  sanitizePriceInput,
} from '@/src/customer/utils/priceFilters';

export default function NearMeScreen() {
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{ bookingType: string; title: string; lock: string }>();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const [selectedSort, setSelectedSort] = useState<NearMeSortOption>('relevant');
  const [selectedBookingType, setSelectedBookingType] = useState(params.bookingType || 'Theo giờ');
  const lockBookingType = params.lock === '1';

  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBookingTypeModal, setShowBookingTypeModal] = useState(false);

  const { hotels, hotelsLoading: loading, fetchHotels } = useCustomerHotelsStore();

  // Filter states
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [priceTrackWidth, setPriceTrackWidth] = useState(0);

  useEffect(() => {
    const apiSort: 'relevant' | 'rating' | 'price-asc' | 'price-desc' =
      selectedSort === 'distance' ? 'relevant' : selectedSort;
    void fetchHotels({
      sort: apiSort,
      tag: selectedBookingType,
      limit: 20,
      roomAmenities: selectedAmenities.join(',') || undefined,
    });
  }, [fetchHotels, selectedSort, selectedBookingType, selectedAmenities]);

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

  const selectedSortLabel = NEAR_ME_SORT_OPTIONS.find(option => option.id === selectedSort)?.label || 'Phù hợp nhất';
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
        <Text style={[styles.filterSection, isSidebar && styles.webSidebarSectionTitle, { color: currentTheme.text }]}>Tiện ích phòng</Text>
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
                    {NEAR_ME_SORT_OPTIONS.map(opt => (
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
          {NEAR_ME_SORT_OPTIONS.map(opt => (
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
