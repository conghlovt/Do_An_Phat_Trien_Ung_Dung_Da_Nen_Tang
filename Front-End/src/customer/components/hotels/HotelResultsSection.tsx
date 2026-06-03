import React from 'react';
import { Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { ArrowUpDown, SlidersHorizontal, Star } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { BOOKING_TYPES } from '@/src/customer/utils/booking/booking';
import type { BookingType, HotelPropertyType } from '@/src/customer/types/hotels';
import {
  CUSTOMER_PRIMARY,
  NEAR_ME_SORT_OPTIONS,
  PRICE_KNOB_SIZE,
  PRICE_MAX_LIMIT,
  PRICE_MIN_LIMIT,
  type NearMeSortOption,
} from '@/src/customer/constants/hotels/hotelFilters';
import {
  HOTEL_CLEANLINESS_FILTERS,
  HOTEL_AMENITY_FILTERS,
  HOTEL_PROPERTY_TYPE_FILTERS,
  HOTEL_RATING_FILTERS,
} from '@/src/customer/utils/hotels/hotelListFilters';
import { clamp, formatPriceInput, getPriceNumber, normalizePrice, sanitizePriceInput } from '@/src/customer/utils/hotels/priceFilters';

interface HotelResultsSectionProps {
  activeFilterCount: number;
  collectionTitle: string;
  filteredCount: number;
  loading: boolean;
  maxPrice: string;
  minPrice: string;
  onBookingTypeChange: (value: BookingType) => void;
  onCleanlinessRatingChange: (value?: number) => void;
  onMaxPriceChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onRatingChange: (value?: number) => void;
  onResetFilters: () => void;
  onSortChange: (value: NearMeSortOption) => void;
  renderHotelList: () => React.ReactNode;
  selectedAmenities: string[];
  selectedBookingType?: BookingType;
  selectedCleanlinessRating?: number;
  selectedHotelTypes: HotelPropertyType[];
  selectedRating?: number;
  selectedSort: NearMeSortOption;
  setSelectedAmenities: (value: string[]) => void;
  setSelectedHotelTypes: (value: HotelPropertyType[]) => void;
  showBookingType?: boolean;
  showCollectionTitle?: boolean;
  styles?: Record<string, unknown>;
}

interface PriceRangeSliderProps {
  maxPrice: string;
  minPrice: string;
  onMaxPriceChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
}

function PriceRangeSlider({
  maxPrice,
  minPrice,
  onMaxPriceChange,
  onMinPriceChange,
}: PriceRangeSliderProps) {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const activeThumbRef = React.useRef<'min' | 'max'>('min');
  const range = PRICE_MAX_LIMIT - PRICE_MIN_LIMIT;
  const parsedMin = getPriceNumber(minPrice, PRICE_MIN_LIMIT);
  const parsedMax = getPriceNumber(maxPrice, PRICE_MAX_LIMIT);
  const currentMin = Math.min(parsedMin, parsedMax);
  const currentMax = Math.max(parsedMin, parsedMax);
  const minPercent = ((currentMin - PRICE_MIN_LIMIT) / range) * 100;
  const maxPercent = ((currentMax - PRICE_MIN_LIMIT) / range) * 100;
  const formatCompactPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

  const updateThumbByPosition = React.useCallback((x: number, thumb = activeThumbRef.current) => {
    if (!trackWidth) return;
    const position = clamp(x, 0, trackWidth);
    const next = normalizePrice(PRICE_MIN_LIMIT + (position / trackWidth) * range);
    if (thumb === 'min') {
      onMinPriceChange(String(Math.min(next, currentMax)));
      return;
    }
    onMaxPriceChange(String(Math.max(next, currentMin)));
  }, [currentMax, currentMin, onMaxPriceChange, onMinPriceChange, range, trackWidth]);

  const activateNearestThumb = React.useCallback((x: number) => {
    if (!trackWidth) return;
    const position = clamp(x, 0, trackWidth);
    const next = normalizePrice(PRICE_MIN_LIMIT + (position / trackWidth) * range);
    const minDistance = Math.abs(next - currentMin);
    const maxDistance = Math.abs(next - currentMax);
    activeThumbRef.current = minDistance <= maxDistance ? 'min' : 'max';
    updateThumbByPosition(position, activeThumbRef.current);
  }, [currentMax, currentMin, range, trackWidth, updateThumbByPosition]);

  const sliderResponder = React.useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => activateNearestThumb(event.nativeEvent.locationX),
      onPanResponderMove: (event) => updateThumbByPosition(event.nativeEvent.locationX),
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
    }),
    [activateNearestThumb, updateThumbByPosition],
  );

  return (
    <View style={sectionStyles.rangeBlock}>
      <View style={sectionStyles.rangeLabels}>
        <Text style={sectionStyles.rangeLabel}>{formatCompactPrice(currentMin)}</Text>
        <Text style={sectionStyles.rangeLabel}>{formatCompactPrice(currentMax)}</Text>
      </View>
      <View
        {...sliderResponder.panHandlers}
        style={sectionStyles.rangeSlider}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View style={sectionStyles.rangeTrack} />
        <View
          style={[
            sectionStyles.rangeTrackActive,
            {
              left: `${minPercent}%`,
              width: `${Math.max(maxPercent - minPercent, 0)}%`,
            },
          ]}
        />
        <View
          style={[sectionStyles.rangeThumb, { left: `${minPercent}%` }]}
        />
        <View
          style={[sectionStyles.rangeThumb, sectionStyles.rangeThumbMax, { left: `${maxPercent}%` }]}
        />
      </View>
    </View>
  );
}

export default function HotelResultsSection({
  activeFilterCount,
  collectionTitle,
  filteredCount,
  loading,
  maxPrice,
  minPrice,
  onBookingTypeChange,
  onCleanlinessRatingChange,
  onMaxPriceChange,
  onMinPriceChange,
  onRatingChange,
  onResetFilters,
  onSortChange,
  renderHotelList,
  selectedAmenities,
  selectedBookingType,
  selectedCleanlinessRating,
  selectedHotelTypes,
  selectedRating,
  selectedSort,
  setSelectedAmenities,
  setSelectedHotelTypes,
  showBookingType = true,
  showCollectionTitle = true,
}: HotelResultsSectionProps) {
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [sortVisible, setSortVisible] = React.useState(false);
  const selectedSortLabel = NEAR_ME_SORT_OPTIONS.find((option) => option.id === selectedSort)?.label;

  const toggleValue = <T extends string>(
    value: T,
    selectedValues: T[],
    updateSelectedValues: (values: T[]) => void,
  ) => {
    updateSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  const handleResetFilters = () => {
    onResetFilters();
    setFilterVisible(false);
  };

  const renderFilterFields = () => (
    <>
      <Text style={[sectionStyles.filterSectionTitle, { color: currentTheme.text }]}>Khoảng giá</Text>
      <PriceRangeSlider
        maxPrice={maxPrice}
        minPrice={minPrice}
        onMaxPriceChange={onMaxPriceChange}
        onMinPriceChange={onMinPriceChange}
      />
      <View style={[sectionStyles.priceRow, isWebLayout && sectionStyles.webPriceRow]}>
        <View style={[sectionStyles.priceInputWrap, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}>
          <Text style={[sectionStyles.priceLabel, { color: currentTheme.textSecondary }]}>Từ</Text>
          <TextInput
            value={formatPriceInput(minPrice)}
            onChangeText={(value) => onMinPriceChange(sanitizePriceInput(value))}
            keyboardType="numeric"
            placeholder="Giá thấp nhất"
            placeholderTextColor={currentTheme.textSecondary}
            style={[sectionStyles.priceInput, { color: currentTheme.text }]}
          />
        </View>
        <View style={[sectionStyles.priceInputWrap, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}>
          <Text style={[sectionStyles.priceLabel, { color: currentTheme.textSecondary }]}>Đến</Text>
          <TextInput
            value={formatPriceInput(maxPrice)}
            onChangeText={(value) => onMaxPriceChange(sanitizePriceInput(value))}
            keyboardType="numeric"
            placeholder="Giá cao nhất"
            placeholderTextColor={currentTheme.textSecondary}
            style={[sectionStyles.priceInput, { color: currentTheme.text }]}
          />
        </View>
      </View>

      <Text style={[sectionStyles.filterSectionTitle, { color: currentTheme.text }]}>Điểm đánh giá</Text>
      <View style={sectionStyles.wrapRow}>
        {HOTEL_RATING_FILTERS.map((option) => {
          const active = selectedRating === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onRatingChange(active ? undefined : option.value)}
              style={[
                sectionStyles.ratingChip,
                { backgroundColor: active ? CUSTOMER_PRIMARY : currentTheme.background },
              ]}
            >
              <Text style={[sectionStyles.ratingChipText, { color: active ? '#ffffff' : currentTheme.text }]}>
                {option.label}
              </Text>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
            </Pressable>
          );
        })}
      </View>

      <View style={[sectionStyles.filterDivider, { backgroundColor: currentTheme.border }]} />

      <Text style={[sectionStyles.filterSectionTitle, { color: currentTheme.text }]}>Sạch sẽ</Text>
      <View style={sectionStyles.wrapRow}>
        {HOTEL_CLEANLINESS_FILTERS.map((option) => {
          const active = selectedCleanlinessRating === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onCleanlinessRatingChange(active ? undefined : option.value)}
              style={[
                sectionStyles.ratingChip,
                { backgroundColor: active ? CUSTOMER_PRIMARY : currentTheme.background },
              ]}
            >
              <Text style={[sectionStyles.ratingChipText, { color: active ? '#ffffff' : currentTheme.text }]}>
                {option.label}
              </Text>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
            </Pressable>
          );
        })}
      </View>

      <Text style={[sectionStyles.filterSectionTitle, { color: currentTheme.text }]}>Loại khách sạn</Text>
      <View style={sectionStyles.wrapRow}>
        <Pressable
          onPress={() => setSelectedHotelTypes([])}
          style={[
            sectionStyles.modalChip,
            { borderColor: currentTheme.border },
            selectedHotelTypes.length === 0 && sectionStyles.modalChipActive,
          ]}
        >
          <Text
            style={[
              sectionStyles.modalChipText,
              { color: selectedHotelTypes.length === 0 ? '#ffffff' : currentTheme.textSecondary },
            ]}
          >
            Tất cả
          </Text>
        </Pressable>
        {HOTEL_PROPERTY_TYPE_FILTERS.map((type) => {
          const active = selectedHotelTypes.includes(type.id);
          return (
            <Pressable
              key={type.id}
              onPress={() => setSelectedHotelTypes(active ? [] : [type.id])}
              style={[
                sectionStyles.modalChip,
                { borderColor: currentTheme.border },
                active && sectionStyles.modalChipActive,
              ]}
            >
              <Text style={[sectionStyles.modalChipText, { color: active ? '#ffffff' : currentTheme.textSecondary }]}>
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[sectionStyles.filterSectionTitle, { color: currentTheme.text }]}>Tiện nghi</Text>
      <View style={sectionStyles.amenityList}>
        {HOTEL_AMENITY_FILTERS.map((amenity) => {
          const active = selectedAmenities.includes(amenity);
          return (
            <Pressable
              key={amenity}
              onPress={() => toggleValue(amenity, selectedAmenities, setSelectedAmenities)}
              style={sectionStyles.amenityRow}
            >
              <View style={[sectionStyles.checkbox, active && sectionStyles.checkboxActive]}>
                {active && <Text style={sectionStyles.checkboxMark}>✓</Text>}
              </View>
              <Text style={[sectionStyles.amenityText, { color: currentTheme.text }]}>{amenity}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={sectionStyles.container}>
      <View style={[sectionStyles.resultsLayout, isWebLayout && sectionStyles.webResultsLayout]}>
        <View style={[sectionStyles.resultsMain, isWebLayout && sectionStyles.webResultsMain]}>
          {showBookingType && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={sectionStyles.chipScroller}
              contentContainerStyle={[sectionStyles.chipRow, isWebLayout && sectionStyles.webChipRow]}
            >
              {BOOKING_TYPES.map((type) => {
                const active = selectedBookingType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => onBookingTypeChange(type)}
                    style={[sectionStyles.chip, { borderColor: currentTheme.border }, active && sectionStyles.chipActive]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[sectionStyles.chipText, { color: active ? '#ffffff' : currentTheme.textSecondary }]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={[sectionStyles.header, isWebLayout && sectionStyles.webHeader]}>
            <View style={sectionStyles.headerTextBlock}>
              {showCollectionTitle && (
                <Text style={[sectionStyles.title, { color: currentTheme.text }]} numberOfLines={1}>
                  {collectionTitle}
                </Text>
              )}
              <Text style={[sectionStyles.subtitle, { color: currentTheme.textSecondary }]}>
                {loading ? 'Đang tải khách sạn...' : `${filteredCount} khách sạn phù hợp`}
              </Text>
            </View>
            <View style={[sectionStyles.actionGroup, isWebLayout && sectionStyles.webActionGroup]}>
              <Pressable
                style={[sectionStyles.actionBtn, { borderColor: currentTheme.border }]}
                onPress={() => setSortVisible((visible) => !visible)}
              >
                <ArrowUpDown size={16} color={currentTheme.text} />
                <Text
                  numberOfLines={isWebLayout ? 2 : 1}
                  style={[sectionStyles.actionText, isWebLayout && sectionStyles.webActionText, { color: currentTheme.text }]}
                >
                  {isWebLayout && selectedSortLabel
                    ? `Sắp xếp: ${selectedSortLabel}`
                    : 'Sắp xếp'}
                </Text>
              </Pressable>
              {sortVisible && (
                <View
                  style={[
                    sectionStyles.sortDropdown,
                    {
                      backgroundColor: currentTheme.card,
                      borderColor: currentTheme.border,
                    },
                  ]}
                >
                  {NEAR_ME_SORT_OPTIONS.map((option) => {
                    const active = selectedSort === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          onSortChange(option.id);
                          setSortVisible(false);
                        }}
                        style={[sectionStyles.dropdownRow, { borderColor: currentTheme.border }]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[sectionStyles.dropdownText, { color: active ? CUSTOMER_PRIMARY : currentTheme.text }]}
                        >
                          {option.label}
                        </Text>
                        {active && <Text style={sectionStyles.dropdownCheck}>✓</Text>}
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {!isWebLayout && (
                <Pressable
                  style={[sectionStyles.actionBtn, { borderColor: currentTheme.border }]}
                  onPress={() => {
                    setSortVisible(false);
                    setFilterVisible(true);
                  }}
                >
                  <SlidersHorizontal size={16} color={activeFilterCount > 0 ? CUSTOMER_PRIMARY : currentTheme.textSecondary} />
                  <Text style={[sectionStyles.actionText, { color: activeFilterCount > 0 ? CUSTOMER_PRIMARY : currentTheme.textSecondary }]}>
                    {activeFilterCount > 0 ? `Lọc (${activeFilterCount})` : 'Lọc'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={sectionStyles.listWrap}>{renderHotelList()}</View>
        </View>

        {isWebLayout && (
          <View style={[sectionStyles.webFilterPanel, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <View style={sectionStyles.webFilterHeader}>
              <View style={sectionStyles.webFilterTitleRow}>
                <SlidersHorizontal size={17} color={CUSTOMER_PRIMARY} />
                <Text style={[sectionStyles.webFilterTitle, { color: currentTheme.text }]}>Lọc</Text>
              </View>
              <Pressable onPress={onResetFilters} style={[sectionStyles.webResetBtn, { borderColor: currentTheme.border }]}>
                <Text style={[sectionStyles.webResetText, { color: currentTheme.textSecondary }]}>Đặt lại</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sectionStyles.webFilterContent}>
              {renderFilterFields()}
            </ScrollView>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={sectionStyles.modalOverlay}>
          <View style={[sectionStyles.filterSheet, { backgroundColor: currentTheme.background }]}>
            <View style={[sectionStyles.filterHeader, { borderColor: currentTheme.border }]}>
              <Text style={[sectionStyles.filterTitle, { color: currentTheme.text }]}>Lọc</Text>
              <Pressable onPress={() => setFilterVisible(false)} style={sectionStyles.closeBtn}>
                <Text style={[sectionStyles.closeText, { color: currentTheme.textSecondary }]}>Đóng</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={sectionStyles.filterContent}>
              {renderFilterFields()}
            </ScrollView>

            <View style={[sectionStyles.filterFooter, { borderColor: currentTheme.border }]}>
              <Pressable style={[sectionStyles.footerBtn, { borderColor: currentTheme.border }]} onPress={handleResetFilters}>
                <Text style={[sectionStyles.footerBtnText, { color: currentTheme.textSecondary }]}>Đặt lại</Text>
              </Pressable>
              <Pressable style={[sectionStyles.applyBtn]} onPress={() => setFilterVisible(false)}>
                <Text style={sectionStyles.applyBtnText}>Áp dụng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsLayout: {
    flex: 1,
  },
  webResultsLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
    paddingRight: 26,
  },
  resultsMain: {
    flex: 1,
    minWidth: 0,
  },
  webResultsMain: {
    paddingLeft: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 0,
    paddingBottom: 10,
    zIndex: 20,
  },
  webHeader: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
  },
  actionGroup: {
    width: 300,
    maxWidth: '58%' as any,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    position: 'relative',
    zIndex: 30,
  },
  webActionGroup: {
    width: 310,
    maxWidth: 310,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  actionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '800',
  },
  webActionText: {
    lineHeight: 17,
  },
  sortDropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 300,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 50,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
  dropdownRow: {
    minHeight: 44,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  dropdownCheck: {
    color: CUSTOMER_PRIMARY,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '900',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 10,
  },
  webChipRow: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  chipScroller: {
    flexGrow: 0,
    maxHeight: 48,
  },
  chip: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  chipActive: {
    backgroundColor: CUSTOMER_PRIMARY,
    borderColor: CUSTOMER_PRIMARY,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  listWrap: {
    flex: 1,
  },
  webFilterPanel: {
    width: 300,
    flexShrink: 0,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  webFilterHeader: {
    minHeight: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  webFilterTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  webFilterTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  webResetBtn: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webResetText: {
    fontSize: 12,
    fontWeight: '800',
  },
  webFilterContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.38)',
  },
  filterSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  filterHeader: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  filterSectionTitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '900',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalChip: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  modalChipActive: {
    backgroundColor: CUSTOMER_PRIMARY,
    borderColor: CUSTOMER_PRIMARY,
  },
  modalChipText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  ratingChip: {
    minHeight: 52,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ratingChipText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  filterDivider: {
    height: 1,
    marginTop: 8,
    marginBottom: 22,
  },
  rangeBlock: {
    marginBottom: 14,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  rangeLabel: {
    color: CUSTOMER_PRIMARY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  rangeSlider: {
    height: PRICE_KNOB_SIZE,
    justifyContent: 'center',
    marginHorizontal: PRICE_KNOB_SIZE / 2,
    position: 'relative',
  },
  rangePressable: {
    position: 'absolute',
    left: -PRICE_KNOB_SIZE / 2,
    right: -PRICE_KNOB_SIZE / 2,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  rangeTrack: {
    height: 7,
    width: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(65,70,71,0.25)',
    zIndex: 2,
  },
  rangeTrackActive: {
    position: 'absolute',
    height: 7,
    borderRadius: 4,
    backgroundColor: CUSTOMER_PRIMARY,
    zIndex: 3,
  },
  rangeThumb: {
    position: 'absolute',
    top: 0,
    width: PRICE_KNOB_SIZE,
    height: PRICE_KNOB_SIZE,
    marginLeft: -PRICE_KNOB_SIZE / 2,
    borderRadius: PRICE_KNOB_SIZE / 2,
    borderWidth: 2,
    borderColor: CUSTOMER_PRIMARY,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    cursor: 'grab' as any,
    zIndex: 4,
  },
  rangeThumbMax: {
    zIndex: 5,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  webPriceRow: {
    flexDirection: 'column',
    gap: 8,
  },
  priceInputWrap: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceLabel: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: '800',
  },
  priceInput: {
    padding: 0,
    fontSize: 14,
    fontWeight: '800',
  },
  amenityList: {
    gap: 10,
  },
  amenityRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: CUSTOMER_PRIMARY,
    borderColor: CUSTOMER_PRIMARY,
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  },
  amenityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  applyBtn: {
    flex: 2,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CUSTOMER_PRIMARY,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
